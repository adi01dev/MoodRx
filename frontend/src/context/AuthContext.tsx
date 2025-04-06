
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for token in localStorage on initial load
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      setIsLoading(true);
      const response = await api.get("/users/profile", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      localStorage.removeItem("token");
      setToken(null);
      toast({
        title: "Session expired",
        description: "Please log in again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // For demo purposes, we'll simulate a successful login
      // In a real app, you would call your API endpoint
      const response = await api.post("/auth/login", { email, password });
      
      // Demo code - remove this in production and uncomment the line above
      // const mockResponse = {
      //   data: {
      //     token: "demo-token-12345",
      //     user: {
      //       id: "user123",
      //       name: email.split('@')[0],
      //       email: email,
      //       role: "student",
      //       createdAt: new Date().toISOString(),
      //     }
      //   }
      // };
      
      const { token: authToken, user: userData } = response.data;
      
      localStorage.setItem("token", authToken);
      setToken(authToken);
      setUser(userData);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${userData.name}`,
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    try {
      setIsLoading(true);
      // For demo purposes, we'll simulate a successful registration
      // In a real app, you would call your API endpoint
      // const response = await api.post("/auth/register", { name, email, password, role });
      
      // Demo code - remove this in production and uncomment the line above
      // const mockResponse = {
      //   data: {
      //     token: "demo-token-register-12345",
      //     user: {
      //       id: `user-${Date.now()}`,
      //       name: name,
      //       email: email,
      //       role: role,
      //       createdAt: new Date().toISOString(),
      //     }
      //   }
      // };

      const response = await api.post("/auth/register", { name, email, password, role });

      
      const { token: authToken, user: userData } = response.data;
      
      localStorage.setItem("token", authToken);
      setToken(authToken);
      setUser(userData);
      toast({
        title: "Registration successful!",
        description: "Your account has been created.",
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
