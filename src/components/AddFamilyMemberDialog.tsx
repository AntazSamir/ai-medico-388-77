import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PrescriptionExtractor from "@/components/PrescriptionExtractor";
import MedicalReportExtractor from "@/components/MedicalReportExtractor";
import ExtractedReportCard from "@/components/ExtractedReportCard";
import { 
  User, 
  Upload, 
  Plus,
  Trash2,
  FileText,
  Camera,
  Bot,
  Heart,
  Users,
  UserPlus,
  Calendar,
  Phone,
  Mail,
  AlertTriangle,
  Stethoscope,
  Loader2,
  CheckCircle,
  Edit3,
  Sparkles
} from "lucide-react";
import { ExtractedPrescriptionData } from "@/utils/prescriptionExtractor";
import { ExtractedReportData } from "@/utils/medicalReportExtractor";

interface FamilyMember {
  id?: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  email: string;
  phone: string;
  relationship: string;
  bloodType: string;
  allergies: string[];
  emergencyContact: string;
  medicalConditions: string[];
  medications: string[];
  prescriptions: ExtractedPrescriptionData[];
  medicalReports: Array<{
    id: string;
    name: string;
    type: string;
    date: string;
    file?: File;
    extractedData?: ExtractedReportData;
  }>;
  notes?: string;
}

interface AddFamilyMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: FamilyMember) => void;
  existingMember?: FamilyMember;
}

