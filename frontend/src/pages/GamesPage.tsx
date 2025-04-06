
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { BreathingGame } from "@/components/games/BreathingGame";
import { MemoryGame } from "@/components/games/MemoryGame";
import { ColorRelaxGame } from "@/components/games/ColorRelaxGame";
import { Badge } from "@/components/ui/badge";

interface MoodData {
  mood: string;
  moodScore: number;
  energyLevel: number;
  emotionalState: string;
  detectedEmotions: string[];
}

const GamesPage = () => {
  const [loading, setLoading] = useState(true);
  const [latestMood, setLatestMood] = useState<MoodData | null>(null);
  const [recommendedGame, setRecommendedGame] = useState<string>("breathing");
  const { toast } = useToast();

  useEffect(() => {
    fetchLatestMood();
  }, []);

  const fetchLatestMood = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/mood/history?limit=1");
      
      if (response.data && response.data.length > 0) {
        const mood = response.data[0];
        setLatestMood({
          mood: mood.mood,
          moodScore: mood.moodScore,
          energyLevel: mood.energyLevel,
          emotionalState: mood.emotionalState,
          detectedEmotions: mood.detectedEmotions,
        });
        
        // Recommend a game based on mood data
        recommendGameBasedOnMood(mood);
      }
    } catch (error) {
      console.error("Error fetching mood data:", error);
      // Set a default recommendation if we can't get mood data
      setRecommendedGame("breathing");
    } finally {
      setLoading(false);
    }
  };

  const recommendGameBasedOnMood = (mood: MoodData) => {
    // Simple recommendation logic based on mood data
    if (mood.moodScore < 4) {
      // For low mood, recommend color relaxation
      setRecommendedGame("color");
    } else if (mood.energyLevel < 4) {
      // For low energy, recommend breathing exercise
      setRecommendedGame("breathing");
    } else if (mood.detectedEmotions.some(e => 
      ["anxious", "stressed", "worried", "tense", "nervous"].includes(e.toLowerCase())
    )) {
      // For anxiety/stress, recommend breathing
      setRecommendedGame("breathing");
    } else if (mood.detectedEmotions.some(e => 
      ["sad", "down", "depressed", "unhappy"].includes(e.toLowerCase())
    )) {
      // For sad emotions, recommend color game
      setRecommendedGame("color");
    } else {
      // Default to memory game for concentration
      setRecommendedGame("memory");
    }
  };

  const awardTokens = async (amount: number, game: string) => {
    try {
      await api.post("/api/tokens", {
        amount,
        type: "earned",
        source: "community",
        description: `Completed ${game} game`
      });
      
      toast({
        title: "Tokens Earned!",
        description: `You earned ${amount} tokens for playing the ${game} game.`,
      });
    } catch (error) {
      console.error("Error awarding tokens:", error);
    }
  };

  const handleGameComplete = (game: string, score?: number) => {
    // Award tokens based on game and score
    let tokensToAward = 5; // Base amount
    
    if (score && score > 80) {
      tokensToAward += 3; // Bonus for high score
    }
    
    awardTokens(tokensToAward, game);
  };

  return (
    <DashboardLayout pageTitle="Stress Relief Games">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-wellness-green-dark mb-2">
            Mini-Games for Stress Relief
          </h2>
          <p className="text-gray-600">
            Take a break and reduce stress with these simple mindfulness games. 
            Playing these games can help improve your focus and emotional state.
          </p>
        </div>

        {latestMood && (
          <Card className="bg-wellness-green-light/10 border-wellness-green-light">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-wellness-green-dark">
                    Based on your latest check-in
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    You felt <span className="font-medium">{latestMood.mood}</span> 
                    {latestMood.detectedEmotions.length > 0 && (
                      <> with emotions like <span className="font-medium">
                        {latestMood.detectedEmotions.slice(0, 2).join(", ")}
                      </span></>
                    )}
                  </p>
                </div>
                <div>
                  <Badge variant="outline" className="bg-wellness-green/10 text-wellness-green-dark border-wellness-green">
                    Recommended: {recommendedGame === "breathing" ? "Breathing Exercise" : 
                      recommendedGame === "memory" ? "Memory Match" : "Color Relaxation"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue={recommendedGame} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="breathing">Breathing Exercise</TabsTrigger>
            <TabsTrigger value="memory">Memory Match</TabsTrigger>
            <TabsTrigger value="color">Color Relaxation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="breathing">
            <BreathingGame onComplete={() => handleGameComplete("breathing")} />
          </TabsContent>
          
          <TabsContent value="memory">
            <MemoryGame onComplete={(score) => handleGameComplete("memory", score)} />
          </TabsContent>
          
          <TabsContent value="color">
            <ColorRelaxGame onComplete={() => handleGameComplete("color")} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default GamesPage;
