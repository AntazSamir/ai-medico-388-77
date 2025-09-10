import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PrescriptionExtractor from "@/components/PrescriptionExtractor";
import { ExtractedPrescriptionData } from "@/utils/prescriptionExtractor";
import { PrescriptionsSection } from "@/components/prescriptions/PrescriptionsSection";
import { Prescription } from "@/components/prescriptions/PrescriptionCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  FileText, 
  Calendar, 
  Plus, 
  Edit, 
  Heart, 
  Activity,
  Clock,
  Stethoscope,
  Download,
  ChevronDown,
  Upload,
  X,
  Eye,
  Paperclip,
  Users,
  ArrowLeft,
  Pill,
  Bot
} from "lucide-react";

// Default patient data structure
const defaultPatient = {
  id: "1",
  name: "",
  age: "",
  gender: "",
  email: "",
  phone: "",
  address: "",
  bloodType: "",
  allergies: [],
  emergencyContact: ""
};

// Sample family members (always shown regardless of user's profile completeness)
const sampleFamilyMembers = [
  {
    id: "2",
    name: "Jane Doe",
    age: 32,
    gender: "Female",
    relationship: "Spouse",
    bloodType: "A-",
    allergies: ["Latex"]
  },
  {
    id: "3",
    name: "Michael Doe",
    age: 8,
    gender: "Male",
    relationship: "Son",
    bloodType: "O+",
    allergies: ["Peanuts"]
  },
  {
    id: "4",
    name: "Emily Doe",
    age: 5,
    gender: "Female",
    relationship: "Daughter",
    bloodType: "A+",
    allergies: []
  }
];


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
  files?: UploadedFile[];
};

// Prescription type is now imported from PrescriptionCard component

const mockMedicalHistory: MedicalRecord[] = [
  {
    id: "1",
    date: "2024-01-15",
    type: "Consultation",
    diagnosis: "Common Cold",
    symptoms: "Runny nose, sore throat, mild fever",
    treatment: "Rest, fluids, over-the-counter medication",
    summary: "Patient presented with typical cold symptoms. Prescribed conservative treatment plan with follow-up if symptoms worsen.",
    doctor: "Dr. Smith",
    status: "Resolved",
    files: []
  },
  {
    id: "2",
    date: "2023-12-10",
    type: "Check-up",
    diagnosis: "Annual Physical",
    symptoms: "Routine examination",
    treatment: "Continue healthy lifestyle",
    summary: "Comprehensive annual health check completed. All vital signs normal, patient in good health. Recommended continued regular exercise and balanced diet.",
    doctor: "Dr. Johnson",
    status: "Completed",
    files: []
  }
];

