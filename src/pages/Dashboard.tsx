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
      <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-medical-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-medical-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-medical-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-medical-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-medical-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-medical-100/20 rounded-full blur-3xl"></div>
      </div>
      
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-medical-700 mb-2">
            Welcome back, {user?.email}!
          </h1>
          <p className="text-medical-600">
            Here's an overview of your health tracking data.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-medical-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-medical-700">Family Members</CardTitle>
              <Users className="h-4 w-4 text-medical-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-medical-700">{stats.familyMembers}</div>
              <p className="text-xs text-medical-600">
                People in your care
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-medical-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-medical-700">Symptoms Tracked</CardTitle>
              <Activity className="h-4 w-4 text-medical-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-medical-700">{stats.symptoms}</div>
              <p className="text-xs text-medical-600">
                Total symptom entries
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-medical-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-medical-700">Prescriptions</CardTitle>
              <Pill className="h-4 w-4 text-medical-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-medical-700">{stats.prescriptions}</div>
              <p className="text-xs text-medical-600">
                Active prescriptions
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-medical-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-medical-700">Medical Reports</CardTitle>
              <FileText className="h-4 w-4 text-medical-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-medical-700">{stats.reports}</div>
              <p className="text-xs text-medical-600">
                Stored reports
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card border-medical-100">
            <CardHeader>
              <CardTitle className="flex items-center text-medical-700">
                <Heart className="h-5 w-5 mr-2 text-medical-500" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-medical-600">
                Common tasks to manage your health data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button asChild className="h-auto p-4 flex-col bg-medical-500 hover:bg-medical-600 text-white btn-press">
                  <Link to="/symptoms">
                    <Activity className="h-6 w-6 mb-2" />
                    <span className="text-sm">Track Symptoms</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto p-4 flex-col border-medical-200 text-medical-700 hover:bg-medical-50 btn-press">
                  <Link to="/family">
                    <Users className="h-6 w-6 mb-2" />
                    <span className="text-sm">Manage Family</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-medical-100">
            <CardHeader>
              <CardTitle className="flex items-center text-medical-700">
                <TrendingUp className="h-5 w-5 mr-2 text-medical-500" />
                Health Overview
              </CardTitle>
              <CardDescription className="text-medical-600">
                Your health tracking summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-medical-50/50 rounded-lg border border-medical-100">
                  <div>
                    <p className="text-sm font-medium text-medical-700">Recent Activity</p>
                    <p className="text-xs text-medical-600">
                      {stats.symptoms > 0 ? `${stats.symptoms} symptoms tracked` : "No symptoms tracked yet"}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-medical-500" />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-medical-50/50 rounded-lg border border-medical-100">
                  <div>
                    <p className="text-sm font-medium text-medical-700">Medications</p>
                    <p className="text-xs text-medical-600">
                      {stats.prescriptions > 0 ? `${stats.prescriptions} prescriptions` : "No prescriptions added"}
                    </p>
                  </div>
                  <Pill className="h-8 w-8 text-medical-500" />
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