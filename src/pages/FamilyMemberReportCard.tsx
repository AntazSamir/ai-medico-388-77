import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
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
import PrescriptionExtractor from "@/components/PrescriptionExtractor";
import { ExtractedPrescriptionData } from "@/utils/prescriptionExtractor";
import { PrescriptionsSection } from "@/components/prescriptions/PrescriptionsSection";
import { Prescription } from "@/components/prescriptions/PrescriptionCard";
import { 
  User,
  FileText, 
  Calendar, 
  Heart, 
  Activity,
  Stethoscope,
  Download,
  ChevronDown,
  Eye,
  Paperclip,
  ArrowLeft,
  Plus,
  Pill,
  X,
  Upload,
  Clock,
  Edit,
  Bot
} from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { RecentActivityManager } from "@/utils/recentActivity";

// Mock family members data - Load from localStorage
const getMockFamilyMembers = () => {
  const saved = localStorage.getItem('familyMembers');
  if (saved) {
    return JSON.parse(saved);
  }
  // Default fallback data only if no localStorage data exists
  return [
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
};

// Mock family medical histories for existing sample members
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

// Mock family prescriptions for existing sample members - matching main profile complexity
const mockFamilyPrescriptions = {
  "2": [
    {
      id: "p2-1",
      medicationName: "Amoxicillin 500mg",
      instructions: "Take 2 tablets daily with food for bacterial infection",
      doctor: "Dr. Williams",
      date: "2023-09-15",
      status: "Active" as const,
      dosage: { morning: 1, noon: 0, afternoon: 1, night: 0 },
      time: "8:00 AM, 6:00 PM",
      notes: "Complete full course even if symptoms improve",
      additionalMedicines: [
        {
          medicationName: "Omeprazole 20mg",
          dosage: { morning: 1, noon: 0, afternoon: 0, night: 0 },
          time: "Before breakfast"
        },
        {
          medicationName: "Probiotics",
          dosage: { morning: 0, noon: 1, afternoon: 0, night: 1 },
          time: "With lunch and dinner"
        }
      ]
    },
    {
      id: "p2-2",
      medicationName: "Ibuprofen 400mg",
      instructions: "Take as needed for pain, max 3 times daily",
      doctor: "Dr. Johnson",
      date: "2024-01-10",
      status: "As Needed" as const,
      dosage: { morning: 1, noon: 1, afternoon: 1, night: 0 },
      time: "As needed",
      notes: "Do not exceed 1200mg per day",
      additionalMedicines: [
        {
          medicationName: "Paracetamol 500mg",
          dosage: { morning: 2, noon: 2, afternoon: 2, night: 2 },
          time: "Every 6 hours as backup"
        }
      ]
    }
  ],
  "3": [
    {
      id: "p3-1",
      medicationName: "Children's Amoxicillin 250mg",
      instructions: "Take 1 tablet twice daily with food",
      doctor: "Dr. Peterson",
      date: "2023-12-15",
      status: "Active" as const,
      dosage: { morning: 1, noon: 0, afternoon: 1, night: 0 },
      time: "8:00 AM, 6:00 PM",
      notes: "Age-appropriate antibiotic for infection",
      additionalMedicines: [
        {
          medicationName: "Children's Probiotics",
          dosage: { morning: 0, noon: 1, afternoon: 0, night: 0 },
          time: "With lunch"
        },
        {
          medicationName: "Children's Multivitamin",
          dosage: { morning: 1, noon: 0, afternoon: 0, night: 0 },
          time: "With breakfast"
        }
      ]
    },
    {
      id: "p3-2",
      medicationName: "Children's Vitamin D3 400IU",
      instructions: "Take 1 chewable tablet daily for bone health",
      doctor: "Dr. Peterson",
      date: "2023-08-20",
      status: "Active" as const,
      dosage: { morning: 1, noon: 0, afternoon: 0, night: 0 },
      time: "8:00 AM",
      notes: "Take with fatty foods for better absorption",
      additionalMedicines: [
        {
          medicationName: "Calcium Chewables 300mg",
          dosage: { morning: 1, noon: 0, afternoon: 0, night: 1 },
          time: "Morning and evening with meals"
        }
      ]
    }
  ],
  "4": [
    {
      id: "p4-1",
      medicationName: "Children's Multivitamin Gummies",
      instructions: "Take 2 gummies daily with breakfast",
      doctor: "Dr. Wilson",
      date: "2023-11-20",
      status: "Active" as const,
      dosage: { morning: 2, noon: 0, afternoon: 0, night: 0 },
      time: "8:00 AM",
      notes: "Age-appropriate vitamin supplement with fun flavors",
      additionalMedicines: [
        {
          medicationName: "Vitamin D Drops 400IU",
          dosage: { morning: 1, noon: 0, afternoon: 0, night: 0 },
          time: "With breakfast"
        },
        {
          medicationName: "Omega-3 Kids 250mg",
          dosage: { morning: 1, noon: 0, afternoon: 1, night: 0 },
          time: "With breakfast and lunch"
        },
        {
          medicationName: "Iron Supplement Kids 10mg",
          dosage: { morning: 1, noon: 0, afternoon: 0, night: 0 },
          time: "With vitamin C for better absorption"
        }
      ]
    },
    {
      id: "p4-2",
      medicationName: "Children's Probiotic Chewables",
      instructions: "Take 1 tablet daily to support digestive health",
      doctor: "Dr. Wilson",
      date: "2023-10-15",
      status: "Active" as const,
      dosage: { morning: 0, noon: 1, afternoon: 0, night: 0 },
      time: "12:00 PM",
      notes: "Supports healthy gut bacteria and immune system",
      additionalMedicines: [
        {
          medicationName: "Zinc Gummies 5mg",
          dosage: { morning: 1, noon: 0, afternoon: 0, night: 0 },
          time: "With breakfast for immune support"
        }
      ]
    }
  ]
};

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
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
  files: UploadedFile[];
};


