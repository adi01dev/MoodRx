
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SeedlingIcon, LeafIcon, FlowerIcon, TreeIcon } from "@/components/PlantIcons";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface PlantGrowthData {
  streakCount: number;
  plantLevel: 'seed' | 'sprout' | 'leaf' | 'flower' | 'tree';
  lastCheckIn: string | null;
  nextLevelAt: number;
}

interface PlantGrowthTrackerProps {
  // Existing props
  collapsed: boolean; // Add this line
}

export function PlantGrowthTracker() {
  const [loading, setLoading] = useState(true);
  const [plantData, setPlantData] = useState<PlantGrowthData>({
    streakCount: 0,
    plantLevel: 'seed',
    lastCheckIn: null,
    nextLevelAt: 1,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPlantData();
  }, []);

  const fetchPlantData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/plants/growth');
      setPlantData(response.data);
    } catch (error) {
      console.error('Error fetching plant growth data:', error);
      toast({
        title: "Error",
        description: "Could not load plant growth data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlantIcon = () => {
    switch (plantData.plantLevel) {
      case 'seed':
      case 'sprout':
        return <SeedlingIcon className="h-20 w-20 text-wellness-green animate-plant-grow" />;
      case 'leaf':
        return <LeafIcon className="h-20 w-20 text-wellness-green animate-plant-grow" />;
      case 'flower':
        return <FlowerIcon className="h-20 w-20 text-wellness-green animate-plant-grow" />;
      case 'tree':
        return <TreeIcon className="h-20 w-20 text-wellness-green animate-plant-grow" />;
      default:
        return <SeedlingIcon className="h-20 w-20 text-wellness-green" />;
    }
  };

  const getLevelText = () => {
    switch (plantData.plantLevel) {
      case 'seed':
        return "You're at the beginning of your wellness journey!";
      case 'sprout':
        return "Your wellness routine is sprouting!";
      case 'leaf':
        return "Growing stronger every day!";
      case 'flower':
        return "Blooming beautifully! Keep it up!";
      case 'tree':
        return "You've established a strong wellness routine!";
      default:
        return "Start your wellness journey today!";
    }
  };

  // Calculate the progress percentage towards the next level
  const calculateProgress = () => {
    if (plantData.plantLevel === 'tree') return 100;
    
    // Define thresholds for each level
    const thresholds = {
      seed: 1,    // sprout at 1 day
      sprout: 3,  // leaf at 3 days
      leaf: 7,    // flower at 7 days
      flower: 14, // tree at 14 days
      tree: 14,   // already max level
    };

    const current = plantData.streakCount;
    const target = thresholds[plantData.plantLevel];
    
    // Calculate percentage (clamped to 0-100)
    return Math.min(Math.max(Math.floor((current / target) * 100), 0), 100);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-center">Your Wellness Plant</CardTitle>
        <CardDescription className="text-center">
          {plantData.streakCount} day{plantData.streakCount !== 1 ? 's' : ''} streak
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          {loading ? (
            <div className="h-20 w-20 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wellness-green"></div>
            </div>
          ) : (
            getPlantIcon()
          )}
          
          <p className="text-sm text-center mt-4 font-medium text-gray-600">
            {getLevelText()}
          </p>
          
          <div className="w-full mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress to next level</span>
              <span>{calculateProgress()}%</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>
          
          {plantData.lastCheckIn && (
            <p className="text-xs text-center mt-4 text-gray-500">
              Last check-in: {new Date(plantData.lastCheckIn).toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
