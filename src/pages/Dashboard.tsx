import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Users, 
  FileText, 
  Pill,
  Calendar,
  TrendingUp,
  Heart,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    familyMembers: 0,
    symptoms: 0,
    prescriptions: 0,
    reports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        setUser(session.user);
        await loadDashboardStats();
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadDashboardStats = async () => {
    try {
      // Load family members count
      const { count: familyCount } = await supabase
        .from("family_members")
        .select("*", { count: 'exact', head: true });

      // Load symptoms count
      const { count: symptomsCount } = await supabase
        .from("symptoms")
        .select("*", { count: 'exact', head: true });

      // Load prescriptions count
      const { count: prescriptionsCount } = await supabase
        .from("prescriptions")
        .select("*", { count: 'exact', head: true });

      // Load medical reports count
      const { count: reportsCount } = await supabase
        .from("medical_reports")
        .select("*", { count: 'exact', head: true });

      setStats({
        familyMembers: familyCount || 0,
        symptoms: symptomsCount || 0,
        prescriptions: prescriptionsCount || 0,
        reports: reportsCount || 0
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.email}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your health tracking data.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Family Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.familyMembers}</div>
              <p className="text-xs text-muted-foreground">
                People in your care
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Symptoms Tracked</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.symptoms}</div>
              <p className="text-xs text-muted-foreground">
                Total symptom entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prescriptions</CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.prescriptions}</div>
              <p className="text-xs text-muted-foreground">
                Active prescriptions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medical Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reports}</div>
              <p className="text-xs text-muted-foreground">
                Stored reports
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks to manage your health data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button asChild className="h-auto p-4 flex-col">
                  <Link to="/symptoms">
                    <Activity className="h-6 w-6 mb-2" />
                    <span className="text-sm">Track Symptoms</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto p-4 flex-col">
                  <Link to="/family">
                    <Users className="h-6 w-6 mb-2" />
                    <span className="text-sm">Manage Family</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Health Overview
              </CardTitle>
              <CardDescription>
                Your health tracking summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Recent Activity</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.symptoms > 0 ? `${stats.symptoms} symptoms tracked` : "No symptoms tracked yet"}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Medications</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.prescriptions > 0 ? `${stats.prescriptions} prescriptions` : "No prescriptions added"}
                    </p>
                  </div>
                  <Pill className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;