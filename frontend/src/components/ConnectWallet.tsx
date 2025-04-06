
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { Wallet, CheckCircle, AlertTriangle } from "lucide-react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletState {
  address: string;
  connected: boolean;
}

export function ConnectWallet() {
  const [loading, setLoading] = useState(false);
  const [walletState, setWalletState] = useState<WalletState>({ address: '', connected: false });
  const [hasMetamask, setHasMetamask] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if MetaMask is available
    if (typeof window !== 'undefined') {
      setHasMetamask(!!window.ethereum);
    }
    
    // Fetch current wallet state
    fetchWalletState();
  }, []);

  const fetchWalletState = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data && response.data.wallet) {
        setWalletState({
          address: response.data.wallet.address || '',
          connected: response.data.wallet.connected || false
        });
      }
    } catch (error) {
      console.error('Error fetching wallet state:', error);
    }
  };

  const connectMetamask = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask browser extension to connect your wallet",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const address = accounts[0];
      
      // Save to backend
      await connectWalletToBackend(address);
      
      toast({
        title: "Wallet Connected",
        description: "Your MetaMask wallet has been connected successfully",
      });
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to MetaMask",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectWalletToBackend = async (address: string) => {
    try {
      const response = await api.post('/tokens/connect-wallet', { address });
      
      if (response.data && response.data.wallet) {
        setWalletState({
          address: response.data.wallet.address,
          connected: response.data.wallet.connected
        });
      }
    } catch (error) {
      console.error('Error saving wallet to backend:', error);
      throw new Error('Failed to save wallet information');
    }
  };

  const disconnectWallet = async () => {
    try {
      setLoading(true);
      
      // Update backend
      await api.post('/tokens/connect-wallet', { address: '' });
      
      setWalletState({ address: '', connected: false });
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect wallet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format wallet address for display (0x1234...5678)
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Wallet className="w-5 h-5 mr-2 text-wellness-blue" />
          <CardTitle>Blockchain Wallet</CardTitle>
        </div>
        <CardDescription>
          Connect your wallet to participate in the blockchain rewards system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasMetamask && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-amber-800">MetaMask Not Detected</h3>
                <p className="text-sm text-amber-700 mt-1">
                  To connect your wallet, please install the MetaMask browser extension.
                </p>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-amber-800 underline text-sm mt-1"
                  onClick={() => window.open('https://metamask.io/download/', '_blank')}
                >
                  Download MetaMask
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {walletState.connected ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-wellness-green mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">Wallet Connected</h3>
                  <p className="text-sm text-green-700 break-all">
                    {formatAddress(walletState.address)}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Your wallet is connected to our blockchain rewards system. You can now earn and redeem tokens for special rewards.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Connect your wallet to access the blockchain rewards system. This will allow you to earn tokens for activities like maintaining streaks, completing recommendations, and engaging with the community.
            </p>
            <p className="text-sm text-gray-600">
              Tokens can be redeemed for therapy discounts, premium content, and special plant unlocks.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {walletState.connected ? (
          <Button 
            variant="outline" 
            onClick={disconnectWallet} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Processing..." : "Disconnect Wallet"}
          </Button>
        ) : (
          <Button 
            onClick={connectMetamask}
            disabled={loading || !hasMetamask}
            className="w-full bg-wellness-blue hover:bg-wellness-blue-dark text-white"
          >
            {loading ? "Connecting..." : "Connect MetaMask"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
