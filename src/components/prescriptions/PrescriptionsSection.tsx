import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Pill, 
  Plus, 
  Search, 
  Filter,
  Bot,
  Calendar,
  X
} from "lucide-react";
import { Prescription } from "./PrescriptionCard";
import { PrescriptionListItem } from "./PrescriptionListItem";
import { PrescriptionDialog } from "./PrescriptionDialog";
import PrescriptionExtractor from "@/components/PrescriptionExtractor";
import { ExtractedPrescriptionData } from "@/utils/prescriptionExtractor";
import { useToast } from "@/hooks/use-toast";

interface PrescriptionsSectionProps {
  prescriptions: Prescription[];
  setPrescriptions: (prescriptions: Prescription[]) => void;
  onAddPrescription: () => void;
  onEditPrescription: (prescription: Prescription) => void;
}

export function PrescriptionsSection({ 
  prescriptions, 
  setPrescriptions, 
  onAddPrescription, 
  onEditPrescription 
}: PrescriptionsSectionProps) {
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showExtractor, setShowExtractor] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setShowDialog(true);
  };

  const handleExtractedPrescriptionSave = (extractedData: ExtractedPrescriptionData, image?: string) => {
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
      image: image || undefined // Include the prescription image from extractor
    }));

    setPrescriptions([...newPrescriptions, ...prescriptions]);
    
    toast({
      title: "Prescriptions added successfully!",
      description: `Added ${newPrescriptions.length} medicine(s) from the prescription`,
    });
  };

  // Filter prescriptions based on search and status
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || prescription.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort prescriptions by date (newest first)
  const sortedPrescriptions = [...filteredPrescriptions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group prescriptions by month
  const groupedPrescriptions = sortedPrescriptions.reduce((groups, prescription) => {
    const date = new Date(prescription.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
    
    if (!groups[monthKey]) {
      groups[monthKey] = {
        label: monthLabel,
        prescriptions: []
      };
    }
    groups[monthKey].prescriptions.push(prescription);
    return groups;
  }, {} as Record<string, { label: string; prescriptions: Prescription[] }>);

  return (
    <>
      <div className="bg-blue-50 border border-blue-100 rounded-lg">
        <div className="border-b border-blue-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Current Prescriptions</h2>
            <div className="flex gap-2">
              <Button 
                onClick={onAddPrescription}
                size="sm"
                className="bg-blue-300 hover:bg-blue-400 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Prescription
              </Button>
            </div>
          </div>
          
          {/* Search and Filter */}
          {prescriptions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search medications or doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                  className={statusFilter === "all" ? "bg-blue-300 hover:bg-blue-400 text-white" : "border-blue-200 text-blue-500 hover:bg-blue-25"}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "Active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("Active")}
                  className={statusFilter === "Active" ? "bg-blue-300 hover:bg-blue-400 text-white" : "border-blue-200 text-blue-500 hover:bg-blue-25"}
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === "As Needed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("As Needed")}
                  className={statusFilter === "As Needed" ? "bg-blue-300 hover:bg-blue-400 text-white" : "border-blue-200 text-blue-500 hover:bg-blue-25"}
                >
                  As Needed
                </Button>
                <Button
                  variant={statusFilter === "Completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("Completed")}
                  className={statusFilter === "Completed" ? "bg-blue-300 hover:bg-blue-400 text-white" : "border-blue-200 text-blue-500 hover:bg-blue-25"}
                >
                  Completed
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="p-6">{sortedPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">
                {searchTerm || statusFilter !== "all" 
                  ? "No prescriptions match your criteria"
                  : "No prescriptions yet"
                }
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter settings"
                  : "Add your first prescription to get started"
                }
              </p>
              {(!searchTerm && statusFilter === "all") && (
                <div className="flex gap-2 justify-center mt-4">
                  <Button 
                    onClick={onAddPrescription}
                    className="bg-blue-300 hover:bg-blue-400 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Prescription
                  </Button>
                  <Button 
                    onClick={() => setShowExtractor(true)}
                    variant="outline"
                    className="border-blue-200 text-blue-500 hover:bg-blue-25"
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    Use AI Extract
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedPrescriptions).map(([monthKey, group]) => (
                <div key={monthKey}>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-blue-300" />
                    <h3 className="text-lg font-semibold text-gray-900">{group.label}</h3>
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <Badge variant="outline" className="text-xs border-gray-300">
                      {group.prescriptions.length} prescription{group.prescriptions.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {group.prescriptions.map(prescription => (
                      <PrescriptionListItem
                        key={prescription.id}
                        prescription={prescription}
                        onView={() => handleViewPrescription(prescription)}
                        onEdit={() => onEditPrescription(prescription)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <PrescriptionDialog
        prescription={selectedPrescription}
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />

      <PrescriptionExtractor
        isOpen={showExtractor}
        onClose={() => setShowExtractor(false)}
        onSave={handleExtractedPrescriptionSave}
      />
    </>
  );
}