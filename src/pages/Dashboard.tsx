import { useEffect, useState, useCallback, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import AddFamilyMemberDialog from "@/components/AddFamilyMemberDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Activity, 
  Users, 
  FileText, 
  Pill,
  Calendar,
  TrendingUp,
  Heart,
  Plus,
  Upload,
  UserPlus
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { RecentActivityManager, ActivityItem } from "../utils/recentActivity";
import { PrescriptionDialog } from "@/components/prescriptions/PrescriptionDialog";
import { Prescription } from "@/components/prescriptions/PrescriptionCard";

// Mock prescriptions data - same as Medications page
const mockPrescriptions: Record<string, Prescription[]> = {
  "main-user": [
    {
      id: "1",
      medicationName: "Amoxicillin 500mg",
      instructions: "Take 2 tablets daily with food for bacterial infection",
      doctor: "Dr. Smith",
      date: "2024-01-15",
      status: "Active",
      dosage: { morning: 1, noon: 0, afternoon: 1, night: 0 },
      time: "8:00 AM, 6:00 PM",
      notes: "Complete full course even if symptoms improve",
      additionalMedicines: [
        {
          medicationName: "Omeprazole 20mg",
          dosage: { morning: 1, noon: 0, afternoon: 0, night: 0 },
          time: "Before breakfast"
        }
      ]
    },
    {
      id: "2", 
      medicationName: "Ibuprofen 400mg",
      instructions: "Take as needed for pain, max 3 times daily",
      doctor: "Dr. Johnson",
      date: "2024-01-10",
      status: "As Needed",
      dosage: { morning: 1, noon: 1, afternoon: 1, night: 0 },
      time: "As needed",
      notes: "Do not exceed 1200mg per day"
    }
  ],
  "2": [
    {
      id: "jane-1",
      medicationName: "Metformin 500mg",
      instructions: "Take twice daily with meals for diabetes management",
      doctor: "Dr. Wilson",
      date: "2024-01-05",
      status: "Active",
      dosage: { morning: 1, noon: 0, afternoon: 0, night: 1 },
      time: "With breakfast and dinner",
      notes: "Monitor blood sugar levels regularly"
    }
  ],
  "3": [
    {
      id: "michael-1",
      medicationName: "Children's Tylenol",
      instructions: "Give as needed for fever or pain",
      doctor: "Dr. Peterson",
      date: "2024-01-08",
      status: "As Needed",
      dosage: { morning: 0, noon: 0, afternoon: 1, night: 0 },
      time: "As needed for fever",
      notes: "Do not exceed 4 doses in 24 hours"
    }
  ],
  "4": [
    {
      id: "emily-1",
      medicationName: "Children's Allergy Relief",
      instructions: "Give once daily for seasonal allergies",
      doctor: "Dr. Wilson",
      date: "2023-12-20",
      status: "Active",
      dosage: { morning: 1, noon: 0, afternoon: 0, night: 0 },
      time: "With breakfast",
      notes: "Continue during allergy season"
    }
  ]
};

// Mock family members - same as Medications page
const mockFamilyMembers = [
  {
    id: "main-user",
    name: "John Doe",
    relationship: "Primary User"
  },
  {
    id: "2",
    name: "Jane Doe",
    relationship: "Spouse"
  },
  {
    id: "3",
    name: "Michael Doe",
    relationship: "Son"
  },
  {
    id: "4",
    name: "Emily Doe",
    relationship: "Daughter"
  }
];

const Dashboard = memo(() => {
  console.log('Dashboard component rendering...');
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    familyMembers: 0,
    symptoms: 0,
    prescriptions: 0,
    reports: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  
  // Reports functionality state
  const [showReportsDialog, setShowReportsDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [reportFile, setReportFile] = useState(null);
  const [reportType, setReportType] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Prescription dialog state
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Load recent activity
  const loadActivity = useCallback(() => {
    const activity = RecentActivityManager.getRecentActivity();
    setRecentActivity(activity);
  }, []);

  // Load recent activity on component mount
  useEffect(() => {
    loadActivity();
    
    // Listen for storage changes to update activity in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'recentActivity') {
        loadActivity();
      }
    };
    
    // Listen for focus events to refresh activity when returning to tab
    const handleFocus = () => {
      loadActivity();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadActivity]);

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

  const handleActivityItemClick = (item: ActivityItem) => {
    if (item.type === 'prescription') {
      // Find the prescription by relatedId
      const allPrescriptions = Object.values(mockPrescriptions).flat();
      const prescription = allPrescriptions.find(p => p.id === item.relatedId);
      
      if (prescription) {
        setSelectedPrescription(prescription);
        setSelectedMember(item.memberId || 'main-user');
        setShowPrescriptionDialog(true);
      } else {
        // Fallback to medications page if prescription not found
        navigate('/medications');
      }
    } else if (item.type === 'report') {
      // Navigate to family page for reports
      navigate('/family');
    }
  };

  const getActivityIcon = (type: string) => {
    return type === 'prescription' ? 
      <Pill className="h-4 w-4 text-blue-500" /> : 
      <FileText className="h-4 w-4 text-green-500" />;
  };

  // Load family members from localStorage
  useEffect(() => {
    const loadFamilyMembers = () => {
      const saved = localStorage.getItem('familyMembers');
      if (saved) {
        setFamilyMembers(JSON.parse(saved));
      }
    };
    loadFamilyMembers();
  }, []);

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

  const handleReportUpload = async () => {
    if (!selectedMemberId || !reportFile || !reportType) {
      toast.error("Please select a family member, report type, and file");
      return;
    }

    setIsUploading(true);
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update stats
      setStats(prev => ({ ...prev, reports: prev.reports + 1 }));
      
      // Reset form
      setSelectedMemberId("");
      setReportFile(null);
      setReportType("");
      setShowReportsDialog(false);
      
      toast.success("Report uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload report");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddFamilyMember = (member) => {
    const newMember = {
      ...member,
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastVisit: "Not yet visited"
    };
    
    const updatedMembers = [...familyMembers, newMember];
    setFamilyMembers(updatedMembers);
    localStorage.setItem('familyMembers', JSON.stringify(updatedMembers));
    
    // Update stats
    setStats(prev => ({ ...prev, familyMembers: prev.familyMembers + 1 }));
    
    toast.success(`${member.name} has been added to your family members`);
  };

  const reportTypes = [
    "Blood Test", "X-Ray", "MRI", "CT Scan", "Ultrasound", 
    "ECG", "Biopsy", "Pathology", "Allergy Test", "Other"
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-medical-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-medical-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-medical-100 relative overflow-hidden">
      {/* Background decoration - responsive */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-medical-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-medical-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-medical-100/20 rounded-full blur-3xl"></div>
      </div>
      
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 px-4 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-medical-700 mb-2">
                Welcome back!
              </h1>
              <p className="text-base text-medical-600">
                Here's an overview of your health tracking data.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-4 gap-4">
            <Button asChild className="h-24 flex-col bg-medical-500 hover:bg-medical-600 text-white rounded-xl fluid-btn">
              <Link to="/symptoms" className="flex flex-col items-center fluid-gap">
                <Activity className="mb-2 fluid-icon" />
                <span className="text-sm font-medium sm:hidden fluid-text">Symptoms</span>
                <span className="text-sm font-medium hidden sm:inline fluid-text">Track Symptoms</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-24 flex-col border-medical-200 text-medical-700 hover:bg-medical-50 rounded-xl fluid-btn">
              <Link to="/family" className="flex flex-col items-center fluid-gap">
                <Users className="mb-2 fluid-icon" />
                <span className="text-sm font-medium fluid-text">Family</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-24 flex-col border-medical-200 text-medical-700 hover:bg-medical-50 rounded-xl fluid-btn">
              <Link to="/profile" className="flex flex-col items-center fluid-gap">
                <FileText className="mb-2 fluid-icon" />
                <span className="text-sm font-medium fluid-text">Profile</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-24 flex-col border-medical-200 text-medical-700 hover:bg-medical-50 rounded-xl fluid-btn">
              <Link to="/medications" className="flex flex-col items-center fluid-gap">
                <Pill className="mb-2 fluid-icon" />
                <span className="text-sm font-medium fluid-text">Meds</span>
              </Link>
            </Button>
          </div>
          
          {/* Health Overview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="glass-card border-medical-100 p-4 sm:p-6">
              <CardHeader className="p-0 mb-3 sm:mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-medical-700 text-lg sm:text-xl">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-medical-500" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription className="text-medical-600 text-sm">
                      Your latest health tracking
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 3).map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 bg-medical-50/50 rounded-lg border border-medical-100 hover:bg-medical-100/70 hover:border-medical-200 cursor-pointer transition-all duration-200 hover:shadow-md"
                        onClick={() => handleActivityItemClick(item)}
                        title={item.type === 'prescription' ? 
                          'Click to view prescription details' : 
                          'Click to view report details'
                        }
                      >
                        <div className="flex items-center gap-3">
                          {getActivityIcon(item.type)}
                          <div>
                            <p className="text-sm font-medium text-medical-700 truncate max-w-[200px]">
                              {item.title}
                            </p>
                            <p className="text-xs text-medical-600 truncate max-w-[180px]">
                              {item.subtitle}
                            </p>
                            {item.type === 'prescription' && (
                              <p className="text-xs text-blue-500 mt-1">
                                ↗ Click to open prescription
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-medical-500">
                            {RecentActivityManager.getRelativeTime(item.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-medical-50/50 rounded-lg border border-medical-100">
                      <div>
                        <p className="text-sm font-medium text-medical-700">No recent activity</p>
                        <p className="text-xs text-medical-600">
                          View prescriptions or reports to see activity here
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          ↗ Activities will be clickable for quick access
                        </p>
                      </div>
                      <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-medical-300" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-medical-100 p-4 sm:p-6">
              <CardHeader className="p-0 mb-3 sm:mb-4">
                <CardTitle className="flex items-center text-medical-700 text-lg sm:text-xl">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-medical-500" />
                  Health Summary
                </CardTitle>
                <CardDescription className="text-medical-600 text-sm">
                  Your health data overview
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-3">
                  <button
                    onClick={() => setShowAddMemberDialog(true)}
                    className="flex items-center justify-between p-3 bg-medical-50/50 rounded-lg border border-medical-100 hover:bg-medical-100/70 hover:border-medical-200 transition-all duration-200 cursor-pointer w-full"
                  >
                    <div>
                      <p className="text-sm font-medium text-medical-700">Family Members</p>
                      <p className="text-xs text-medical-600">
                        {stats.familyMembers > 0 ? `${stats.familyMembers} people` : "Add family"}
                      </p>
                    </div>
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-medical-500" />
                  </button>
                  
                  <button
                    onClick={() => setShowReportsDialog(true)}
                    className="flex items-center justify-between p-3 bg-medical-50/50 rounded-lg border border-medical-100 hover:bg-medical-100/70 hover:border-medical-200 transition-all duration-200 cursor-pointer w-full"
                  >
                    <div>
                      <p className="text-sm font-medium text-medical-700">Reports</p>
                      <p className="text-xs text-medical-600">
                        {stats.reports > 0 ? `${stats.reports} stored` : "Upload reports"}
                      </p>
                    </div>
                    <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-medical-500" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Reports Upload Dialog */}
      <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-medical-500" />
              Upload Medical Reports
            </DialogTitle>
            <DialogDescription>
              Upload medical reports for your family members or add a new family member.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Family Member Selection */}
            <div className="space-y-2">
              <Label htmlFor="family-member">Select Family Member</Label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a family member" />
                </SelectTrigger>
                <SelectContent>
                  {familyMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} ({member.relationship})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Add Family Member Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddMemberDialog(true)}
                className="w-full mt-2 border-medical-200 text-medical-700 hover:bg-medical-50"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Family Member
              </Button>
            </div>
            
            {/* Report Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="report-file">Upload File</Label>
              <Input
                id="report-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500">
                Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReportsDialog(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleReportUpload}
              disabled={!selectedMemberId || !reportFile || !reportType || isUploading}
              className="bg-medical-500 hover:bg-medical-600"
            >
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Family Member Dialog */}
      <AddFamilyMemberDialog
        isOpen={showAddMemberDialog}
        onClose={() => setShowAddMemberDialog(false)}
        onSave={handleAddFamilyMember}
      />
      
      {/* Prescription Details Dialog */}
      <PrescriptionDialog
        prescription={selectedPrescription}
        isOpen={showPrescriptionDialog}
        onClose={() => {
          setShowPrescriptionDialog(false);
          setSelectedPrescription(null);
          setSelectedMember(null);
        }}
        memberId={selectedMember || undefined}
        memberName={selectedMember ? (mockFamilyMembers.find(m => m.id === selectedMember)?.name || undefined) : undefined}
      />
    </div>
  );
});

Dashboard.displayName = "Dashboard";
export default Dashboard;