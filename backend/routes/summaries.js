
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Summary = require('../models/Summary');
const CheckIn = require('../models/CheckIn');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const { cloudinary } = require('../config/cloudinary');
const os = require('os');

// @route   GET api/summaries
// @desc    Get user's summaries
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const summaries = await Summary.find({ user: req.user.id })
      .sort({ date: -1 });

    res.json(summaries);
  } catch (err) {
    console.error('Error fetching summaries:', err);
    res.status(500).json({ message: 'Error fetching summaries' });
  }
});

// @route   POST api/summaries/generate
// @desc    Generate a new summary
// @access  Private
router.post('/generate', auth, async (req, res) => {
  try {
    // Get check-ins from the last 7 days
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);

    const checkIns = await CheckIn.find({
      user: req.user.id,
      createdAt: { $gte: lastWeekDate }
    }).sort({ createdAt: 1 });

    if (checkIns.length === 0) {
      return res.status(400).json({ message: 'Not enough check-ins to generate a summary' });
    }

    // Generate unique filename
    const filename = `summary-${req.user.id}-${Date.now()}.pdf`;
    const filepath = path.join(os.tmpdir(), filename);

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Pipe the PDF to a file
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Get AI insights from the Python service
    let insights = 'Weekly insights not available.';
    let recommendations = 'Weekly recommendations not available.';

    try {
      const response = await axios.post(`${process.env.AI_SERVICE_URL}/generate-summary`, {
        checkIns: checkIns.map(checkIn => ({
          mood: checkIn.mood,
          moodScore: checkIn.moodScore,
          energyLevel: checkIn.energyLevel,
          emotionalState: checkIn.emotionalState,
          detectedEmotions: checkIn.detectedEmotions,
          sentimentScore: checkIn.sentimentScore,
          createdAt: checkIn.createdAt
        }))
      });

      if (response.data.insights) {
        insights = response.data.insights;
      }

      if (response.data.recommendations) {
        recommendations = response.data.recommendations;
      }
    } catch (err) {
      console.error('Error getting AI insights:', err);
    }

    // Add content to the PDF
    doc.fontSize(25).font('Helvetica-Bold').text('MoodBloom Weekly Summary', {
      align: 'center'
    });

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Generated on ${dateFormatter.format(new Date())}`, {
      align: 'center'
    });

    doc.moveDown();
    doc.fontSize(18).font('Helvetica-Bold').text('Your Week in Moods');
    doc.moveDown(0.5);

    // Add mood data
    checkIns.forEach(checkIn => {
      const date = dateFormatter.format(new Date(checkIn.createdAt));
      doc.fontSize(14).font('Helvetica-Bold').text(date);
      doc.fontSize(12).font('Helvetica').text(`Mood: ${checkIn.mood}`);
      doc.fontSize(12).font('Helvetica').text(`Mood Score: ${checkIn.moodScore}/10`);
      doc.fontSize(12).font('Helvetica').text(`Energy Level: ${checkIn.energyLevel}/10`);
      doc.fontSize(12).font('Helvetica').text(`Emotional State: ${checkIn.emotionalState}`);
      doc.fontSize(12).font('Helvetica').text(`Detected Emotions: ${checkIn.detectedEmotions.join(', ')}`);
      doc.moveDown();
    });

    // Add insights
    doc.moveDown();
    doc.fontSize(18).font('Helvetica-Bold').text('Insights');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(insights);

    // Add recommendations
    doc.moveDown();
    doc.fontSize(18).font('Helvetica-Bold').text('Recommendations');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(recommendations);

    // Finalize the PDF
    doc.end();

    // Wait for the file to be written
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filepath, {
      folder: 'mood-rx/summaries',
      resource_type: 'auto',
      public_id: path.parse(filename).name,
      format: 'pdf'
    });

    // Clean up local file
    fs.unlinkSync(filepath);

    // Create new summary
    const summary = new Summary({
      user: req.user.id,
      date: new Date(),
      available: true,
      url: result.secure_url,
      pdfPath: result.public_id, // Storing public_id instead of local path
      checkIns: checkIns.map(checkIn => checkIn._id),
      insights,
      recommendations
    });

    await summary.save();

    res.json(summary);
  } catch (err) {
    console.error('Error generating summary:', err);
    res.status(500).json({ message: 'Error generating summary' });
  }
});

module.exports = router;
