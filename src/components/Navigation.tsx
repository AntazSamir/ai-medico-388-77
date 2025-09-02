import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  Users, 
  UserCircle, 
  Heart, 
  LogOut,
  Home,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out");
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Symptoms",
      href: "/symptoms", 
      icon: Activity,
    },
    {
      name: "Family",
      href: "/family",
      icon: Users,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: UserCircle,
    },
  ];

  return (
    <nav className="bg-background border-b border-border relative z-20 sticky top-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo - Responsive sizing */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 py-2 transition-all duration-200 ease-out hover:opacity-90">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary transition-transform duration-200 ease-out" />
              <span className="text-lg sm:text-xl font-bold text-foreground hidden xs:block">
                HealthTracker
              </span>
              <span className="text-lg font-bold text-foreground block xs:hidden">
                Health
              </span>
            </Link>
          </div>
            
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "nav-button inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ease-out hover:shadow-sm",
                    isActive
                      ? "bg-medical-500 text-white shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-4 w-4 mr-2 transition-all duration-150 ease-out" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Desktop Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="nav-button text-muted-foreground ml-4 transition-all duration-150 ease-out hover:text-red-600 hover:bg-red-50 hover:shadow-sm"
            >
              <LogOut className="h-4 w-4 mr-2 transition-all duration-150 ease-out" />
              <span className="hidden xl:inline">Logout</span>
            </Button>
          </div>

          {/* Mobile/Tablet Navigation Controls */}
          <div className="flex items-center lg:hidden space-x-2">
            {/* Mobile Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="nav-button text-muted-foreground p-2 transition-all duration-150 ease-out hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 transition-all duration-150 ease-out" />
            </Button>
            
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="nav-button text-muted-foreground p-2 transition-all duration-150 ease-out hover:text-foreground hover:bg-gray-50"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 transition-all duration-150 ease-out" />
              ) : (
                <Menu className="h-6 w-6 transition-all duration-150 ease-out" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-3 pt-2 pb-3 space-y-1 border-t border-border bg-background/95 backdrop-blur-sm">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "nav-button flex items-center px-4 py-3 rounded-lg text-base font-medium w-full transition-all duration-150 ease-out hover:shadow-sm",
                    isActive
                      ? "bg-medical-500 text-white shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-5 w-5 mr-3 transition-all duration-150 ease-out" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;