export default function FamilyMemberReportCard() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State to store the family member data
  const [familyMember, setFamilyMember] = useState(null);
  
  // Load family member data from localStorage on mount
  useEffect(() => {
    console.log('FamilyMemberReportCard mounted with memberId:', memberId);
    const allMembers = getMockFamilyMembers();
    const foundMember = allMembers.find(member => member.id === memberId);
    console.log('Found family member:', foundMember);
    console.log('All members:', allMembers);
    setFamilyMember(foundMember || null);
  }, [memberId]);
  
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [showPrescriptions, setShowPrescriptions] = useState(true);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [showPrescriptionExtractor, setShowPrescriptionExtractor] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<string | null>(null);
  // Initialize with sample data for existing members, empty for new members
  const [medicalHistory, setMedicalHistory] = useState<MedicalRecord[]>(() => {
    return mockFamilyMedicalHistories[memberId as keyof typeof mockFamilyMedicalHistories] || [];
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    return mockFamilyPrescriptions[memberId as keyof typeof mockFamilyPrescriptions] || [];
  });
  const [newPrescription, setNewPrescription] = useState<{
    medicationName: string;
    instructions: string;
    doctor: string;
    date: string;
    status: "Active" | "Completed" | "As Needed";
    notes: string;
    dosage: {
      morning: number;
      noon: number;
      afternoon: number;
      night: number;
    };
    time: string;
    additionalMedicines: {
      medicationName: string;
      dosage: {
        morning: number;
        noon: number;
        afternoon: number;
        night: number;
      };
      time: string;
    }[];
  }>({
    medicationName: "",
    instructions: "",
    doctor: "",
    date: "",
    status: "Active",
    notes: "",
    dosage: { morning: 0, noon: 0, afternoon: 0, night: 0 },
    time: "",
    additionalMedicines: []
  });
  const [newRecord, setNewRecord] = useState({
    patientName: familyMember?.name || "",
    date: "",
    type: "Consultation",
    diagnosis: "",
    symptoms: "",
    treatment: "",
    summary: "",
    doctor: "",
    visitTime: "",
    visitLocation: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    weight: ""
  });

  if (!familyMember) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-medical-50 to-medical-100">
        <div className="max-w-4xl mx-auto pt-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Family Member Not Found</h1>
          <Button onClick={() => navigate("/family")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Family Members
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-800";
      case "Completed": return "bg-blue-100 text-blue-800";
      case "Recent": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPrescriptionStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Completed": return "bg-gray-100 text-gray-800";
      case "As Needed": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddRecord = () => {
    if (!newRecord.patientName || !newRecord.date || !newRecord.diagnosis || !newRecord.symptoms) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const record: MedicalRecord = {
      id: Date.now().toString(),
      ...newRecord,
      status: "Recent",
      files: [...uploadedFiles]
    };

    setMedicalHistory([record, ...medicalHistory]);
    setNewRecord({
      patientName: familyMember.name,
      date: "",
      type: "Consultation",
      diagnosis: "",
      symptoms: "",
      treatment: "",
      summary: "",
      doctor: "",
      visitTime: "",
      visitLocation: "",
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: ""
    });
    setUploadedFiles([]);
    setShowAddRecord(false);
    
    toast({
      title: "Success",
      description: "Medical record added successfully",
    });
  };

  const handleAddPrescription = () => {
    if (!newPrescription.medicationName || !newPrescription.instructions) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingPrescriptionId) {
      // Update existing prescription
      const updatedPrescriptions = prescriptions.map(p => 
        p.id === editingPrescriptionId 
          ? { ...newPrescription, id: editingPrescriptionId, image: prescriptionImage || p.image }
          : p
      );
      setPrescriptions(updatedPrescriptions);
      setEditingPrescriptionId(null);
      
      toast({
        title: "Success",
        description: "Prescription updated successfully",
      });
    } else {
      // Add new prescription
      const prescription: Prescription = {
        id: Date.now().toString(),
        ...newPrescription,
        image: prescriptionImage || undefined
      };

      setPrescriptions([prescription, ...prescriptions]);
      
      toast({
        title: "Success",
        description: "Prescription added successfully",
      });
    }

    setNewPrescription({
      medicationName: "",
      instructions: "",
      doctor: "",
      date: "",
      status: "Active",
      notes: "",
      dosage: { morning: 0, noon: 0, afternoon: 0, night: 0 },
      time: "",
      additionalMedicines: []
    });
    setPrescriptionImage(null);
    setShowAddPrescription(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPrescriptionImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractedPrescriptionSave = (extractedData: ExtractedPrescriptionData, image?: string) => {
    // Convert extracted medicines to prescription format
    const newPrescriptions = extractedData.medicines.map(medicine => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      medicationName: medicine.medicationName,
      instructions: medicine.instructions,
      doctor: extractedData.doctorName || "Dr. (From prescription)",
      date: extractedData.date || new Date().toISOString().split('T')[0],
      status: "Active" as const,
      dosage: medicine.dosage,
      time: `${medicine.frequency || ''} ${medicine.duration || ''}`.trim(),
      notes: extractedData.notes,
      image: image || undefined
    }));

    // Add all extracted prescriptions
    setPrescriptions([...newPrescriptions, ...prescriptions]);
    
    toast({
      title: "Prescriptions added successfully!",
      description: `Added ${newPrescriptions.length} medicine(s) for ${familyMember.name}`,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles: UploadedFile[] = Array.from(files).map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };

  const handleRecordClick = (record: MedicalRecord) => {
    console.log('Tracking report view:', {
      id: record.id,
      type: record.type,
      diagnosis: record.diagnosis,
      memberId: familyMember.id,
      memberName: familyMember.name
    });
    
    setSelectedRecord(record);
    setShowRecordDialog(true);
    
    // Track report view in recent activity
    RecentActivityManager.addReportView(
      record.id,
      record.type,
      record.diagnosis || record.type,
      familyMember.id,
      familyMember.name
    );
  };

  const handleExport = (format: 'pdf' | 'doc') => {
    if (!selectedRecord) return;
    
    const content = `
Medical Record Export

Patient: ${familyMember.name}
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
- Age: ${familyMember.age}
- Gender: ${familyMember.gender}
- Blood Type: ${familyMember.bloodType}
- Allergies: ${familyMember.allergies.join(', ') || 'None'}
- Emergency Contact: ${familyMember.emergencyContact}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${familyMember.name.replace(' ', '-')}-record-${selectedRecord.date}.${format === 'pdf' ? 'txt' : 'txt'}`;
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

  return (
    <>
      <PageTransition>
        <div className="min-h-screen p-4 bg-gradient-to-br from-medical-50 to-medical-100">
          <div className="max-w-6xl mx-auto space-y-6 pt-4">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/family")}
                  className="p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <User className="h-8 w-8 text-medical-500" />
                <h1 className="text-3xl font-bold text-gray-900">{familyMember.name} - Report Card</h1>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate("/symptoms")}
                  variant="outline"
                  className="border-medical-200 text-medical-700 hover:bg-medical-50"
                >
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Analyze Symptoms
                </Button>
                <Button 
                  onClick={() => navigate("/profile")}
                  variant="outline"
                >
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </Button>
              </div>
            </div>

            {/* Family Member Info */}
            <Card className="glass-card p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Name:</span>
                      <p className="text-gray-900">{familyMember.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Age:</span>
                      <p className="text-gray-900">{familyMember.age} years</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Gender:</span>
                      <p className="text-gray-900">{familyMember.gender}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Relationship:</span>
                      <p className="text-gray-900">{familyMember.relationship}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <p className="text-gray-900">{familyMember.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Phone:</span>
                      <p className="text-gray-900">{familyMember.phone}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Information</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Blood Type:</span>
                      <p className="text-gray-900">{familyMember.bloodType}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Allergies:</span>
                      <div className="flex gap-2 mt-1">
                        {familyMember.allergies.length > 0 ? (
                          familyMember.allergies.map((allergy, index) => (
                            <Badge key={index} variant="destructive">{allergy}</Badge>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">No known allergies</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Emergency Contact:</span>
                      <p className="text-gray-900">{familyMember.emergencyContact}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Last Visit:</span>
                      <p className="text-gray-900">{familyMember.lastVisit}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Medical History */}
            <Card className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-medical-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Medical Records</h2>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowPrescriptions(!showPrescriptions)}
                    variant="outline"
                    className="border-medical-200 text-medical-700 hover:bg-medical-50 btn-hover-lift"
                  >
                    <Pill className="mr-2 h-4 w-4" />
                    {showPrescriptions ? "Hide Prescriptions" : "Show Prescriptions"}
                  </Button>
                  <Button 
                    onClick={() => setShowAddRecord(true)}
                    className="bg-medical-500 hover:bg-medical-600 text-white btn-hover-lift"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Record
                  </Button>
                </div>
              </div>

              {/* Prescriptions Section */}
              {showPrescriptions && (
                <div className="mb-6">
                  <PrescriptionsSection
                    prescriptions={prescriptions}
                    setPrescriptions={setPrescriptions}
                    onAddPrescription={() => setShowAddPrescription(true)}
                    onEditPrescription={(prescription: Prescription) => {
                      setEditingPrescriptionId(prescription.id);
                      setNewPrescription({
                        medicationName: prescription.medicationName,
                        instructions: prescription.instructions,
                        doctor: prescription.doctor,
                        date: prescription.date,
                        status: prescription.status,
                        notes: prescription.notes || "",
                        dosage: prescription.dosage || { morning: 0, noon: 0, afternoon: 0, night: 0 },
                        time: prescription.time || "",
                        additionalMedicines: prescription.additionalMedicines || []
                      });
                      setShowAddPrescription(true);
                    }}
                  />
                </div>
              )}

              {/* Medical Records List */}
              <div className="space-y-4">
                {medicalHistory.length > 0 ? (
                  medicalHistory.map((record) => (
                    <Card 
                      key={record.id} 
                      className="p-4 border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-medical-300"
                      onClick={() => handleRecordClick(record)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-medical-100 rounded-lg">
                            {record.type === "Emergency" ? (
                              <Activity className="h-5 w-5 text-red-600" />
                            ) : record.type === "Check-up" ? (
                              <Heart className="h-5 w-5 text-green-600" />
                            ) : (
                              <FileText className="h-5 w-5 text-medical-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{record.diagnosis}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              {record.date}
                              <span>•</span>
                              <span>{record.type}</span>
                              <span>•</span>
                              <span>{record.doctor}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{record.summary}</p>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Medical Records</h3>
                    <p className="text-gray-500">No medical history available for this family member</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </PageTransition>

      {/* Medical Record Detail Dialog */}
      <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-medical-500" />
              Medical Record Details
            </DialogTitle>
            <DialogDescription>
              Complete medical record for {familyMember.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              {/* Patient Information Header */}
              <div className="bg-medical-50 p-4 rounded-lg">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-medical-800 mb-2">Patient Information</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Name:</span> {familyMember.name}</div>
                      <div><span className="font-medium">Age:</span> {familyMember.age}</div>
                      <div><span className="font-medium">Blood Type:</span> {familyMember.bloodType}</div>
                      <div><span className="font-medium">Gender:</span> {familyMember.gender}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-medical-800 mb-2">Contact Details</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Phone:</span> {familyMember.phone}</div>
                      <div><span className="font-medium">Email:</span> {familyMember.email}</div>
                      <div><span className="font-medium">Relationship:</span> {familyMember.relationship}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-medical-800 mb-2">Medical Info</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Allergies:</span> {familyMember.allergies.join(", ") || "None"}</div>
                      <div><span className="font-medium">Emergency:</span> {familyMember.emergencyContact}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visit Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">Visit Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Date & Time:</span>
                      <span className="text-gray-900">{selectedRecord.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Visit Type:</span>
                      <Badge variant="outline" className="bg-blue-50">{selectedRecord.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Attending Doctor:</span>
                      <span className="text-gray-900">{selectedRecord.doctor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Status:</span>
                      <Badge className={getStatusColor(selectedRecord.status)}>
                        {selectedRecord.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">Vital Signs</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-500 uppercase">Blood Pressure</div>
                      <div className="font-semibold">{familyMember.age <= 12 ? "90/60 mmHg" : "120/80 mmHg"}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-500 uppercase">Heart Rate</div>
                      <div className="font-semibold">{familyMember.age <= 12 ? "100 bpm" : "72 bpm"}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-500 uppercase">Temperature</div>
                      <div className="font-semibold">98.6°F</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-xs text-gray-500 uppercase">Weight</div>
                      <div className="font-semibold">{familyMember.age <= 12 ? `${familyMember.age * 7} lbs` : "150 lbs"}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Medical Assessment */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">Medical Assessment</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Chief Complaint & Symptoms</h5>
                      <div className="bg-red-50 border border-red-200 p-3 rounded">
                        <p className="text-gray-900">{selectedRecord.symptoms}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Diagnosis</h5>
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                        <p className="font-medium text-blue-900">{selectedRecord.diagnosis}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Treatment Plan</h5>
                      <div className="bg-green-50 border border-green-200 p-3 rounded">
                        <p className="text-gray-900">{selectedRecord.treatment}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Follow-up Instructions</h5>
                      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                        <p className="text-gray-900">{familyMember.age <= 12 ? "Follow-up with pediatrician if symptoms worsen. Continue monitoring." : "Return in 2 weeks for follow-up. Continue prescribed medication. Monitor symptoms."}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Doctor's Notes */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">Doctor's Summary</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 leading-relaxed">{selectedRecord.summary}</p>
                </div>
              </div>

              {/* Prescribed Medications */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">Prescribed Medications</h4>
                <div className="space-y-3">
                  {prescriptions.slice(0, 2).map((prescription) => (
                    <div key={prescription.id} className="flex items-center justify-between p-3 bg-blue-50 rounded">
                      <div>
                        <div className="font-medium text-blue-900">{prescription.medicationName}</div>
                        <div className="text-sm text-blue-700">{prescription.instructions}</div>
                      </div>
                      <Badge className={getPrescriptionStatusColor(prescription.status)}>{prescription.status}</Badge>
                    </div>
                  ))}
                  {prescriptions.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No medications prescribed for this visit
                    </div>
                  )}
                </div>
              </div>

              {selectedRecord.files && selectedRecord.files.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">Attached Files & Lab Results</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedRecord.files.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{file.name}</div>
                            <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                          </div>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter className="flex gap-2 pt-4 border-t">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-medical-600 hover:bg-medical-700">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <FileText className="mr-2 h-4 w-4" />
                    Download as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("doc")}>
                    <FileText className="mr-2 h-4 w-4" />
                    Download as Word
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={() => setShowRecordDialog(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Medical Record Dialog */}
      <Dialog open={showAddRecord} onOpenChange={setShowAddRecord}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Medical Record for {familyMember.name}</DialogTitle>
            <DialogDescription>
              Fill in the details for the new medical record
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Patient Name</label>
                <Input
                  value={newRecord.patientName}
                  onChange={(e) => setNewRecord({...newRecord, patientName: e.target.value})}
                  className="mt-1"
                  readOnly
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date *</label>
                <Input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newRecord.type}
                  onChange={(e) => setNewRecord({...newRecord, type: e.target.value})}
                  className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-medical-500 focus:border-medical-500"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Check-up">Check-up</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Specialist">Specialist</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Doctor *</label>
                <Input
                  value={newRecord.doctor}
                  onChange={(e) => setNewRecord({...newRecord, doctor: e.target.value})}
                  placeholder="Dr. Smith"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Medical Details */}
            <div>
              <label className="text-sm font-medium text-gray-700">Diagnosis *</label>
              <Input
                value={newRecord.diagnosis}
                onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                placeholder="Primary diagnosis"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Symptoms *</label>
              <Textarea
                value={newRecord.symptoms}
                onChange={(e) => setNewRecord({...newRecord, symptoms: e.target.value})}
                placeholder="Describe the symptoms..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Treatment</label>
              <Textarea
                value={newRecord.treatment}
                onChange={(e) => setNewRecord({...newRecord, treatment: e.target.value})}
                placeholder="Treatment plan and medications..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Summary</label>
              <Textarea
                value={newRecord.summary}
                onChange={(e) => setNewRecord({...newRecord, summary: e.target.value})}
                placeholder="Visit summary and notes..."
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Visit Information */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Visit Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Visit Time</label>
                  <Input
                    type="time"
                    value={newRecord.visitTime}
                    onChange={(e) => setNewRecord({...newRecord, visitTime: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <Input
                    value={newRecord.visitLocation}
                    onChange={(e) => setNewRecord({...newRecord, visitLocation: e.target.value})}
                    placeholder="Hospital/Clinic name"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Vital Signs */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Vital Signs</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Blood Pressure</label>
                  <Input
                    value={newRecord.bloodPressure}
                    onChange={(e) => setNewRecord({...newRecord, bloodPressure: e.target.value})}
                    placeholder="120/80"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Heart Rate</label>
                  <Input
                    value={newRecord.heartRate}
                    onChange={(e) => setNewRecord({...newRecord, heartRate: e.target.value})}
                    placeholder="72 bpm"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Temperature</label>
                  <Input
                    value={newRecord.temperature}
                    onChange={(e) => setNewRecord({...newRecord, temperature: e.target.value})}
                    placeholder="98.6°F"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Weight</label>
                  <Input
                    value={newRecord.weight}
                    onChange={(e) => setNewRecord({...newRecord, weight: e.target.value})}
                    placeholder="150 lbs"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* File Attachments */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">File Attachments</h3>
              <div className="space-y-3">
                <div>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </label>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900 flex-1">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRecord(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRecord} className="bg-medical-500 hover:bg-medical-600">
              Add Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Prescription Dialog */}
      <Dialog open={showAddPrescription} onOpenChange={setShowAddPrescription}>
        <DialogContent 
          className="max-w-4xl max-h-[80vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-medical-500" />
              {editingPrescriptionId ? "Edit Prescription" : "Add New Prescription"}
            </DialogTitle>
            <DialogDescription>
              Upload prescription image and enter medication details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Prescription Image</h4>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {prescriptionImage ? (
                  <div className="space-y-4">
                    <img 
                      src={prescriptionImage} 
                      alt="Prescription" 
                      className="max-w-full max-h-48 mx-auto rounded border"
                    />
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setPrescriptionImage(null)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-600">Upload prescription image</p>
                      <p className="text-sm text-gray-500">PNG, JPG, or JPEG up to 10MB</p>
                    </div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Prescription Details Form */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Prescription Details</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Doctor</label>
                  <Input
                    placeholder="e.g., Dr. Smith"
                    value={newPrescription.doctor}
                    onChange={(e) => setNewPrescription({...newPrescription, doctor: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date Prescribed</label>
                  <Input
                    type="date"
                    value={newPrescription.date}
                    onChange={(e) => setNewPrescription({...newPrescription, date: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newPrescription.status}
                  onChange={(e) => setNewPrescription({...newPrescription, status: e.target.value as "Active" | "Completed" | "As Needed"})}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="As Needed">As Needed</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Medication Name *</label>
                <Input
                  placeholder="e.g., Amoxicillin 500mg"
                  value={newPrescription.medicationName}
                  onChange={(e) => setNewPrescription({...newPrescription, medicationName: e.target.value})}
                />
              </div>

              {/* Dosage Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Dosage (Number of pills)</label>
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Morning</label>
                    <Input
                      type="number"
                      min="0"
                      value={newPrescription.dosage.morning}
                      onChange={(e) => setNewPrescription({
                        ...newPrescription, 
                        dosage: { ...newPrescription.dosage, morning: parseInt(e.target.value) || 0 }
                      })}
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Noon</label>
                    <Input
                      type="number"
                      min="0"
                      value={newPrescription.dosage.noon}
                      onChange={(e) => setNewPrescription({
                        ...newPrescription, 
                        dosage: { ...newPrescription.dosage, noon: parseInt(e.target.value) || 0 }
                      })}
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Afternoon</label>
                    <Input
                      type="number"
                      min="0"
                      value={newPrescription.dosage.afternoon}
                      onChange={(e) => setNewPrescription({
                        ...newPrescription, 
                        dosage: { ...newPrescription.dosage, afternoon: parseInt(e.target.value) || 0 }
                      })}
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Night</label>
                    <Input
                      type="number"
                      min="0"
                      value={newPrescription.dosage.night}
                      onChange={(e) => setNewPrescription({
                        ...newPrescription, 
                        dosage: { ...newPrescription.dosage, night: parseInt(e.target.value) || 0 }
                      })}
                      className="text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Time</label>
                <Input
                  placeholder="e.g., 8:00 AM, 2:00 PM, 8:00 PM"
                  value={newPrescription.time}
                  onChange={(e) => setNewPrescription({...newPrescription, time: e.target.value})}
                />
              </div>

              {/* Add More Medicine Button */}
              <div className="flex justify-center pt-2">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  className="border-medical-200 text-medical-700 hover:bg-medical-50"
                  onClick={() => {
                    setNewPrescription({
                      ...newPrescription,
                      additionalMedicines: [
                        ...newPrescription.additionalMedicines,
                        {
                          medicationName: "",
                          dosage: { morning: 0, noon: 0, afternoon: 0, night: 0 },
                          time: ""
                        }
                      ]
                    });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add More Medicine
                </Button>
              </div>

              {/* Additional Medicines */}
              {newPrescription.additionalMedicines.map((medicine, index) => (
                <div key={index} className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium text-gray-800">Medicine {index + 2}</h5>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updatedMedicines = newPrescription.additionalMedicines.filter((_, i) => i !== index);
                        setNewPrescription({
                          ...newPrescription,
                          additionalMedicines: updatedMedicines
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Medication Name</label>
                    <Input
                      placeholder="e.g., Ibuprofen 400mg"
                      value={medicine.medicationName}
                      onChange={(e) => {
                        const updatedMedicines = [...newPrescription.additionalMedicines];
                        updatedMedicines[index].medicationName = e.target.value;
                        setNewPrescription({
                          ...newPrescription,
                          additionalMedicines: updatedMedicines
                        });
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Dosage (Number of pills)</label>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Morning</label>
                        <Input
                          type="number"
                          min="0"
                          value={medicine.dosage.morning}
                          onChange={(e) => {
                            const updatedMedicines = [...newPrescription.additionalMedicines];
                            updatedMedicines[index].dosage.morning = parseInt(e.target.value) || 0;
                            setNewPrescription({
                              ...newPrescription,
                              additionalMedicines: updatedMedicines
                            });
                          }}
                          className="text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Noon</label>
                        <Input
                          type="number"
                          min="0"
                          value={medicine.dosage.noon}
                          onChange={(e) => {
                            const updatedMedicines = [...newPrescription.additionalMedicines];
                            updatedMedicines[index].dosage.noon = parseInt(e.target.value) || 0;
                            setNewPrescription({
                              ...newPrescription,
                              additionalMedicines: updatedMedicines
                            });
                          }}
                          className="text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Afternoon</label>
                        <Input
                          type="number"
                          min="0"
                          value={medicine.dosage.afternoon}
                          onChange={(e) => {
                            const updatedMedicines = [...newPrescription.additionalMedicines];
                            updatedMedicines[index].dosage.afternoon = parseInt(e.target.value) || 0;
                            setNewPrescription({
                              ...newPrescription,
                              additionalMedicines: updatedMedicines
                            });
                          }}
                          className="text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500">Night</label>
                        <Input
                          type="number"
                          min="0"
                          value={medicine.dosage.night}
                          onChange={(e) => {
                            const updatedMedicines = [...newPrescription.additionalMedicines];
                            updatedMedicines[index].dosage.night = parseInt(e.target.value) || 0;
                            setNewPrescription({
                              ...newPrescription,
                              additionalMedicines: updatedMedicines
                            });
                          }}
                          className="text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Time</label>
                    <Input
                      placeholder="e.g., 8:00 AM, 2:00 PM"
                      value={medicine.time}
                      onChange={(e) => {
                        const updatedMedicines = [...newPrescription.additionalMedicines];
                        updatedMedicines[index].time = e.target.value;
                        setNewPrescription({
                          ...newPrescription,
                          additionalMedicines: updatedMedicines
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Instructions *</label>
                <Textarea
                  placeholder="e.g., Take 2 tablets daily with food"
                  value={newPrescription.instructions}
                  onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Additional Notes</label>
                <Textarea
                  placeholder="Any additional notes or special instructions"
                  value={newPrescription.notes}
                  onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
                  rows={2}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowAddPrescription(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPrescription} className="bg-medical-600 hover:bg-medical-700">
              {editingPrescriptionId ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {editingPrescriptionId ? "Update Prescription" : "Add Prescription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Prescription Extractor */}
      <PrescriptionExtractor
        isOpen={showPrescriptionExtractor}
        onClose={() => setShowPrescriptionExtractor(false)}
        onSave={handleExtractedPrescriptionSave}
      />
    </>
  );
}