export default function AddFamilyMemberDialog({ 
  isOpen, 
  onClose, 
  onSave,
  existingMember 
}: AddFamilyMemberDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrescriptionExtractor, setShowPrescriptionExtractor] = useState(false);
  const [showReportExtractor, setShowReportExtractor] = useState(false);
  const [selectedReportIndex, setSelectedReportIndex] = useState<number | null>(null);
  const [familyMember, setFamilyMember] = useState<FamilyMember>(() => ({
    name: "",
    age: 0,
    gender: "Male",
    email: "",
    phone: "",
    relationship: "",
    bloodType: "",
    allergies: [],
    emergencyContact: "",
    medicalConditions: [],
    medications: [],
    prescriptions: [],
    medicalReports: [],
    notes: "",
    ...existingMember
  }));
  
  const [newAllergy, setNewAllergy] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");
  
  const { toast } = useToast();

  const relationships = [
    "Spouse", "Child", "Son", "Daughter", "Parent", "Mother", "Father",
    "Sibling", "Brother", "Sister", "Grandparent", "Grandmother", "Grandfather",
    "Grandchild", "Uncle", "Aunt", "Cousin", "Friend", "Other"
  ];

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const reportTypes = [
    "Blood Test", "X-Ray", "MRI", "CT Scan", "Ultrasound", 
    "ECG", "Biopsy", "Pathology", "Allergy Test", "Other"
  ];

  const handleSave = () => {
    // Validate required fields
    if (!familyMember.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter the family member's name",
        variant: "destructive",
      });
      return;
    }

    if (!familyMember.relationship) {
      toast({
        title: "Validation Error", 
        description: "Please select a relationship",
        variant: "destructive",
      });
      return;
    }

    onSave(familyMember);
    handleClose();
    
    toast({
      title: "Success!",
      description: `${familyMember.name} has been ${existingMember ? 'updated' : 'added'} to your family members`,
    });
  };

  const handleClose = () => {
    setFamilyMember({
      name: "",
      age: 0,
      gender: "Male",
      email: "",
      phone: "",
      relationship: "",
      bloodType: "",
      allergies: [],
      emergencyContact: "",
      medicalConditions: [],
      medications: [],
      prescriptions: [],
      medicalReports: [],
      notes: ""
    });
    setActiveTab("basic");
    setNewAllergy("");
    setNewCondition("");
    setNewMedication("");
    onClose();
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !familyMember.allergies.includes(newAllergy.trim())) {
      setFamilyMember({
        ...familyMember,
        allergies: [...familyMember.allergies, newAllergy.trim()]
      });
      setNewAllergy("");
    }
  };

  const removeAllergy = (index: number) => {
    setFamilyMember({
      ...familyMember,
      allergies: familyMember.allergies.filter((_, i) => i !== index)
    });
  };

  const addCondition = () => {
    if (newCondition.trim() && !familyMember.medicalConditions.includes(newCondition.trim())) {
      setFamilyMember({
        ...familyMember,
        medicalConditions: [...familyMember.medicalConditions, newCondition.trim()]
      });
      setNewCondition("");
    }
  };

  const removeCondition = (index: number) => {
    setFamilyMember({
      ...familyMember,
      medicalConditions: familyMember.medicalConditions.filter((_, i) => i !== index)
    });
  };

  const addMedication = () => {
    if (newMedication.trim() && !familyMember.medications.includes(newMedication.trim())) {
      setFamilyMember({
        ...familyMember,
        medications: [...familyMember.medications, newMedication.trim()]
      });
      setNewMedication("");
    }
  };

  const removeMedication = (index: number) => {
    setFamilyMember({
      ...familyMember,
      medications: familyMember.medications.filter((_, i) => i !== index)
    });
  };

  const handlePrescriptionSave = (prescriptionData: ExtractedPrescriptionData, image?: string) => {
    setFamilyMember({
      ...familyMember,
      prescriptions: [...familyMember.prescriptions, prescriptionData]
    });
    
    toast({
      title: "Prescription Added!",
      description: `Added ${prescriptionData.medicines.length} medicine(s) to ${familyMember.name}'s profile`,
    });
  };

  const removePrescription = (index: number) => {
    setFamilyMember({
      ...familyMember,
      prescriptions: familyMember.prescriptions.filter((_, i) => i !== index)
    });
  };

  const handleReportUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    
    try {
      const newReports = files.map(file => ({
        id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: "Other", // Default, user can change
        date: new Date().toISOString().split('T')[0],
        file
      }));

      setFamilyMember({
        ...familyMember,
        medicalReports: [...familyMember.medicalReports, ...newReports]
      });

      toast({
        title: "Reports Uploaded",
        description: `Added ${files.length} medical report(s)`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload medical reports",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const removeReport = (index: number) => {
    setFamilyMember({
      ...familyMember,
      medicalReports: familyMember.medicalReports.filter((_, i) => i !== index)
    });
  };

  const updateReportType = (index: number, type: string) => {
    const updatedReports = [...familyMember.medicalReports];
    updatedReports[index].type = type;
    setFamilyMember({
      ...familyMember,
      medicalReports: updatedReports
    });
  };

  const handleReportExtracted = (reportData: ExtractedReportData, imageUrl?: string) => {
    if (selectedReportIndex !== null) {
      // Update existing report with extracted data
      const updatedReports = [...familyMember.medicalReports];
      updatedReports[selectedReportIndex] = {
        ...updatedReports[selectedReportIndex],
        extractedData: reportData,
        type: reportData.reportType || updatedReports[selectedReportIndex].type
      };
      setFamilyMember({
        ...familyMember,
        medicalReports: updatedReports
      });
    } else {
      // Create new report with extracted data
      const newReport = {
        id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `${reportData.reportType || 'Medical Report'} - ${reportData.date || 'Unknown Date'}`,
        type: reportData.reportType || 'Other',
        date: reportData.date || new Date().toISOString().split('T')[0],
        extractedData: reportData
      };
      setFamilyMember({
        ...familyMember,
        medicalReports: [...familyMember.medicalReports, newReport]
      });
    }
    
    setShowReportExtractor(false);
    setSelectedReportIndex(null);
    
    toast({
      title: "Medical Report Extracted!",
      description: `Successfully extracted data from ${reportData.reportType || 'medical report'}`,
    });
  };

  const handleExtractFromImage = (index?: number) => {
    setSelectedReportIndex(index ?? null);
    setShowReportExtractor(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-medical-500" />
              {existingMember ? `Edit ${existingMember.name}` : "Add New Family Member"}
            </DialogTitle>
            <DialogDescription>
              Complete the family member's profile with personal information, medical history, and documents
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-4 shrink-0">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="medical" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Medical Info
              </TabsTrigger>
              <TabsTrigger value="prescriptions" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Prescriptions
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Medical Reports
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="basic" className="space-y-6 p-1">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-medical-500" />
                  Personal Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={familyMember.name}
                      onChange={(e) => setFamilyMember({ ...familyMember, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship *</Label>
                    <Select value={familyMember.relationship} onValueChange={(value) => setFamilyMember({ ...familyMember, relationship: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationships.map(rel => (
                          <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="0"
                      max="150"
                      value={familyMember.age || ""}
                      onChange={(e) => setFamilyMember({ ...familyMember, age: parseInt(e.target.value) || 0 })}
                      placeholder="Enter age"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={familyMember.gender} onValueChange={(value) => setFamilyMember({ ...familyMember, gender: value as "Male" | "Female" | "Other" })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={familyMember.email}
                      onChange={(e) => setFamilyMember({ ...familyMember, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={familyMember.phone}
                      onChange={(e) => setFamilyMember({ ...familyMember, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={familyMember.emergencyContact}
                      onChange={(e) => setFamilyMember({ ...familyMember, emergencyContact: e.target.value })}
                      placeholder="Name and phone number for emergency contact"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={familyMember.notes}
                      onChange={(e) => setFamilyMember({ ...familyMember, notes: e.target.value })}
                      placeholder="Any additional information or notes"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

              <TabsContent value="medical" className="space-y-6 p-1">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Blood Type & Basic Medical Info */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-medical-500" />
                    Basic Medical Info
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bloodType">Blood Type</Label>
                      <Select value={familyMember.bloodType} onValueChange={(value) => setFamilyMember({ ...familyMember, bloodType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          {bloodTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>

                {/* Allergies */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Allergies
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={newAllergy}
                        onChange={(e) => setNewAllergy(e.target.value)}
                        placeholder="Add allergy"
                        onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                      />
                      <Button onClick={addAllergy} size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {familyMember.allergies.map((allergy, index) => (
                        <Badge key={index} variant="destructive" className="flex items-center gap-1">
                          {allergy}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
                            onClick={() => removeAllergy(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Medical Conditions */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-medical-500" />
                    Medical Conditions
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={newCondition}
                        onChange={(e) => setNewCondition(e.target.value)}
                        placeholder="Add medical condition"
                        onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                      />
                      <Button onClick={addCondition} size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {familyMember.medicalConditions.map((condition, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {condition}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
                            onClick={() => removeCondition(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Current Medications */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-medical-500" />
                    Current Medications
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={newMedication}
                        onChange={(e) => setNewMedication(e.target.value)}
                        placeholder="Add medication"
                        onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                      />
                      <Button onClick={addMedication} size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {familyMember.medications.map((medication, index) => (
                        <Badge key={index} className="bg-medical-100 text-medical-800 flex items-center gap-1">
                          {medication}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-1"
                            onClick={() => removeMedication(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

              <TabsContent value="prescriptions" className="space-y-6 p-1">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Bot className="h-5 w-5 text-medical-500" />
                    AI-Extracted Prescriptions
                  </h3>
                  <Button
                    onClick={() => setShowPrescriptionExtractor(true)}
                    className="bg-medical-500 hover:bg-medical-600"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Add Prescription
                  </Button>
                </div>

                {familyMember.prescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {familyMember.prescriptions.map((prescription, index) => (
                      <Card key={index} className="p-4 border border-medical-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Prescription {index + 1}</span>
                            {prescription.doctorName && (
                              <Badge variant="outline">Dr. {prescription.doctorName}</Badge>
                            )}
                            {prescription.date && (
                              <Badge variant="secondary">{prescription.date}</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePrescription(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {prescription.medicines.map((medicine, medIndex) => (
                            <div key={medIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <span className="font-medium text-sm">{medicine.medicationName}</span>
                                <span className="text-xs text-gray-500 ml-2">
                                  {medicine.dosage.morning}-{medicine.dosage.noon}-{medicine.dosage.afternoon}-{medicine.dosage.night}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">{medicine.instructions}</span>
                            </div>
                          ))}
                        </div>
                        
                        {prescription.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">{prescription.notes}</p>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No prescriptions added yet</p>
                    <p className="text-sm text-gray-400">Upload prescription images to extract medicine information automatically</p>
                  </div>
                )}
              </Card>
            </TabsContent>

              <TabsContent value="reports" className="space-y-6 p-1">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-medical-500" />
                    Medical Reports & Documents
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleExtractFromImage()}
                      className="border-medical-200 text-medical-700 hover:bg-medical-50"
                      disabled={isProcessing}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI Extract
                    </Button>
                    <Label htmlFor="report-upload" className="cursor-pointer">
                      <Button
                        variant="outline"
                        className="border-medical-200 text-medical-700 hover:bg-medical-50"
                        disabled={isProcessing}
                        asChild
                      >
                        <span>
                          {isProcessing ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Upload Reports
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="report-upload"
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleReportUpload}
                      className="hidden"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                {familyMember.medicalReports.length > 0 ? (
                  <div className="space-y-6">
                    {familyMember.medicalReports.map((report, index) => (
                      <div key={report.id} className="space-y-4">
                        <Card className="p-4 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <FileText className="h-5 w-5 text-medical-500" />
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{report.name}</h4>
                                <div className="flex items-center gap-4 mt-1">
                                  <Select 
                                    value={report.type} 
                                    onValueChange={(value) => updateReportType(index, value)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {reportTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <span className="text-xs text-gray-500">{report.date}</span>
                                  {report.extractedData && (
                                    <Badge variant="secondary" className="text-xs">
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      AI Extracted
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!report.extractedData && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleExtractFromImage(index)}
                                  className="text-medical-600 hover:text-medical-700"
                                >
                                  <Sparkles className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeReport(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                        
                        {/* Display extracted data if available */}
                        {report.extractedData && (
                          <div className="ml-8">
                            <ExtractedReportCard reportData={report.extractedData} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No medical reports uploaded yet</p>
                    <p className="text-sm text-gray-400">Upload test results, lab reports, and other medical documents</p>
                  </div>
                )}
              </Card>
            </TabsContent>
            </div>
          </Tabs>

          <DialogFooter className="shrink-0 flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              * Required fields
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-medical-500 hover:bg-medical-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                {existingMember ? 'Update' : 'Add'} Family Member
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Prescription Extractor Dialog */}
      <PrescriptionExtractor
        isOpen={showPrescriptionExtractor}
        onClose={() => setShowPrescriptionExtractor(false)}
        onSave={handlePrescriptionSave}
      />

      {/* Medical Report Extractor Dialog */}
      {showReportExtractor && (
        <Dialog open={showReportExtractor} onOpenChange={setShowReportExtractor}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Extract Medical Report Data</DialogTitle>
              <DialogDescription>
                Upload a medical report image to automatically extract structured data using AI
              </DialogDescription>
            </DialogHeader>
            <MedicalReportExtractor
              onReportExtracted={handleReportExtracted}
              onCancel={() => setShowReportExtractor(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}