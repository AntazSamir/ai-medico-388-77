import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import Navigation from "@/components/Navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddFamilyMemberDialog from "@/components/AddFamilyMemberDialog";
import { 
  User, 
  FileText, 
  Calendar, 
  Plus, 
  Heart, 
  Activity,
  Clock,
  Stethoscope,
  Download,
  ChevronDown,
  Eye,
  Paperclip,
  Users,
  ArrowLeft,
  Search,
  Bot,
  Trash2,
  MoreVertical
} from "lucide-react";

// Mock family members data
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
    lastVisit: "2024-01-10"
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
    lastVisit: "2023-12-15"
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
    lastVisit: "2023-11-20"
  }
];

// Mock family medical histories
const mockFamilyMedicalHistories = {
  "2": [
    {
      id: "f2-1",
      date: "2024-01-10",
      type: "Check-up",
      diagnosis: "Annual Physical",
      symptoms: "Routine examination",
      treatment: "Continue healthy lifestyle",
      summary: "Comprehensive annual health check completed. All vital signs normal.",
      doctor: "Dr. Johnson",
      status: "Completed",
      files: []
    },
    {
      id: "f2-2",
      date: "2023-09-15",
      type: "Consultation",
      diagnosis: "Migraine",
      symptoms: "Severe headache, light sensitivity",
      treatment: "Prescribed medication, rest",
      summary: "Migraine episode treated successfully with medication.",
      doctor: "Dr. Williams",
      status: "Resolved",
      files: []
    }
  ],
  "3": [
    {
      id: "f3-1",
      date: "2023-12-15",
      type: "Consultation",
      diagnosis: "Common Cold",
      symptoms: "Runny nose, mild fever",
      treatment: "Rest, fluids",
      summary: "Typical childhood cold symptoms. Prescribed conservative treatment.",
      doctor: "Dr. Peterson",
      status: "Resolved",
      files: []
    },
    {
      id: "f3-2",
      date: "2023-08-20",
      type: "Check-up",
      diagnosis: "School Physical",
      symptoms: "Routine examination for school",
      treatment: "Cleared for activities",
      summary: "Annual school physical completed. All requirements met.",
      doctor: "Dr. Peterson",
      status: "Completed",
      files: []
    }
  ],
  "4": [
    {
      id: "f4-1",
      date: "2023-11-20",
      type: "Check-up",
      diagnosis: "Routine Pediatric Check",
      symptoms: "Growth and development assessment",
      treatment: "Vaccinations updated",
      summary: "Normal growth and development. All vaccinations up to date.",
      doctor: "Dr. Wilson",
      status: "Completed",
      files: []
    }
  ]
};

type MedicalRecord = {
  id: string;
  date: string;
  type: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  summary: string;
  doctor: string;
  status: string;
  files?: any[];
};

