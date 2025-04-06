
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

interface TokenTransaction {
  id: string;
  amount: number;
  type: 'earned' | 'spent';
  source: 'streak' | 'recommendation' | 'community' | 'redemption' | 'admin';
  description: string;
  createdAt: string;
}

export function TokenHistory() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTokenHistory();
  }, []);

  const fetchTokenHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tokens/history');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching token history:', error);
      toast({
        title: "Error",
        description: "Could not load token history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'streak':
        return 'Daily Streak';
      case 'recommendation':
        return 'Completed Recommendation';
      case 'community':
        return 'Community Participation';
      case 'redemption':
        return 'Reward Redemption';
      case 'admin':
        return 'System';
      default:
        return source;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wellness-yellow"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-6">
            No token transactions yet. Start earning tokens by maintaining your streak and engaging with the app!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0">
              <div className="flex items-start">
                {transaction.type === 'earned' ? (
                  <ArrowUpRight className="mt-1 mr-2 h-4 w-4 text-wellness-green" />
                ) : (
                  <ArrowDownRight className="mt-1 mr-2 h-4 w-4 text-red-500" />
                )}
                <div>
                  <p className="font-medium">
                    {transaction.type === 'earned' ? 'Earned' : 'Spent'} from {getSourceLabel(transaction.source)}
                  </p>
                  <p className="text-sm text-gray-500">{transaction.description}</p>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className={`font-bold ${transaction.type === 'earned' ? 'text-wellness-green' : 'text-red-500'}`}>
                {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
