import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronLeft,
  ChevronRight,
  BarChart2,
  CheckSquare,
  BookOpen,
  Calendar,
  Users,
  UserCircle,
  Award,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TokenBalance } from "@/components/TokenBalance";
import { PlantGrowthTracker } from "@/components/PlantGrowthTracker";
import { Gamepad2 } from "lucide-react"; // Replace GameController with Gamepad2
import { useIsMobile } from "@/hooks/use-mobile"; // Replace 'useMobile' with 'useIsMobile'

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

const DashboardLayout = ({ children, pageTitle }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);

  // Navigation items for the sidebar
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: BarChart2 },
    { name: "Check-In", path: "/check-in", icon: CheckSquare },
    { name: "Journal", path: "/journal", icon: BookOpen },
    { name: "History", path: "/history", icon: Calendar },
    { name: "Community", path: "/community", icon: Users },
    { name: "Games", path: "/games", icon: Gamepad2 },
    { name: "Rewards", path: "/rewards", icon: Award },
    { name: "Profile", path: "/profile", icon: UserCircle },
  ];

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "h-screen fixed top-0 left-0 z-30 bg-white border-r border-gray-200 transition-all duration-300",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div
            className={cn(
              "flex items-center px-4 h-16 border-b border-gray-200",
              sidebarCollapsed ? "justify-center" : "justify-between"
            )}
          >
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-wellness-green rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">MR</span>
                </div>
                <Link to='/'> <h1 className="font-semibold">MindRx</h1></Link>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500"
              onClick={toggleSidebar}
            >
              {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </Button>
          </div>

          {/* User Info */}
          <div
            className={cn(
              "border-b border-gray-200 py-4",
              sidebarCollapsed ? "px-2 text-center" : "px-4"
            )}
          >
            <div
              className={cn(
                "flex items-center",
                sidebarCollapsed ? "flex-col" : "space-x-3"
              )}
            >
              <div className="h-10 w-10 bg-wellness-green-light text-wellness-green rounded-full flex items-center justify-center font-medium">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.role || "Student"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                      sidebarCollapsed ? "justify-center" : "space-x-3",
                      location.pathname === item.path
                        ? "bg-wellness-green text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5",
                        location.pathname === item.path
                          ? "text-white"
                          : "text-gray-500"
                      )}
                    />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="border-t border-gray-200 p-4">
            <Button
              variant="outline"
              size={sidebarCollapsed ? "icon" : "default"}
              className={cn(
                "w-full border-gray-300 text-gray-700",
                sidebarCollapsed ? "justify-center" : "justify-start"
              )}
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              {!sidebarCollapsed && <span className="ml-2">Log Out</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 bg-gray-50",
          sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        {/* Top Bar */}
        {pageTitle && (
          <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
            <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
          </div>
        )}

        {/* Page Content */}
        <div className="py-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
