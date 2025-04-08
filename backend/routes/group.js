const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const auth = require("../middleware/auth");

// Create group
router.post("/groups", auth, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const group = await Group.create({
      name,
      createdBy: userId,
      members: [userId],
    });

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: "Error creating group", details: err });
  }
});

// Join group
router.patch("/groups/:id/join", auth, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    res.status(200).json({ message: "Joined successfully", group });
  } catch (err) {
    res.status(500).json({ error: "Error joining group", details: err });
  }
});

// Fetch joined groups
router.get("/groups", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await Group.find({ members: userId }).populate("members", "name email");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: "Error fetching groups", details: err });
  }
});

module.exports = router;
