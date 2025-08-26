import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Eye, Pill, Clock } from "lucide-react";

export interface Prescription {
  id: string;
  medicationName: string;
  instructions: string;
  doctor: string;
  date: string;
  status: "Active" | "Completed" | "As Needed";
  image?: string;
  notes?: string;
  dosage?: {
    morning: number;
    noon: number;
    afternoon: number;
    night: number;
  };
  time?: string;
  additionalMedicines?: {
    medicationName: string;
    dosage: {
      morning: number;
      noon: number;
      afternoon: number;
      night: number;
    };
    time: string;
  }[];
}

interface PrescriptionCardProps {
  prescription: Prescription;
  onView: () => void;
  onEdit: () => void;
}

export function PrescriptionCard({ prescription, onView, onEdit }: PrescriptionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-medical-50 text-medical-700 border-medical-200";
      case "Completed": return "bg-muted text-muted-foreground border-border";
      case "As Needed": return "bg-soft-blue text-soft-blue-foreground border-soft-blue";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getDosageDisplay = (dosage?: Prescription['dosage']) => {
    if (!dosage) return "";
    const { morning, noon, afternoon, night } = dosage;
    const total = morning + noon + afternoon + night;
    if (total === 0) return "As needed";
    return `${morning}-${noon}-${afternoon}-${night}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="glass-card hover:shadow-lg transition-all duration-200 border-l-4 border-l-medical-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="h-4 w-4 text-medical-500" />
              <h3 className="font-semibold text-card-foreground">{prescription.medicationName}</h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(prescription.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{prescription.doctor}</span>
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(prescription.status)}>
            {prescription.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {prescription.dosage && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3 w-3 text-medical-500" />
              <span className="text-muted-foreground">Dosage:</span>
              <Badge variant="outline" className="text-xs">
                {getDosageDisplay(prescription.dosage)}
              </Badge>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {prescription.instructions}
          </p>
          
          {prescription.image && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded border border-medical-200 overflow-hidden">
                <img 
                  src={prescription.image} 
                  alt="Prescription" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs text-muted-foreground">Prescription image attached</span>
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onView}
              className="flex-1 border-medical-200 text-medical-700 hover:bg-medical-50"
            >
              <Eye className="mr-2 h-3 w-3" />
              View Details
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onEdit}
              className="text-muted-foreground hover:text-foreground"
            >
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}