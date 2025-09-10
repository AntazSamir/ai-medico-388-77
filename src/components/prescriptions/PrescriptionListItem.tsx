import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Prescription } from "./PrescriptionCard";

interface PrescriptionListItemProps {
  prescription: Prescription;
  onView: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

export function PrescriptionListItem({ prescription, onView, onEdit, onDelete }: PrescriptionListItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-700 border-green-200";
      case "Completed": return "bg-gray-100 text-gray-700 border-gray-200";
      case "As Needed": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getDosageDisplay = (dosage?: Prescription['dosage']) => {
    if (!dosage) return "Morning 1 - Noon 1 - Afternoon 1 - Night 1";
    const { morning, noon, afternoon, night } = dosage;
    return `Morning ${morning} - Noon ${noon} - Afternoon ${afternoon} - Night ${night}`;
  };

  const getTimeDisplay = (prescription: Prescription) => {
    if (prescription.time) return prescription.time;
    if (prescription.status === "As Needed") return "As needed";
    return "8:00 AM, 6:00 PM";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA'); // YYYY-MM-DD format
  };

  return (
    <div 
      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer"
      onClick={onView}
    >
      <div className="flex items-start justify-between">
        {/* Left side - Main info */}
        <div className="flex-1 space-y-1">
          <h3 className="font-medium text-gray-900 text-base">
            {prescription.medicationName}
          </h3>
          
          <div className="text-sm">
            <span className="text-blue-600 font-medium">
              Dosage: {getDosageDisplay(prescription.dosage)}
            </span>
          </div>
          
          <div className="text-sm">
            <span className="text-green-600 font-medium">
              Time: {getTimeDisplay(prescription)}
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mt-1">
            {prescription.instructions}
          </p>
          
          {prescription.additionalMedicines && prescription.additionalMedicines.length > 0 && (
            <div className="text-xs text-blue-600 mt-2">
              + {prescription.additionalMedicines.length} additional medicine(s) - Click to view all
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-1">
            Prescribed: {formatDate(prescription.date)} • {prescription.doctor}
          </div>
        </div>
        
        {/* Right side - Status and Edit */}
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          <Badge className={getStatusColor(prescription.status)}>
            {prescription.status}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 h-8 w-8 text-gray-400 hover:text-gray-600"
          >
            <Edit className="h-4 w-4" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 h-8 w-8 text-red-500 hover:text-red-600"
              aria-label="Delete Prescription"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}