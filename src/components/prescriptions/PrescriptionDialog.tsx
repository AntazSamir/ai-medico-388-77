import { useEffect } from "react";
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
  Stethoscope,
  ArrowDown
} from "lucide-react";
import { Prescription } from "./PrescriptionCard";
import { RecentActivityManager } from "../../utils/recentActivity";

interface PrescriptionDialogProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
  memberId?: string;
  memberName?: string;
}

export function PrescriptionDialog({ prescription, isOpen, onClose, memberId, memberName }: PrescriptionDialogProps) {
  if (!prescription) return null;

  // Track when prescription is viewed
  useEffect(() => {
    if (isOpen && prescription) {
      console.log('Tracking prescription view:', {
        id: prescription.id,
        medicationName: prescription.medicationName,
        doctor: prescription.doctor,
        memberId,
        memberName
      });
      
      RecentActivityManager.addPrescriptionView(
        prescription.id,
        prescription.medicationName,
        prescription.doctor,
        memberId,
        memberName
      );
    }
  }, [isOpen, prescription, memberId, memberName]);

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
                  {prescription.medicationName}
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-base">
                  {prescription.instructions}
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

        {/* Scrollable Content Area - Entire Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(95vh-160px)] scrollbar-thin scrollbar-thumb-medical-300 scrollbar-track-gray-100">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Main Content Grid - Mobile Optimized */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column */}
              <div className="space-y-4 sm:space-y-6">
                {/* Additional Medicines */}
                {prescription.additionalMedicines && prescription.additionalMedicines.length > 0 && (
                  <Card className="border-blue-200 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900">
                        <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                        <span>Additional Medicines</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          {prescription.additionalMedicines.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 pr-1 sm:pr-2">
                        {prescription.additionalMedicines.map((medicine, index) => (
                          <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 hover:bg-blue-100 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 sm:mb-3 gap-2">
                              <h4 className="font-semibold text-gray-900 text-sm sm:text-lg leading-tight">{medicine.medicationName}</h4>
                              <Badge variant="outline" className="text-xs bg-white border-blue-200 text-blue-700 self-start">
                                {medicine.dosage.morning}-{medicine.dosage.noon}-{medicine.dosage.afternoon}-{medicine.dosage.night}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs sm:text-sm text-gray-600">
                                <span className="font-medium">Schedule:</span> {medicine.time}
                              </p>
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                {medicine.dosage.morning > 0 && (
                                  <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded text-xs">
                                    <Sunrise className="h-3 w-3 text-orange-600" />
                                    <span>{medicine.dosage.morning} Morning</span>
                                  </div>
                                )}
                                {medicine.dosage.noon > 0 && (
                                  <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded text-xs">
                                    <Sun className="h-3 w-3 text-yellow-600" />
                                    <span>{medicine.dosage.noon} Noon</span>
                                  </div>
                                )}
                                {medicine.dosage.afternoon > 0 && (
                                  <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded text-xs">
                                    <Sunset className="h-3 w-3 text-orange-600" />
                                    <span>{medicine.dosage.afternoon} Afternoon</span>
                                  </div>
                                )}
                                {medicine.dosage.night > 0 && (
                                  <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded text-xs">
                                    <Moon className="h-3 w-3 text-purple-600" />
                                    <span>{medicine.dosage.night} Night</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {prescription.additionalMedicines.length > 3 && (
                        <div className="mt-2 text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                          <ArrowDown className="h-3 w-3 animate-bounce" />
                          <span>Scroll to see all {prescription.additionalMedicines.length} medicines</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4 sm:space-y-6">
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
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {getDosageInfo(prescription.dosage).map(({ icon: Icon, label, value, color, bgColor }) => (
                          <div key={label} className={`${bgColor} border border-gray-200 rounded-xl p-3 sm:p-4 text-center transition-transform hover:scale-105`}>
                            <Icon className={`h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 ${color}`} />
                            <p className="text-xs sm:text-sm font-medium text-gray-600">{label}</p>
                            <p className="text-lg sm:text-2xl font-bold text-gray-900">{value}</p>
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
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900">
                        <Info className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                        Important Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{prescription.notes}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Prescription Image */}
                {prescription.image && (
                  <Card className="border-medical-200 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-900">
                          <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-medical-500" />
                          Prescription Document
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-medical-200 text-medical-700 hover:bg-medical-50 text-xs"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-xl border-2 border-medical-200 overflow-hidden bg-white shadow-inner">
                        <img 
                          src={prescription.image} 
                          alt="Prescription document" 
                          className="w-full h-auto max-h-60 sm:max-h-80 object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            {/* Footer with helpful info */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500">
                <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Scroll to view all prescription details and medicines</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Actions */}
        <div className="border-t border-gray-200 p-3 sm:p-4 bg-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Prescription management - All details scrollable</span>
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              {prescription.image && (
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Download </span>Image
                </Button>
              )}
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none text-xs sm:text-sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}