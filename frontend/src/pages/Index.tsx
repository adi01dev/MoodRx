
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LeafIcon } from "@/components/PlantIcons";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-wellness-green-light/20 to-wellness-blue-light/20">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-wellness-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">MH</span>
              </div>
              <h1 className="ml-3 text-3xl font-bold text-gray-900">MoodBloom</h1>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 font-montserrat">
              Your Mental Wellness Journey Starts Here
            </h2>
            
            <p className="text-xl text-gray-600">
              Track your mood, analyze your emotions, and get personalized recommendations 
              for better mental health.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-wellness-green hover:bg-wellness-green-dark text-white text-lg py-6 px-8"
                onClick={() => navigate('/register')}
              >
                Start Your Journey
              </Button>
              
              <Button 
                variant="outline" 
                className="border-wellness-green text-wellness-green hover:bg-wellness-green/10 text-lg py-6 px-8"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-wellness-green">
              <LeafIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Grow with every check-in</span>
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80" 
                alt="Mental Wellness" 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-white text-2xl font-bold">Voice-based Emotion Analysis</h3>
                <p className="text-white/80">Let AI understand how you're feeling today</p>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-wellness-yellow rounded-lg p-4 shadow-lg hidden md:block">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-wellness-yellow font-bold text-xl">7</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-white font-semibold">Day Streak</h4>
                  <p className="text-white/80 text-sm">Keep growing your plant!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-wellness-blue-light rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-wellness-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Voice Check-ins</h3>
            <p className="text-gray-600">
              Simply speak about your day, and our AI analyzes your tone, stress level, and emotional state.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-wellness-green-light rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-wellness-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Plant Growth Tracker</h3>
            <p className="text-gray-600">
              Watch your virtual plant grow as you maintain your daily wellness check-in streak.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-wellness-purple-light rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-wellness-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Support</h3>
            <p className="text-gray-600">
              Connect with others facing similar challenges and share coping strategies.
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm">
            ©2025 MoodBloom. Mental wellness made personal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
