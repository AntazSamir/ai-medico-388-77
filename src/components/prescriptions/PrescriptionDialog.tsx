import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  User, 
  Pill, 
  Clock, 
  Image as ImageIcon,
  Heart,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  CheckCircle,
  AlertCircle,
  Info,
  Download,
  Stethoscope
} from "lucide-react";
import { Prescription } from "./PrescriptionCard";

interface PrescriptionDialogProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PrescriptionDialog({ prescription, isOpen, onClose }: PrescriptionDialogProps) {
  if (!prescription) return null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Active": 
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle,
          iconColor: "text-emerald-500",
          bgGradient: "from-emerald-50 to-emerald-100"
        };
      case "Completed": 
        return {
          color: "bg-slate-50 text-slate-700 border-slate-200",
          icon: CheckCircle,
          iconColor: "text-slate-500",
          bgGradient: "from-slate-50 to-slate-100"
        };
      case "As Needed": 
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200",
          icon: AlertCircle,
          iconColor: "text-amber-500",
          bgGradient: "from-amber-50 to-amber-100"
        };
      default: 
        return {
          color: "bg-slate-50 text-slate-700 border-slate-200",
          icon: CheckCircle,
          iconColor: "text-slate-500",
          bgGradient: "from-slate-50 to-slate-100"
        };
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
      { icon: Sunrise, label: 'Morning', value: dosage.morning, color: 'text-orange-500', bgColor: 'bg-orange-50' },
      { icon: Sun, label: 'Noon', value: dosage.noon, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
      { icon: Sunset, label: 'Afternoon', value: dosage.afternoon, color: 'text-orange-600', bgColor: 'bg-orange-50' },
      { icon: Moon, label: 'Night', value: dosage.night, color: 'text-purple-500', bgColor: 'bg-purple-50' }
    ];
    
    return times.filter(time => time.value > 0);
  };

  const statusConfig = getStatusConfig(prescription.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 bg-gradient-to-br from-white to-medical-50">
        {/* Enhanced Header */}
        <div className={`bg-gradient-to-r ${statusConfig.bgGradient} border-b border-gray-200 p-6`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-medical-500 rounded-xl shadow-lg">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {/* Title content */}
                </DialogTitle>
                <DialogDescription className="text-gray-800 text-2xl font-bold">
                  {prescription.doctor}
                </DialogDescription>
                
                {/* Quick Info Bar */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-medical-600" />
                    <span className="font-medium text-gray-700">{formatDate(prescription.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-medical-600" />
                    <span className="font-medium text-gray-700">{prescription.doctor}</span>
                  </div>
                  {prescription.time && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-medical-600" />
                      <span className="font-medium text-gray-700">{prescription.time}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Badge className={`${statusConfig.color} text-sm font-medium flex items-center gap-1`}>
              <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
              {prescription.status}
            </Badge>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Additional Medicines */}
              {prescription.additionalMedicines && prescription.additionalMedicines.length > 0 && (
                <Card className="border-blue-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                      <Heart className="h-5 w-5 text-blue-500" />
                      Additional Medicines
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {prescription.additionalMedicines.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {prescription.additionalMedicines.map((medicine, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{medicine.medicationName}</h4>
                          <Badge variant="outline" className="text-xs bg-white border-blue-200 text-blue-700">
                            {medicine.dosage.morning}-{medicine.dosage.noon}-{medicine.dosage.afternoon}-{medicine.dosage.night}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{medicine.time}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Dosage Schedule */}
              {prescription.dosage && (
                <Card className="border-medical-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                      <Clock className="h-4 w-4 text-medical-500" />
                      Daily Dosage Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {getDosageInfo(prescription.dosage).map(({ icon: Icon, label, value, color, bgColor }) => (
                        <div key={label} className={`${bgColor} border border-gray-200 rounded-xl p-4 text-center transition-transform hover:scale-105`}>
                          <Icon className={`h-8 w-8 mx-auto mb-2 ${color}`} />
                          <p className="text-sm font-medium text-gray-600">{label}</p>
                          <p className="text-2xl font-bold text-gray-900">{value}</p>
                          <p className="text-xs text-gray-500">{value === 1 ? 'tablet' : 'tablets'}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Notes */}
              {prescription.notes && (
                <Card className="border-amber-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                      <Info className="h-5 w-5 text-amber-500" />
                      Important Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed text-base">{prescription.notes}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Prescription Image */}
              {prescription.image && (
                <Card className="border-medical-200 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                        <ImageIcon className="h-5 w-5 text-medical-500" />
                        Prescription Document
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-medical-200 text-medical-700 hover:bg-medical-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border-2 border-medical-200 overflow-hidden bg-white shadow-inner">
                      <img 
                        src={prescription.image} 
                        alt="Prescription document" 
                        className="w-full h-auto max-h-80 object-contain"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}