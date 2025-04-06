
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Loader2, Save, Check, Send } from "lucide-react";

interface MoodAnalysis {
  mood: string;
  score: number;
  energy: number;
  sentimentScore: number;
  emotional_state: string;
  detected_emotions: string[];
}

const CheckInPage = () => {
  const [selectedTab, setSelectedTab] = useState("voice");
  const [moodScore, setMoodScore] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [textInput, setTextInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingText, setIsSubmittingText] = useState(false);
  const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle when voice analysis is complete
  const handleAnalysisComplete = (result: MoodAnalysis) => {
    setAnalysis(result);
  };

  // Submit the mood check-in (after voice analysis)
  const submitCheckIn = async () => {
    if (!analysis) return;
    
    setIsSubmitting(true);
    
    try {
      await api.post('/mood/check-in', {
        mood: analysis.mood,
        moodScore: analysis.score,
        energyLevel: analysis.energy,
        emotionalState: analysis.emotional_state,
        detectedEmotions: analysis.detected_emotions,
        sentimentScore: analysis.sentimentScore,
        method: 'voice'
      });
      
      toast({
        title: "Check-in recorded",
        description: "Your mood has been logged successfully. Check your recommendations!",
      });
      
      // Navigate to dashboard after successful check-in
      navigate('/');
    } catch (error) {
      console.error('Error saving check-in:', error);
      toast({
        title: "Error",
        description: "Failed to save your mood check-in",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit manual text check-in
  const submitTextCheckIn = async () => {
    if (!textInput.trim()) {
      toast({
        title: "Text required",
        description: "Please enter some text about how you're feeling",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingText(true);
    
    try {
      // First, analyze the text
      const analysisResponse = await api.post('/mood/analyze-text', {
        text: textInput
      });
      
      // Then, save the check-in
      await api.post('/mood/check-in', {
        mood: analysisResponse.data.mood,
        moodScore: moodScore,
        energyLevel: energyLevel,
        emotionalState: analysisResponse.data.emotional_state,
        detectedEmotions: analysisResponse.data.detected_emotions,
        sentimentScore: analysisResponse.data.sentimentScore,
        method: 'text',
        text: textInput
      });
      
      toast({
        title: "Check-in recorded",
        description: "Your mood has been logged successfully. Check your recommendations!",
      });
      
      // Navigate to dashboard after successful check-in
      navigate('/');
    } catch (error) {
      console.error('Error with text check-in:', error);
      toast({
        title: "Error",
        description: "Failed to analyze or save your mood check-in",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingText(false);
    }
  };

  // Get the mood description based on the mood score
  const getMoodDescription = (score: number) => {
    if (score <= 2) return "Feeling low";
    if (score <= 4) return "A bit down";
    if (score <= 6) return "Neutral";
    if (score <= 8) return "Pretty good";
    return "Excellent";
  };

  // Get the energy description based on the energy level
  const getEnergyDescription = (level: number) => {
    if (level <= 2) return "Very low energy";
    if (level <= 4) return "Somewhat tired";
    if (level <= 6) return "Moderate energy";
    if (level <= 8) return "Energetic";
    return "Very high energy";
  };

  return (
    <DashboardLayout pageTitle="Daily Check-in">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">How are you feeling today?</CardTitle>
            <CardDescription>
              Share your emotions to get personalized recommendations and track your mental well-being
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="voice">Voice Check-in</TabsTrigger>
                <TabsTrigger value="text">Text Check-in</TabsTrigger>
              </TabsList>
              
              <TabsContent value="voice" className="pt-6">
                {!analysis ? (
                  <div className="space-y-6">
                    <div className="text-center text-gray-600 mb-6">
                      <p>Speak about how you're feeling today. Our AI will analyze your voice and detect your emotions.</p>
                    </div>
                    <VoiceRecorder onAnalysisComplete={handleAnalysisComplete} />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-wellness-green-light/20 rounded-lg p-4">
                      <h3 className="font-semibold text-wellness-green-dark text-lg mb-2">Your Mood Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            <span className="font-medium">Current Mood:</span> {analysis.mood}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Emotional State:</span> {analysis.emotional_state}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Mood Score:</span> {analysis.score}/10
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            <span className="font-medium">Energy Level:</span> {analysis.energy}/10
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Detected Emotions:</span> {analysis.detected_emotions.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button
                        onClick={submitCheckIn}
                        disabled={isSubmitting}
                        className="bg-wellness-green hover:bg-wellness-green-dark text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Save Check-in
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="text" className="pt-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe how you're feeling today
                  </label>
                  <Textarea
                    placeholder="Today I feel..."
                    className="h-32 resize-none"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Mood Score: {moodScore}/10
                      </label>
                      <span className="text-sm text-gray-500">
                        {getMoodDescription(moodScore)}
                      </span>
                    </div>
                    <Slider
                      value={[moodScore]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(value) => setMoodScore(value[0])}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Energy Level: {energyLevel}/10
                      </label>
                      <span className="text-sm text-gray-500">
                        {getEnergyDescription(energyLevel)}
                      </span>
                    </div>
                    <Slider
                      value={[energyLevel]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(value) => setEnergyLevel(value[0])}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button
                    onClick={submitTextCheckIn}
                    disabled={isSubmittingText || !textInput.trim()}
                    className="bg-wellness-green hover:bg-wellness-green-dark text-white"
                  >
                    {isSubmittingText ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Check-in
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <p className="text-sm text-gray-500 text-center max-w-md">
              Your check-ins help us understand your emotional patterns and provide better recommendations for your well-being.
            </p>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CheckInPage;
