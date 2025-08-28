import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  Users, 
  UserCircle, 
  Heart, 
  LogOut,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
    <nav className="bg-background border-b border-border relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2 transition-all duration-300 ease-smooth hover:opacity-90">
              <Heart className="h-8 w-8 text-primary transition-all duration-200 hover:scale-110" />
              <span className="text-xl font-bold text-foreground transition-colors duration-200">HealthTracker</span>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "nav-button inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-smooth hover:shadow-md hover:-translate-y-0.5",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg translate-y-0"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-sm"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2 transition-transform duration-200" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="nav-button text-muted-foreground hover:text-white hover:bg-red-500 transition-all duration-300 ease-smooth hover:shadow-md hover:-translate-y-0.5"
            >
              <LogOut className="h-4 w-4 mr-2 transition-transform duration-200" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "nav-button flex items-center px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ease-smooth hover:shadow-md hover:-translate-y-0.5",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg translate-y-0"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-sm"
                )}
              >
                <Icon className="h-5 w-5 mr-3 transition-transform duration-200" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;