export default function FamilyMembers() {
  // Load family members from localStorage on component mount
  const [familyMembers, setFamilyMembers] = useState(() => {
    const saved = localStorage.getItem('familyMembers');
    return saved ? JSON.parse(saved) : mockFamilyMembers;
  });
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<typeof mockFamilyMembers[0] | null>(null);
  const [showFamilyProfile, setShowFamilyProfile] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filter family members based on search query
  const filteredFamilyMembers = familyMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.relationship.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.age.toString().includes(searchQuery)
  );

  const handleFamilyMemberClick = (member: typeof mockFamilyMembers[0]) => {
    console.log('Navigating to:', `/family/${member.id}`);
    navigate(`/family/${member.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-800";
      case "Completed": return "bg-blue-100 text-blue-800";
      case "Recent": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleRecordClick = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShowRecordDialog(true);
  };

  const handleExport = (format: 'pdf' | 'doc') => {
    if (!selectedRecord || !selectedFamilyMember) return;
    
    const content = `
Medical Record Export

Patient: ${selectedFamilyMember.name}
Date: ${selectedRecord.date}
Type: ${selectedRecord.type}
Doctor: ${selectedRecord.doctor}
Status: ${selectedRecord.status}

Diagnosis:
${selectedRecord.diagnosis}

Symptoms:
${selectedRecord.symptoms}

Treatment:
${selectedRecord.treatment}

Patient Information:
- Age: ${selectedFamilyMember.age}
- Gender: ${selectedFamilyMember.gender}
- Blood Type: ${selectedFamilyMember.bloodType}
- Allergies: ${selectedFamilyMember.allergies.join(', ') || 'None'}
- Emergency Contact: ${selectedFamilyMember.emergencyContact}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFamilyMember.name.replace(' ', '-')}-record-${selectedRecord.date}.${format === 'pdf' ? 'txt' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: `Medical record exported as ${format.toUpperCase()}`,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Eye className="h-4 w-4" />;
    if (fileType === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <Paperclip className="h-4 w-4" />;
  };

  const handleAddFamilyMember = (familyMember: any) => {
    console.log('New family member:', familyMember);
    
    // Generate a unique ID for the new family member
    const newId = (familyMembers.length + 1).toString();
    const newMember = {
      ...familyMember,
      id: newId,
      lastVisit: "Not yet visited"
    };
    
    // Add the new member to the list and save to localStorage
    const updatedMembers = [...familyMembers, newMember];
    setFamilyMembers(updatedMembers);
    localStorage.setItem('familyMembers', JSON.stringify(updatedMembers));
    
    toast({
      title: "Family Member Added",
      description: `${familyMember.name} has been added to your family members`,
    });
  };

  const handleDeleteFamilyMember = (memberId: string, memberName: string) => {
    const memberToDelete = familyMembers.find(member => member.id === memberId);
    if (!memberToDelete) return;
    
    const updatedMembers = familyMembers.filter(member => member.id !== memberId);
    setFamilyMembers(updatedMembers);
    localStorage.setItem('familyMembers', JSON.stringify(updatedMembers));
    
    toast({
      title: "Family Member Deleted",
      description: `${memberName} has been removed from your family members`,
      variant: "destructive",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUndoDelete(memberToDelete)}
          className="bg-white text-red-600 border-red-200 hover:bg-red-50"
        >
          Undo
        </Button>
      ),
    });
  };

  const handleUndoDelete = (deletedMember: typeof mockFamilyMembers[0]) => {
    const updatedMembers = [...familyMembers, deletedMember];
    setFamilyMembers(updatedMembers);
    localStorage.setItem('familyMembers', JSON.stringify(updatedMembers));
    
    toast({
      title: "Family Member Restored",
      description: `${deletedMember.name} has been restored to your family members`,
    });
  };

  return (
    <PageTransition>
      <Navigation />
      <div className="min-h-screen p-4 bg-gradient-to-br from-medical-50 to-medical-100">
        <div className="max-w-6xl mx-auto space-y-6 pt-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/profile")}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Users className="h-8 w-8 text-medical-500" />
              <h1 className="text-3xl font-bold text-gray-900">Family Members</h1>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate("/symptoms")}
                variant="outline"
                className="border-medical-200 text-medical-700 hover:bg-medical-50 btn-hover-lift"
              >
                <Stethoscope className="mr-2 h-4 w-4" />
                Analyze Symptoms
              </Button>
              <Button 
                onClick={() => navigate("/profile")}
                variant="outline"
                className="btn-hover-lift"
              >
                <User className="mr-2 h-4 w-4" />
                My Profile
              </Button>
            </div>
          </div>

          {/* Family Members Overview */}
          <Card className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-medical-500" />
                <h2 className="text-2xl font-bold text-gray-900">Family Members</h2>
              </div>
              <Button 
                onClick={() => setShowAddMemberDialog(true)}
                className="bg-medical-500 hover:bg-medical-600 text-white btn-hover-lift"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Family Member
              </Button>
            </div>

            {/* Search Box */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search family members by name, relationship, or age..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-medical-500 focus:ring-medical-500"
                />
              </div>
            </div>

            {/* Family Members Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFamilyMembers.length > 0 ? (
                filteredFamilyMembers.map((member, index) => (
                <Card 
                  key={member.id}
                  className="p-4 border border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-medical-300 relative group"
                >
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleFamilyMemberClick(member)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-medical-100 rounded-lg">
                        <User className="h-5 w-5 text-medical-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <div className="text-sm text-gray-500">{member.relationship} • Age: {member.age}</div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFamilyMember(member.id, member.name);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Blood Type:</span>
                        <span className="text-gray-900">{member.bloodType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Visit:</span>
                        <span className="text-gray-900">{member.lastVisit}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        {mockFamilyMedicalHistories[member.id]?.length || 0} Records
                      </Badge>
                      <Badge className="bg-medical-100 text-medical-800">
                        <Bot className="h-3 w-3 mr-1" />
                        AI Prescriptions
                      </Badge>
                      {member.allergies.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {member.allergies.length} Allergies
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No family members found matching your search.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Medical Record Detail Dialog */}
      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Medical Record Details</DialogTitle>
            <DialogDescription>
              Complete details for this medical record
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="text-gray-900">{selectedRecord.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="text-gray-900">{selectedRecord.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Doctor:</span>
                      <span className="text-gray-900">{selectedRecord.doctor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <Badge className={getStatusColor(selectedRecord.status)}>
                        {selectedRecord.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Medical Details</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Diagnosis:</span>
                      <p className="text-gray-900">{selectedRecord.diagnosis}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Symptoms:</span>
                      <p className="text-gray-900">{selectedRecord.symptoms}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Treatment & Summary</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Treatment:</span>
                    <p className="text-gray-900">{selectedRecord.treatment}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Summary:</span>
                    <p className="text-gray-900">{selectedRecord.summary}</p>
                  </div>
                </div>
              </div>

              {selectedRecord.files && selectedRecord.files.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Attached Files</h4>
                    <div className="space-y-2">
                      {selectedRecord.files.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-900">{file.name}</span>
                          <span className="text-xs text-gray-500">({file.size})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecordDialog(false)}>
              Close
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
    </PageTransition>
  );
}