export default function Profile() {
  const [medicalHistory, setMedicalHistory] = useState(mockMedicalHistory);
  const [patient, setPatient] = useState(defaultPatient);
  const [loading, setLoading] = useState(true);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showRecordDialog, setShowRecordDialog] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showPrescriptions, setShowPrescriptions] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
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
        },
        {
          medicationName: "Probiotics",
          dosage: { morning: 0, noon: 1, afternoon: 0, night: 1 },
          time: "With lunch and dinner"
        },
        {
          medicationName: "Zinc Supplement 15mg",
          dosage: { morning: 1, noon: 0, afternoon: 0, night: 0 },
          time: "With breakfast"
        },
        {
          medicationName: "Vitamin C 500mg",
          dosage: { morning: 1, noon: 0, afternoon: 1, night: 0 },
          time: "Morning and afternoon"
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
      notes: "Do not exceed 1200mg per day",
      additionalMedicines: [
        {
          medicationName: "Paracetamol 500mg",
          dosage: { morning: 2, noon: 2, afternoon: 2, night: 2 },
          time: "Every 6 hours as backup"
        },
        {
          medicationName: "Topical Anti-inflammatory Gel",
          dosage: { morning: 1, noon: 0, afternoon: 1, night: 1 },
          time: "Apply to affected area 3 times daily"
        },
        {
          medicationName: "Muscle Relaxant 5mg",
          dosage: { morning: 0, noon: 0, afternoon: 0, night: 1 },
          time: "Before bedtime if severe pain"
        },
        {
          medicationName: "Magnesium 200mg",
          dosage: { morning: 0, noon: 0, afternoon: 0, night: 1 },
          time: "Before bed for muscle relaxation"
        },
        {
          medicationName: "Fish Oil 1000mg",
          dosage: { morning: 1, noon: 0, afternoon: 1, night: 0 },
          time: "With meals for anti-inflammatory support"
        }
      ]
    },
    {
      id: "3",
      medicationName: "Vitamin D3 1000IU",
      instructions: "Take 1 tablet daily with breakfast for bone health",
      doctor: "Dr. Johnson",
      date: "2023-12-01",
      status: "Active",
      dosage: { morning: 1, noon: 0, afternoon: 0, night: 0 },
      time: "8:00 AM",
      notes: "Take with fatty foods for better absorption",
      additionalMedicines: [
        {
          medicationName: "Calcium Carbonate 600mg",
          dosage: { morning: 1, noon: 0, afternoon: 0, night: 1 },
          time: "Morning and evening with meals"
        },
        {
          medicationName: "Vitamin K2 100mcg",
          dosage: { morning: 1, noon: 0, afternoon: 0, night: 0 },
          time: "With Vitamin D3"
        },
        {
          medicationName: "Magnesium Citrate 150mg",
          dosage: { morning: 0, noon: 0, afternoon: 0, night: 1 },
          time: "Before bedtime"
        },
        {
          medicationName: "Omega-3 500mg",
          dosage: { morning: 1, noon: 0, afternoon: 1, night: 0 },
          time: "With breakfast and lunch"
        },
        {
          medicationName: "B-Complex Vitamins",
          dosage: { morning: 1, noon: 0, afternoon: 0, night: 0 },
          time: "With breakfast"
        },
        {
          medicationName: "Multivitamin",
          dosage: { morning: 1, noon: 0, afternoon: 0, night: 0 },
          time: "With breakfast"
        }
      ]
    }
  ]);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [showPrescriptionExtractor, setShowPrescriptionExtractor] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  
  // Edit states for medical records
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<string | null>(null);
  
  const recordForm = useForm<MedicalRecord>();
  const prescriptionForm = useForm<Prescription>();
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
    patientName: "",
    date: "",
    type: "Consultation",
    diagnosis: "",
    symptoms: "",
    treatment: "",
    summary: "",
    doctor: "",
    // Visit Information
    visitTime: "",
    visitLocation: "",
    // Vital Signs
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    weight: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load user profile data from Supabase
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/login");
          return;
        }

        // Get user metadata from auth
        const userMetaData = session.user.user_metadata || {};
        const userEmail = session.user.email || "";
        
        // Create patient profile from available data
        const userProfile = {
          id: session.user.id,
          name: userMetaData.full_name || "",
          age: userMetaData.age || "",
          gender: userMetaData.gender || "",
          email: userEmail,
          phone: userMetaData.phone || "",
          address: userMetaData.address || "",
          bloodType: userMetaData.bloodType || "",
          allergies: userMetaData.allergies || [],
          emergencyContact: userMetaData.emergencyContact || ""
        };

        setPatient(userProfile);
        setNewRecord(prev => ({ ...prev, patientName: userProfile.name }));
      } catch (error) {
        console.error("Error loading user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate, toast]);

  const handleAddRecord = () => {
    // If at least one file/report is uploaded, allow saving without other fields
    const hasUploadedFiles = uploadedFiles && uploadedFiles.length > 0;
    if (!hasUploadedFiles && (!newRecord.patientName || !newRecord.date || !newRecord.diagnosis || !newRecord.symptoms)) {
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
      patientName: patient.name,
      date: "",
      type: "Consultation",
      diagnosis: "",
      symptoms: "",
      treatment: "",
      summary: "",
      doctor: "",
      // Visit Information
      visitTime: "",
      visitLocation: "",
      // Vital Signs
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
      const updatedPrescriptions = prescriptions.map((p) =>
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
        image: prescriptionImage || undefined,
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
      additionalMedicines: [],
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
      image: image || undefined // Use the image from the extractor
    }));

    // Add all extracted prescriptions
    setPrescriptions([...newPrescriptions, ...prescriptions]);
    
    toast({
      title: "Prescriptions added successfully!",
      description: `Added ${newPrescriptions.length} medicine(s) from the prescription`,
    });
  };

  const getPrescriptionStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Completed": return "bg-gray-100 text-gray-800";
      case "As Needed": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
    if (!selectedRecord) return;
    
    const content = `
Medical Record Export

Patient: ${patient.name}
Date: ${selectedRecord.date}
Type: ${selectedRecord.type}
Doctor: ${selectedRecord.doctor}
Status: ${selectedRecord.status}

Diagnosis: ${selectedRecord.diagnosis}
Symptoms: ${selectedRecord.symptoms}
Treatment: ${selectedRecord.treatment}

Summary:
${selectedRecord.summary}

This is a simulated export. In a real application, this would generate a ${format.toUpperCase()} document.
    `.trim();

    // Simulate file download
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `medical-record-${selectedRecord.id}.${format === 'pdf' ? 'txt' : 'txt'}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Export Complete",
      description: `Medical record exported as ${format.toUpperCase()}`,
    });
  };

  // Edit functions for medical records
  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecordId(record.id);
    recordForm.reset(record);
  };

  const handleSaveRecord = (data: MedicalRecord) => {
    setMedicalHistory(prev => 
      prev.map(record => 
        record.id === editingRecordId ? { ...data, id: editingRecordId } : record
      )
    );
    setEditingRecordId(null);
    toast({
      title: "Success",
      description: "Medical record updated successfully",
    });
  };

  const handleCancelEditRecord = () => {
    setEditingRecordId(null);
    recordForm.reset();
  };

  // Edit functions for prescriptions
  const handleEditPrescription = (prescription: Prescription) => {
    setEditingPrescriptionId(prescription.id);
    prescriptionForm.reset(prescription);
  };

  const handleSavePrescription = (data: Prescription) => {
    setPrescriptions(prev => 
      prev.map(prescription => 
        prescription.id === editingPrescriptionId ? { ...data, id: editingPrescriptionId } : prescription
      )
    );
    setEditingPrescriptionId(null);
    toast({
      title: "Success",
      description: "Prescription updated successfully",
    });
  };

  const handleCancelEditPrescription = () => {
    setEditingPrescriptionId(null);
    prescriptionForm.reset();
  };

  if (loading) {
    return (
      <PageTransition>
        <Navigation />
        <div className="min-h-screen p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-medical-50 to-medical-100">
          <div className="safe-area-padding max-w-6xl mx-auto space-y-4 sm:space-y-6 pt-2 sm:pt-4">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-500 mx-auto mb-4"></div>
                <p className="text-medical-600">Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

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
          {/* Header - Mobile responsive */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-medical-500" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Your Profile</h1>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => navigate("/symptoms")}
                variant="outline"
                className="border-medical-200 text-medical-700 hover:bg-medical-50 btn-hover-lift flex-1 sm:flex-none text-sm"
              >
                <Stethoscope className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Analyze Symptoms</span>
                <span className="sm:hidden">Symptoms</span>
              </Button>
            </div>
          </div>

          {/* Patient Info - Mobile responsive grid */}
          <Card className="glass-card p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Personal Information</h2>
                <div className="space-y-2 sm:space-y-3">
                  {patient.name && (
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-gray-500">Name:</span>
                      <p className="text-sm sm:text-base text-gray-900">{patient.name}</p>
                    </div>
                  )}
                  {patient.age && (
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-gray-500">Age:</span>
                      <p className="text-sm sm:text-base text-gray-900">{patient.age} years</p>
                    </div>
                  )}
                  {patient.gender && (
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-gray-500">Gender:</span>
                      <p className="text-sm sm:text-base text-gray-900">{patient.gender}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs sm:text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-xs sm:text-sm text-gray-900 break-all">{patient.email}</p>
                  </div>
                  {patient.phone && (
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-gray-500">Phone:</span>
                      <p className="text-sm sm:text-base text-gray-900">{patient.phone}</p>
                    </div>
                  )}
                  {!patient.name && !patient.age && !patient.gender && !patient.phone && (
                    <div className="text-sm text-gray-500 italic">
                      Complete your profile by updating your account information
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Medical Information</h2>
                  <Button 
                    onClick={() => navigate("/family")}
                    variant="outline"
                    size="sm"
                    className="border-medical-200 text-medical-700 hover:bg-medical-50 w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Users className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    View Family
                  </Button>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-medical-600">
                    Family section includes sample profiles to demonstrate the platform's capabilities
                  </p>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {patient.bloodType && (
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-gray-500">Blood Type:</span>
                      <p className="text-sm sm:text-base text-gray-900">{patient.bloodType}</p>
                    </div>
                  )}
                  {patient.allergies && patient.allergies.length > 0 ? (
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-gray-500">Allergies:</span>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                        {patient.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">{allergy}</Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-gray-500">Allergies:</span>
                      <p className="text-xs sm:text-sm text-gray-500 italic">None specified</p>
                    </div>
                  )}
                  {patient.emergencyContact && (
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-gray-500">Emergency Contact:</span>
                      <p className="text-xs sm:text-sm text-gray-900">{patient.emergencyContact}</p>
                    </div>
                  )}
                  {patient.address && (
                    <div>
                      <span className="text-xs sm:text-sm font-medium text-gray-500">Address:</span>
                      <p className="text-xs sm:text-sm text-gray-900">{patient.address}</p>
                    </div>
                  )}
                  {(!patient.bloodType && !patient.emergencyContact && !patient.address) && (
                    <div className="text-sm text-gray-500 italic">
                      Medical information not yet provided
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Medical History - Mobile optimized */}
          <Card className="glass-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-medical-500" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Medical Records</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button 
                  onClick={() => setShowPrescriptions(!showPrescriptions)}
                  variant="outline"
                  className="border-medical-200 text-medical-700 hover:bg-medical-50 btn-hover-lift text-sm"
                >
                  <Pill className="mr-2 h-4 w-4" />
                  {showPrescriptions ? "Hide" : "Show"} Prescriptions
                </Button>
                <Button 
                  onClick={() => setShowAddRecord(true)}
                  className="bg-medical-500 hover:bg-medical-600 text-white btn-hover-lift text-sm"
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
                  onEditPrescription={(prescription) => {
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
                      additionalMedicines: prescription.additionalMedicines || [],
                    });
                    setPrescriptionImage(prescription.image || null);
                    setShowAddPrescription(true);
                  }}
                />
              </div>
            )}

            <div className="space-y-4">
              {medicalHistory.map((record) => (
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
                    <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                  </div>
                  <p className="text-gray-600 text-sm">{record.summary}</p>
                </Card>
              ))}
            </div>
          </Card>

        </div>

        {/* Medical Record Detail Dialog */}
        <Dialog open={showRecordDialog} onOpenChange={setShowRecordDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-medical-500" />
                Medical Record Details
              </DialogTitle>
              <DialogDescription>
                Complete medical record for {patient.name || "Patient"}
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
                        <div><span className="font-medium">Name:</span> {patient.name || "Not provided"}</div>
                        <div><span className="font-medium">Age:</span> {patient.age || "Not provided"}</div>
                        <div><span className="font-medium">Blood Type:</span> {patient.bloodType || "Not provided"}</div>
                        <div><span className="font-medium">Gender:</span> {patient.gender || "Not provided"}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-medical-800 mb-2">Contact Details</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="font-medium">Phone:</span> {patient.phone || "Not provided"}</div>
                        <div><span className="font-medium">Email:</span> {patient.email}</div>
                        <div><span className="font-medium">Address:</span> {patient.address || "Not provided"}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-medical-800 mb-2">Medical Info</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="font-medium">Allergies:</span> {patient.allergies?.length > 0 ? patient.allergies.join(", ") : "None specified"}</div>
                        <div><span className="font-medium">Emergency:</span> {patient.emergencyContact || "Not provided"}</div>
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
                        <div className="font-semibold">120/80 mmHg</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500 uppercase">Heart Rate</div>
                        <div className="font-semibold">72 bpm</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500 uppercase">Temperature</div>
                        <div className="font-semibold">98.6°F</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-xs text-gray-500 uppercase">Weight</div>
                        <div className="font-semibold">70 kg</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Medical Assessment */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-semibold text-gray-900 text-lg">Medical Assessment</h4>
                    <div className="flex gap-2">
                      {editingRecordId === selectedRecord.id ? (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => recordForm.handleSubmit(handleSaveRecord)()}
                          >
                            Save Changes
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleCancelEditRecord}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditRecord(selectedRecord)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Record
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {editingRecordId === selectedRecord.id ? (
                    <Form {...recordForm}>
                      <form className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <FormField
                              control={recordForm.control}
                              name="symptoms"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-medium text-gray-700">Chief Complaint & Symptoms</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      className="bg-red-50 border border-red-200"
                                      rows={3}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={recordForm.control}
                              name="diagnosis"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-medium text-gray-700">Diagnosis</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      className="bg-blue-50 border border-blue-200"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="space-y-4">
                            <FormField
                              control={recordForm.control}
                              name="treatment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-medium text-gray-700">Treatment Plan</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      className="bg-green-50 border border-green-200"
                                      rows={3}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={recordForm.control}
                              name="doctor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="font-medium text-gray-700">Attending Doctor</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        
                        <FormField
                          control={recordForm.control}
                          name="summary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-medium text-gray-700">Doctor's Summary</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  className="bg-gray-50"
                                  rows={4}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  ) : (
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
                            <p className="text-gray-900">Return in 2 weeks for follow-up. Continue prescribed medication. Monitor symptoms.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                {/* Doctor's Notes */}
                {!editingRecordId && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">Doctor's Summary</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900 leading-relaxed">{selectedRecord.summary}</p>
                    </div>
                  </div>
                )}

                {/* Prescribed Medications */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">Prescribed Medications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                      <div>
                        <div className="font-medium text-blue-900">Amoxicillin 500mg</div>
                        <div className="text-sm text-blue-700">Take 3 times daily for 7 days</div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <div>
                        <div className="font-medium text-green-900">Ibuprofen 400mg</div>
                        <div className="text-sm text-green-700">As needed for pain relief</div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">As Needed</Badge>
                    </div>
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
                              <div className="text-sm text-gray-500">{file.size}</div>
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
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-medical-500" />
                Add New Medical Record
              </DialogTitle>
              <DialogDescription>
                Upload medical documents, test reports, images, or write your medical record
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* File Upload Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Upload Medical Documents & Images</h4>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-gray-600">Upload medical test reports, images, or documents</p>
                      <p className="text-sm text-gray-500">Supports: Images (PNG, JPG, JPEG), Documents (PDF, DOC, DOCX) up to 10MB each</p>
                    </div>
                    <Input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const fileUploads: UploadedFile[] = files.map(file => ({
                          id: Date.now().toString() + Math.random(),
                          name: file.name,
                          size: Math.round(file.size / 1024),
                          type: file.type,
                          url: URL.createObjectURL(file)
                        }));
                        setUploadedFiles([...uploadedFiles, ...fileUploads]);
                      }}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                </div>
                
                {/* Show uploaded files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700">Uploaded Files:</h5>
                    <div className="grid gap-3">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                          {file.type.startsWith('image/') ? (
                            <img src={file.url} alt={file.name} className="w-12 h-12 object-cover rounded border" />
                          ) : (
                            <Paperclip className="h-5 w-5 text-gray-500" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{file.name}</div>
                            <div className="text-sm text-gray-500">{file.size} KB</div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setUploadedFiles(uploadedFiles.filter(f => f.id !== file.id))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Medical Record Form */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Medical Record Details</h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Date *</label>
                    <Input
                      type="date"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Visit Time</label>
                    <Input
                      type="time"
                      value={newRecord.visitTime}
                      onChange={(e) => setNewRecord({...newRecord, visitTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Record Type *</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newRecord.type}
                      onChange={(e) => setNewRecord({...newRecord, type: e.target.value})}
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Check-up">Check-up</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Lab Results">Lab Results</option>
                      <option value="Imaging">Imaging</option>
                      <option value="Surgery">Surgery</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Visit Location</label>
                    <Input
                      placeholder="e.g., Room 101, Emergency Ward"
                      value={newRecord.visitLocation}
                      onChange={(e) => setNewRecord({...newRecord, visitLocation: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Doctor</label>
                  <Input
                    placeholder="e.g., Dr. Smith"
                    value={newRecord.doctor}
                    onChange={(e) => setNewRecord({...newRecord, doctor: e.target.value})}
                  />
                </div>

                {/* Vital Signs Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">Vital Signs</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Blood Pressure</label>
                      <Input
                        placeholder="e.g., 120/80"
                        value={newRecord.bloodPressure}
                        onChange={(e) => setNewRecord({...newRecord, bloodPressure: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Heart Rate (bpm)</label>
                      <Input
                        placeholder="e.g., 72"
                        type="number"
                        value={newRecord.heartRate}
                        onChange={(e) => setNewRecord({...newRecord, heartRate: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Temperature (°F)</label>
                      <Input
                        placeholder="e.g., 98.6"
                        type="number"
                        step="0.1"
                        value={newRecord.temperature}
                        onChange={(e) => setNewRecord({...newRecord, temperature: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
                      <Input
                        placeholder="e.g., 70"
                        type="number"
                        step="0.1"
                        value={newRecord.weight}
                        onChange={(e) => setNewRecord({...newRecord, weight: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Diagnosis *</label>
                  <Input
                    placeholder="e.g., Common Cold, High Blood Pressure"
                    value={newRecord.diagnosis}
                    onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Symptoms *</label>
                  <Textarea
                    placeholder="Describe the symptoms or reason for visit"
                    value={newRecord.symptoms}
                    onChange={(e) => setNewRecord({...newRecord, symptoms: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Treatment</label>
                  <Textarea
                    placeholder="Treatment provided or recommended"
                    value={newRecord.treatment}
                    onChange={(e) => setNewRecord({...newRecord, treatment: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Summary / Notes</label>
                  <Textarea
                    placeholder="Additional notes or summary of the visit"
                    value={newRecord.summary}
                    onChange={(e) => setNewRecord({...newRecord, summary: e.target.value})}
                    rows={4}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowAddRecord(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRecord} className="bg-medical-600 hover:bg-medical-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Medical Record
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

      </div>
    </PageTransition>
  );
}