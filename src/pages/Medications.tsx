import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PageTransition from "@/components/PageTransition";
import Navigation from "@/components/Navigation";
import { PrescriptionDialog } from "@/components/prescriptions/PrescriptionDialog";
import { Prescription } from "@/components/prescriptions/PrescriptionCard";
import {
  ArrowLeft,
  User,
  Pill,
  ChevronDown,
  Eye,
  Search,
  Calendar,
  Clock,
  Users,
  Crown,
  Star
} from "lucide-react";

// Mock patient data for main user
const mockPatient = {
  id: "main-user",
  name: "John Doe",
  age: 35,
  gender: "Male",
  email: "john.doe@email.com",
  phone: "+1 (555) 123-4567",
  relationship: "Primary User",
  bloodType: "O+",
  allergies: ["Shellfish", "Dust"],
  emergencyContact: "Jane Doe - (555) 987-6543",
};

// Mock family members
const mockFamilyMembers = [
  {
    id: "2",
    name: "Jane Doe",
    age: 32,
    gender: "Female",
    email: "jane.doe@email.com",
    phone: "+1 (555) 123-4568",
    relationship: "Spouse",
    bloodType: "A-",
    allergies: ["Latex"],
    emergencyContact: "John Doe - (555) 123-4567",
  },
  {
    id: "3",
    name: "Michael Doe",
    age: 8,
    gender: "Male",
    email: "guardian@email.com",
    phone: "+1 (555) 123-4567",
    relationship: "Son",
    bloodType: "O+",
    allergies: ["Peanuts"],
    emergencyContact: "John Doe - (555) 123-4567",
  },
  {
    id: "4",
    name: "Emily Doe",
    age: 5,
    gender: "Female",
    email: "guardian@email.com",
    phone: "+1 (555) 123-4567",
    relationship: "Daughter",
    bloodType: "A+",
    allergies: [],
    emergencyContact: "Jane Doe - (555) 987-6543",
  }
];

// Mock prescriptions for all members
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

interface FamilyMember {
  id: string;
  name: string;
  age: number;
  gender: string;
  relationship: string;
  bloodType?: string;
  allergies?: string[];
}

export default function Medications() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "age" | "relationship">("name");

  // Combine main user with family members, ensuring main user is first
  const allMembers = [
    { ...mockPatient, isPrimaryUser: true },
    ...mockFamilyMembers.map(member => ({ ...member, isPrimaryUser: false }))
  ];

  // Filter and sort members
  const filteredMembers = allMembers
    .filter(member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.relationship.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Always keep primary user at top
      if (a.isPrimaryUser) return -1;
      if (b.isPrimaryUser) return 1;
      
      switch (sortBy) {
        case "age":
          return a.age - b.age;
        case "relationship":
          return a.relationship.localeCompare(b.relationship);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionDialog(true);
  };

  const getPrescriptionCount = (memberId: string) => {
    return mockPrescriptions[memberId]?.length || 0;
  };

  const getActivePrescriptionCount = (memberId: string) => {
    return mockPrescriptions[memberId]?.filter(p => p.status === "Active").length || 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Completed": return "bg-gray-100 text-gray-800";
      case "As Needed": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <PageTransition>
      <Navigation />
      <div className="min-h-screen p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-medical-50 to-medical-100">
        <div className="safe-area-padding max-w-6xl mx-auto space-y-4 sm:space-y-6 pt-2 sm:pt-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-2 sm:mb-4 text-gray-600 hover:text-gray-800 p-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <Pill className="h-6 w-6 sm:h-8 sm:w-8 text-medical-500" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Family Medications</h1>
            </div>
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or relationship..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-medical-200 focus:border-medical-400"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-medical-200">
                  Sort by: {sortBy === "name" ? "Name" : sortBy === "age" ? "Age" : "Relationship"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("name")}>Name</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("age")}>Age</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("relationship")}>Relationship</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Family Members List */}
          <div className="grid gap-4 sm:gap-6">
            {filteredMembers.map((member) => {
              const prescriptions = mockPrescriptions[member.id] || [];
              const totalPrescriptions = getPrescriptionCount(member.id);
              const activePrescriptions = getActivePrescriptionCount(member.id);

              return (
                <Card key={member.id} className="glass-card border-medical-200 overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <User className="h-12 w-12 sm:h-16 sm:w-16 text-medical-500 bg-medical-50 p-2 sm:p-3 rounded-full" />
                          {member.isPrimaryUser && (
                            <Crown className="absolute -top-1 -right-1 h-6 w-6 text-yellow-500 bg-white rounded-full p-1" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg sm:text-xl text-foreground">
                              {member.name}
                            </CardTitle>
                            {member.isPrimaryUser && (
                              <Badge className="bg-medical-500 text-white">
                                <Star className="h-3 w-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground mt-1">
                            <span>{member.relationship}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{member.age} years old</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{member.gender}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-medical-500" />
                          <span className="text-sm font-medium">{totalPrescriptions} total</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {activePrescriptions} active
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {prescriptions.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-muted-foreground">Prescriptions</h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="border-medical-200">
                                View All ({prescriptions.length})
                                <ChevronDown className="ml-2 h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-80">
                              {prescriptions.map((prescription) => (
                                <DropdownMenuItem
                                  key={prescription.id}
                                  className="cursor-pointer p-3"
                                  onClick={() => handleViewPrescription(prescription)}
                                >
                                  <div className="flex flex-col space-y-1 w-full">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium text-sm">{prescription.medicationName}</span>
                                      <Badge className={`text-xs ${getStatusColor(prescription.status)}`}>
                                        {prescription.status}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span>{formatDate(prescription.date)}</span>
                                      <span>•</span>
                                      <span>{prescription.doctor}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {prescription.instructions}
                                    </p>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {/* Show first 2 prescriptions directly */}
                        <div className="grid gap-2">
                          {prescriptions.slice(0, 2).map((prescription) => (
                            <div
                              key={prescription.id}
                              className="p-3 rounded-lg bg-muted/30 border border-medical-100 hover:border-medical-300 cursor-pointer transition-colors"
                              onClick={() => handleViewPrescription(prescription)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{prescription.medicationName}</span>
                                <div className="flex items-center gap-2">
                                  <Badge className={`text-xs ${getStatusColor(prescription.status)}`}>
                                    {prescription.status}
                                  </Badge>
                                  <Eye className="h-4 w-4 text-medical-500" />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(prescription.date)}</span>
                                <span>•</span>
                                <span>{prescription.doctor}</span>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {prescription.instructions}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No prescriptions found</p>
                        <p className="text-xs mt-1">Prescriptions will appear here when added</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredMembers.length === 0 && (
            <Card className="glass-card text-center py-12">
              <CardContent>
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-2">No members found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or add new family members.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Prescription Details Dialog */}
      <PrescriptionDialog
        prescription={selectedPrescription}
        isOpen={showPrescriptionDialog}
        onClose={() => {
          setShowPrescriptionDialog(false);
          setSelectedPrescription(null);
        }}
      />
    </PageTransition>
  );
}