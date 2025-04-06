
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { TokenBalance } from "@/components/TokenBalance";
import { Sparkles, Gift, Lightbulb, Heart, Leaf } from "lucide-react";

interface Reward {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  tokenCost: number;
  category: 'therapy' | 'content' | 'plant' | 'other';
}

export function RewardsMarketplace() {
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tokens/rewards');
      setRewards(response.data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast({
        title: "Error",
        description: "Could not load rewards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    try {
      setRedeeming(rewardId);
      const response = await api.post('/tokens/redeem', { rewardId });
      
      toast({
        title: "Success!",
        description: response.data.message,
      });
      
      // Refresh rewards and balance
      fetchRewards();
    } catch (error: any) {
      console.error('Error redeeming reward:', error);
      toast({
        title: "Redemption Failed",
        description: error.response?.data?.message || "Could not redeem reward",
        variant: "destructive",
      });
    } finally {
      setRedeeming(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'therapy':
        return <Heart className="h-5 w-5 text-wellness-purple" />;
      case 'content':
        return <Lightbulb className="h-5 w-5 text-wellness-yellow" />;
      case 'plant':
        return <Leaf className="h-5 w-5 text-wellness-green" />;
      default:
        return <Gift className="h-5 w-5 text-wellness-teal" />;
    }
  };

  const filterRewardsByCategory = (category: string) => {
    if (category === 'all') return rewards;
    return rewards.filter(reward => reward.category === category);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <TokenBalance />
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wellness-yellow"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TokenBalance />
      
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-wellness-yellow" />
            <CardTitle>Rewards Marketplace</CardTitle>
          </div>
          <CardDescription>
            Redeem your tokens for special rewards and benefits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="therapy">Therapy</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="plant">Plants</TabsTrigger>
            </TabsList>
            
            {['all', 'therapy', 'content', 'plant'].map(category => (
              <TabsContent key={category} value={category}>
                {filterRewardsByCategory(category).length === 0 ? (
                  <p className="text-center text-gray-500 py-6">
                    No rewards available in this category
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filterRewardsByCategory(category).map(reward => (
                      <Card key={reward.id} className="overflow-hidden">
                        {reward.imageUrl && (
                          <div className="relative h-32 bg-gray-100">
                            <img 
                              src={reward.imageUrl} 
                              alt={reward.title} 
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {getCategoryIcon(reward.category)}
                              <CardTitle className="text-lg ml-2">{reward.title}</CardTitle>
                            </div>
                            <span className="text-sm font-medium text-wellness-yellow flex items-center">
                              {reward.tokenCost} tokens
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 text-sm">{reward.description}</p>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            onClick={() => handleRedeem(reward.id)} 
                            disabled={redeeming === reward.id}
                            className="w-full bg-wellness-yellow hover:bg-wellness-yellow-dark text-white"
                          >
                            {redeeming === reward.id ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Redeeming...
                              </div>
                            ) : (
                              <>Redeem</>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
