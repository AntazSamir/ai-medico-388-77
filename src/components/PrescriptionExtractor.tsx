import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { 
  Upload, 
  Bot, 
  CheckCircle, 
  Edit3, 
  Trash2, 
  Plus,
  Loader2,
  Camera,
  FileImage
} from "lucide-react";
import { extractPrescriptionData, ExtractedPrescriptionData, ExtractedMedicine } from "@/utils/prescriptionExtractor";

interface PrescriptionExtractorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prescriptions: ExtractedPrescriptionData, image?: string) => void;
}

export default function PrescriptionExtractor({ isOpen, onClose, onSave }: PrescriptionExtractorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedPrescriptionData | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [editingMedicineIndex, setEditingMedicineIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsProcessing(true);
    
    try {
      const data = await extractPrescriptionData(file);
      setExtractedData(data);
      
      toast({
        title: "Prescription analyzed successfully!",
        description: `Found ${data.medicines.length} medicine(s) in the prescription`,
      });
    } catch (error) {
      console.error('Extraction error:', error);
      toast({
        title: "Extraction failed",
        description: error instanceof Error ? error.message : "Failed to analyze prescription",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMedicineEdit = (index: number, updatedMedicine: ExtractedMedicine) => {
    if (!extractedData) return;
    
    const updatedMedicines = [...extractedData.medicines];
    updatedMedicines[index] = updatedMedicine;
    
    setExtractedData({
      ...extractedData,
      medicines: updatedMedicines
    });
    
    setEditingMedicineIndex(null);
  };

  const handleRemoveMedicine = (index: number) => {
    if (!extractedData) return;
    
    const updatedMedicines = extractedData.medicines.filter((_, i) => i !== index);
    setExtractedData({
      ...extractedData,
      medicines: updatedMedicines
    });
  };

  const handleAddMedicine = () => {
    if (!extractedData) return;
    
    const newMedicine: ExtractedMedicine = {
      medicationName: "",
      dosage: { morning: 0, noon: 0, afternoon: 0, night: 0 },
      instructions: "",
      frequency: "",
      duration: ""
    };
    
    setExtractedData({
      ...extractedData,
      medicines: [...extractedData.medicines, newMedicine]
    });
    
    setEditingMedicineIndex(extractedData.medicines.length);
  };

  const handleSave = () => {
    if (!extractedData) return;
    
    onSave(extractedData, uploadedImage || undefined);
    handleClose();
  };

  const handleClose = () => {
    setExtractedData(null);
    setUploadedImage(null);
    setIsProcessing(false);
    setEditingMedicineIndex(null);
    onClose();
  };

  const getDosageDisplay = (dosage: ExtractedMedicine['dosage']) => {
    const { morning, noon, afternoon, night } = dosage;
    const total = morning + noon + afternoon + night;
    if (total === 0) return "As needed";
    return `${morning}-${noon}-${afternoon}-${night}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-medical-500" />
            AI Prescription Extractor
          </DialogTitle>
          <DialogDescription>
            Upload a prescription image and let AI automatically extract medicine names and dosages
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          {!extractedData && (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-medical-50 rounded-full flex items-center justify-center">
                  {isProcessing ? (
                    <Loader2 className="h-8 w-8 text-medical-500 animate-spin" />
                  ) : (
                    <Upload className="h-8 w-8 text-medical-500" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isProcessing ? "Analyzing prescription..." : "Upload prescription image"}
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {isProcessing 
                      ? "Please wait while AI extracts medicine information" 
                      : "Supported formats: JPG, PNG, WebP"
                    }
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Label htmlFor="prescription-upload" className="cursor-pointer">
                    <Button
                      variant="outline"
                      className="border-medical-200 text-medical-700 hover:bg-medical-50"
                      disabled={isProcessing}
                      asChild
                    >
                      <span>
                        <Camera className="mr-2 h-4 w-4" />
                        Choose Image
                      </span>
                    </Button>
                  </Label>
                  <Input
                    id="prescription-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Preview Image */}
          {uploadedImage && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileImage className="h-4 w-4 text-medical-500" />
                <span className="text-sm font-medium text-gray-700">Uploaded Prescription</span>
              </div>
              <img 
                src={uploadedImage} 
                alt="Uploaded prescription" 
                className="max-w-full h-auto rounded-lg border border-gray-200"
                style={{ maxHeight: '200px' }}
              />
            </Card>
          )}

          {/* Extracted Data Review */}
          {extractedData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Extracted Information</h3>
                </div>
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  {extractedData.medicines.length} medicine(s) found
                </Badge>
              </div>

              {/* Doctor and Date Info */}
              <Card className="p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Doctor</Label>
                    <p className="text-gray-900">{extractedData.doctorName || "Not specified"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date</Label>
                    <p className="text-gray-900">{extractedData.date}</p>
                  </div>
                </div>
                {extractedData.notes && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-500">Notes</Label>
                    <p className="text-gray-900 text-sm">{extractedData.notes}</p>
                  </div>
                )}
              </Card>

              {/* Medicines List */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Medicines & Dosages</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddMedicine}
                    className="border-medical-200 text-medical-700 hover:bg-medical-50"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Medicine
                  </Button>
                </div>

                <div className="space-y-3">
                  {extractedData.medicines.map((medicine, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      {editingMedicineIndex === index ? (
                        <MedicineEditor
                          medicine={medicine}
                          onSave={(updatedMedicine) => handleMedicineEdit(index, updatedMedicine)}
                          onCancel={() => setEditingMedicineIndex(null)}
                        />
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-medium text-gray-900">{medicine.medicationName}</h5>
                              <Badge variant="outline" className="text-xs">
                                {getDosageDisplay(medicine.dosage)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{medicine.instructions}</p>
                            {medicine.frequency && (
                              <p className="text-xs text-gray-500">Frequency: {medicine.frequency}</p>
                            )}
                            {medicine.duration && (
                              <p className="text-xs text-gray-500">Duration: {medicine.duration}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingMedicineIndex(index)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMedicine(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {extractedData && (
            <Button onClick={handleSave} className="bg-medical-500 hover:bg-medical-600">
              <CheckCircle className="mr-2 h-4 w-4" />
              Save Prescriptions
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface MedicineEditorProps {
  medicine: ExtractedMedicine;
  onSave: (medicine: ExtractedMedicine) => void;
  onCancel: () => void;
}

function MedicineEditor({ medicine, onSave, onCancel }: MedicineEditorProps) {
  const [editedMedicine, setEditedMedicine] = useState<ExtractedMedicine>(medicine);

  const handleSave = () => {
    onSave(editedMedicine);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="medicineName" className="text-sm font-medium">Medicine Name</Label>
        <Input
          id="medicineName"
          value={editedMedicine.medicationName}
          onChange={(e) => setEditedMedicine({ ...editedMedicine, medicationName: e.target.value })}
          placeholder="Enter medicine name"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Dosage (pills per time)</Label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div>
            <Label className="text-xs text-gray-500">Morning</Label>
            <Input
              type="number"
              min="0"
              value={editedMedicine.dosage.morning}
              onChange={(e) => setEditedMedicine({
                ...editedMedicine,
                dosage: { ...editedMedicine.dosage, morning: parseInt(e.target.value) || 0 }
              })}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Noon</Label>
            <Input
              type="number"
              min="0"
              value={editedMedicine.dosage.noon}
              onChange={(e) => setEditedMedicine({
                ...editedMedicine,
                dosage: { ...editedMedicine.dosage, noon: parseInt(e.target.value) || 0 }
              })}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Afternoon</Label>
            <Input
              type="number"
              min="0"
              value={editedMedicine.dosage.afternoon}
              onChange={(e) => setEditedMedicine({
                ...editedMedicine,
                dosage: { ...editedMedicine.dosage, afternoon: parseInt(e.target.value) || 0 }
              })}
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Night</Label>
            <Input
              type="number"
              min="0"
              value={editedMedicine.dosage.night}
              onChange={(e) => setEditedMedicine({
                ...editedMedicine,
                dosage: { ...editedMedicine.dosage, night: parseInt(e.target.value) || 0 }
              })}
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="instructions" className="text-sm font-medium">Instructions</Label>
        <Input
          id="instructions"
          value={editedMedicine.instructions}
          onChange={(e) => setEditedMedicine({ ...editedMedicine, instructions: e.target.value })}
          placeholder="Take with food, etc."
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} size="sm" className="bg-medical-500 hover:bg-medical-600">
          Save
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          Cancel
        </Button>
      </div>
    </div>
  );
}