
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { LeafIcon } from "@/components/PlantIcons";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

import { ArrowRight, BarChart, Brain, Import, MusicIcon, Smile, Sparkles, Users } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  const navItems = [
    { name: "Index", path: "/index"}
  ];

  return (
    <Layout hideNavigation>
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight">
              Your Mental Health{" "}
              <span className="gradient-text">Mirror</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your mood, receive personalized recommendations, and understand your emotional patterns with our AI-powered wellness companion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button size="lg" className="btn-primary" asChild>
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="btn-primary" asChild>
                    <Link to="/register">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="rounded-xl overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Wellness visualization" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-mhm-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">How MindRx Helps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform uses AI to help you understand and improve your mental well-being through several key features.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-mhm-blue-100 flex items-center justify-center mb-4">
                <Smile className="h-6 w-6 text-mhm-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Voice Mood Check-ins</h3>
              <p className="text-muted-foreground">
                Speak naturally about your day, and our AI will analyze your emotional state, detecting stress, happiness, anxiety, and more.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-mhm-green-100 flex items-center justify-center mb-4">
                <MusicIcon className="h-6 w-6 text-mhm-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Personalized Recommendations</h3>
              <p className="text-muted-foreground">
                Receive curated music, videos, and activities matched to your current emotional state to help you feel better.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-mhm-yellow-100 flex items-center justify-center mb-4">
                <BarChart className="h-6 w-6 text-mhm-yellow-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mood Tracking</h3>
              <p className="text-muted-foreground">
                Visualize your emotional patterns over time to identify triggers and track your progress toward better mental health.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-mhm-yellow-100 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-mhm-yellow-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Insights</h3>
              <p className="text-muted-foreground">
                Gain deeper understanding of your emotions with analysis that identifies patterns and suggests positive changes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-mhm-blue-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-mhm-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Support Community</h3>
              <p className="text-muted-foreground">
                Connect with others who share similar challenges, exchange tips, and build a network of mutual support.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-mhm-green-100 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-mhm-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Weekly Wellness Report</h3>
              <p className="text-muted-foreground">
                Receive a comprehensive summary of your mood trends, progress, and personalized insights every week.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-mhm-blue-50 to-mhm-green-50 p-8 md:p-12 rounded-xl max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
              Begin Your Wellness Journey Today
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who have improved their mental well-being with MindMirror. Your path to better mental health starts here.
            </p>
            {user ? (
              <Button size="lg" className="btn-primary" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" className="btn-primary" asChild>
                <Link to="/register">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-mhm-blue-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">MindMirror</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Our Team</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Mental Health Tips</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Crisis Support</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">FAQs</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Cookie Policy</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">GDPR</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Twitter</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Instagram</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">LinkedIn</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Facebook</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-muted text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MindRx. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;
