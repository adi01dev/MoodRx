
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TokenBalance } from "@/components/TokenBalance";
import { TokenHistory } from "@/components/TokenHistory";
import { RewardsMarketplace } from "@/components/RewardsMarketplace";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Coins, History, Gift, Wallet } from "lucide-react";

const RewardsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <DashboardLayout pageTitle="Rewards">
      <div className="space-y-6">
        {/* Introduction Section */}
        <section className="bg-wellness-yellow/10 rounded-lg p-6">
          <h2 className="text-xl font-bold text-wellness-yellow-dark flex items-center">
            <Coins className="mr-2 h-5 w-5" />
            Wellness Rewards System
          </h2>
          <p className="mt-2 text-gray-600">
            Earn tokens for maintaining streaks, completing recommendations, and engaging with the community.
            Redeem your tokens for therapy discounts, premium content, and special plant unlocks.
          </p>
        </section>
        
        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center">
              <Coins className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Overview</span>
              <span className="md:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">History</span>
              <span className="md:hidden">History</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center">
              <Gift className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Marketplace</span>
              <span className="md:hidden">Market</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center">
              <Wallet className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">Wallet</span>
              <span className="md:hidden">Wallet</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TokenBalance showDetails={true} />
              <ConnectWallet />
            </div>
            <TokenHistory />
          </TabsContent>
          
          <TabsContent value="history">
            <TokenHistory />
          </TabsContent>
          
          <TabsContent value="marketplace">
            <RewardsMarketplace />
          </TabsContent>
          
          <TabsContent value="wallet">
            <ConnectWallet />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default RewardsPage;
