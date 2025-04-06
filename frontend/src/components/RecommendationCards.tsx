
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Music, Video, PenTool, BookOpen, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

interface Recommendation {
  id: string;
  type: "music" | "video" | "activity" | "journal";
  title: string;
  description: string;
  link?: string;
  source?: string;
  mood?: string;
}

export function RecommendationCards() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/recommendations');
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Could not load recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (recommendationId: string, helpful: boolean) => {
    try {
      await api.post('/recommendations/feedback', {
        recommendationId,
        helpful
      });
      
      toast({
        title: helpful ? "Thank you!" : "Feedback received",
        description: helpful 
          ? "We'll recommend more like this in the future" 
          : "We'll adjust your recommendations",
      });
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  // Function to get the appropriate icon based on recommendation type
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "music":
        return <Music className="h-6 w-6 text-wellness-blue" />;
      case "video":
        return <Video className="h-6 w-6 text-wellness-purple" />;
      case "activity":
        return <BookOpen className="h-6 w-6 text-wellness-green" />;
      case "journal":
        return <PenTool className="h-6 w-6 text-wellness-yellow" />;
      default:
        return <BookOpen className="h-6 w-6 text-wellness-teal" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-28" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px]">
          <p className="text-center text-muted-foreground">No recommendations available yet.</p>
          <p className="text-center text-sm text-muted-foreground mt-1">Complete a mood check-in to get personalized suggestions.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {recommendations.map((rec) => (
        <Card key={rec.id} className="overflow-hidden card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              {getRecommendationIcon(rec.type)}
              <CardTitle className="text-lg">{rec.title}</CardTitle>
            </div>
            {rec.mood && (
              <CardDescription>Recommended for: {rec.mood}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{rec.description}</p>
            {rec.source && (
              <p className="text-xs text-muted-foreground mt-2">Source: {rec.source}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-wellness-green hover:text-wellness-green-dark"
                onClick={() => handleFeedback(rec.id, true)}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Helpful
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => handleFeedback(rec.id, false)}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                Not for me
              </Button>
            </div>
            {rec.link && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild
              >
                <a 
                  href={rec.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
