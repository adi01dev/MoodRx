
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Coins, TrendingUp } from "lucide-react";

// filepath: TokenBalance.tsx
interface TokenBalanceProps {
  collapsed?: boolean; // Add this if you want to support the 'collapsed' prop
  showDetails?: boolean;
}
interface TokenBalanceData {
  balance: number;
  lifetime: number;
}

export function TokenBalance({ showDetails = false }: TokenBalanceProps) {
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState<TokenBalanceData>({
    balance: 0,
    lifetime: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTokenBalance();
  }, []);

  const fetchTokenBalance = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tokens/balance');
      setTokenData(response.data);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      toast({
        title: "Error",
        description: "Could not load token balance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Coins className="w-5 h-5 mr-2 text-wellness-yellow" />
          Wellness Tokens
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-2">
          {loading ? (
            <div className="h-10 w-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-wellness-yellow"></div>
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-wellness-yellow-dark flex items-center">
                {tokenData.balance} <span className="ml-1 text-sm text-gray-500">tokens</span>
              </p>
              
              {showDetails && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span>{tokenData.lifetime} lifetime tokens earned</span>
                </div>
              )}
              
              <p className="text-xs text-center mt-2 text-gray-500">
                Earn tokens by maintaining streaks, completing recommendations, and participating in the community.
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
