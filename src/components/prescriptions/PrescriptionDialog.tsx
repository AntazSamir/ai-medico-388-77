import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  User, 
  Pill, 
  Clock, 
  FileText, 
  Image as ImageIcon,
  Heart,
  Sun,
  Sunrise,
  Sunset,
  Moon
} from "lucide-react";
import { Prescription } from "./PrescriptionCard";

interface PrescriptionDialogProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PrescriptionDialog({ prescription, isOpen, onClose }: PrescriptionDialogProps) {
  if (!prescription) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-medical-50 text-medical-700 border-medical-200";
      case "Completed": return "bg-muted text-muted-foreground border-border";
      case "As Needed": return "bg-soft-blue text-soft-blue-foreground border-soft-blue";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDosageInfo = (dosage?: Prescription['dosage']) => {
    if (!dosage) return [];
    
    const times = [
      { icon: Sunrise, label: 'Morning', value: dosage.morning, color: 'text-orange-500' },
      { icon: Sun, label: 'Noon', value: dosage.noon, color: 'text-yellow-500' },
      { icon: Sunset, label: 'Afternoon', value: dosage.afternoon, color: 'text-orange-600' },
      { icon: Moon, label: 'Night', value: dosage.night, color: 'text-purple-500' }
    ];
    
    return times.filter(time => time.value > 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Pill className="h-5 w-5 text-medical-500" />
                {prescription.medicationName}
              </DialogTitle>
              <DialogDescription className="mt-2">
                Prescription details and medication information
              </DialogDescription>
            </div>
            <Badge className={getStatusColor(prescription.status)}>
              {prescription.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prescription Image */}
          {prescription.image && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ImageIcon className="h-4 w-4 text-medical-500" />
                  Prescription Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-medical-200 overflow-hidden">
                  <img 
                    src={prescription.image} 
                    alt="Prescription document" 
                    className="w-full h-auto max-h-96 object-contain bg-medical-50"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prescription Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-medical-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Prescribed Date</p>
                    <p className="font-medium">{formatDate(prescription.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-medical-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Prescribed By</p>
                    <p className="font-medium">{prescription.doctor}</p>
                  </div>
                </div>
              </div>
              
              {prescription.time && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-medical-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Timing</p>
                    <p className="font-medium">{prescription.time}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dosage Information */}
          {prescription.dosage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Dosage Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getDosageInfo(prescription.dosage).map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="text-center p-3 rounded-lg bg-muted/30">
                      <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />
                      <p className="text-sm font-medium text-muted-foreground">{label}</p>
                      <p className="text-lg font-bold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-4 w-4 text-medical-500" />
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{prescription.instructions}</p>
            </CardContent>
          </Card>

          {/* Additional Medicines */}
          {prescription.additionalMedicines && prescription.additionalMedicines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-4 w-4 text-medical-500" />
                  Additional Medicines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {prescription.additionalMedicines.map((medicine, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{medicine.medicationName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {medicine.dosage.morning}-{medicine.dosage.noon}-{medicine.dosage.afternoon}-{medicine.dosage.night}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{medicine.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {prescription.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{prescription.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}