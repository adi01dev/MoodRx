
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  Home, 
  PieChart, 
  Plus, 
  Calendar, 
  Lightbulb, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  hideNavigation?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  hideNavigation = false 
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Check In", path: "/check-in", icon: Plus },
    { name: "History", path: "/history", icon: Calendar },
    { name: "Recommendations", path: "/recommendations", icon: Lightbulb },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            {!hideNavigation && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="md:hidden"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            )}
            <Link to="/" className="flex items-center space-x-2">
              <PieChart className="h-7 w-7 text-mhm-blue-500" />
              <span className="font-serif text-xl font-bold">MindRx</span>
            </Link>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium hidden sm:inline-block">
                Hi, {user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-1"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline-block">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {!hideNavigation && (
        <div
          className={cn(
            "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-200",
            isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={toggleMenu}
        />
      )}

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        {!hideNavigation && (
          <aside
            className={cn(
              "fixed top-16 bottom-0 w-64 bg-mhm-blue-50 border-r z-50 transition-transform duration-300 md:translate-x-0 md:static",
              isMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <nav className="flex flex-col h-full p-4">
              <div className="space-y-1 flex-1">
                {navigation.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
                      location.pathname === item.path
                        ? "bg-mhm-blue-100 text-mhm-blue-600"
                        : "hover:bg-mhm-blue-100/50"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1">
          {title && (
            <div className="container pt-6 pb-4">
              <h1 className="text-2xl md:text-3xl font-bold font-serif">{title}</h1>
            </div>
          )}
          <div className={cn("container", !title && "py-6")}>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
