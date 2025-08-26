import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Scale, 
  Ruler, 
  Wind,
  Droplets,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  Building2,
  Stethoscope
} from "lucide-react";
import { ExtractedReportData } from "@/utils/medicalReportExtractor";

interface ExtractedReportCardProps {
  reportData: ExtractedReportData;
}

export default function ExtractedReportCard({ reportData }: ExtractedReportCardProps) {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "Normal":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "High":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "Low":
        return <TrendingDown className="h-4 w-4 text-blue-500" />;
      case "Critical":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Normal":
        return "bg-green-100 text-green-800 border-green-200";
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Critical":
        return "bg-red-200 text-red-900 border-red-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "Mild":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Moderate":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Severe":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Stethoscope className="h-6 w-6 text-medical-500" />
          <h3 className="text-xl font-semibold">{reportData.reportType}</h3>
          <Badge variant="outline" className="ml-auto">
            {reportData.date}
          </Badge>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {reportData.patientName && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Patient:</strong> {reportData.patientName}
              </span>
            </div>
          )}
          {reportData.doctorName && (
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Doctor:</strong> {reportData.doctorName}
              </span>
            </div>
          )}
          {reportData.hospitalName && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Hospital:</strong> {reportData.hospitalName}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Vital Signs */}
      {reportData.vitalSigns && Object.keys(reportData.vitalSigns).length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Vital Signs
          </h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportData.vitalSigns.bloodPressure && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Blood Pressure</p>
                  <p className="text-lg">{reportData.vitalSigns.bloodPressure}</p>
                </div>
              </div>
            )}
            {reportData.vitalSigns.heartRate && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Activity className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Heart Rate</p>
                  <p className="text-lg">{reportData.vitalSigns.heartRate}</p>
                </div>
              </div>
            )}
            {reportData.vitalSigns.temperature && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Thermometer className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Temperature</p>
                  <p className="text-lg">{reportData.vitalSigns.temperature}</p>
                </div>
              </div>
            )}
            {reportData.vitalSigns.weight && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Scale className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Weight</p>
                  <p className="text-lg">{reportData.vitalSigns.weight}</p>
                </div>
              </div>
            )}
            {reportData.vitalSigns.height && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Ruler className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Height</p>
                  <p className="text-lg">{reportData.vitalSigns.height}</p>
                </div>
              </div>
            )}
            {reportData.vitalSigns.oxygenSaturation && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Droplets className="h-5 w-5 text-cyan-500" />
                <div>
                  <p className="text-sm font-medium">Oxygen Saturation</p>
                  <p className="text-lg">{reportData.vitalSigns.oxygenSaturation}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Lab Results */}
      {reportData.labResults && reportData.labResults.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-medical-500" />
            Lab Results
          </h4>
          <div className="space-y-3">
            {reportData.labResults.map((result, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{result.testName}</h5>
                  {result.status && (
                    <Badge className={`border ${getStatusColor(result.status)}`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(result.status)}
                        {result.status}
                      </div>
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    <strong>Value:</strong> {result.value} {result.unit}
                  </span>
                  {result.referenceRange && (
                    <span>
                      <strong>Reference:</strong> {result.referenceRange}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Findings */}
      {reportData.findings && reportData.findings.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Clinical Findings
          </h4>
          <div className="space-y-3">
            {reportData.findings.map((finding, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h5 className="font-medium">{finding.category}</h5>
                    <p className="text-sm text-muted-foreground mt-1">{finding.finding}</p>
                  </div>
                  {finding.severity && (
                    <Badge className={`border ${getSeverityColor(finding.severity)}`}>
                      {finding.severity}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Diagnosis */}
      {reportData.diagnosis && reportData.diagnosis.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Diagnosis
          </h4>
          <div className="space-y-2">
            {reportData.diagnosis.map((diagnosis, index) => (
              <div key={index} className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">{diagnosis}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {reportData.recommendations && reportData.recommendations.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Recommendations
          </h4>
          <div className="space-y-2">
            {reportData.recommendations.map((recommendation, index) => (
              <div key={index} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p>{recommendation}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary */}
      {reportData.summary && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Summary</h4>
          <p className="text-muted-foreground leading-relaxed">{reportData.summary}</p>
        </Card>
      )}

      {/* Next Appointment */}
      {reportData.nextAppointment && (
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-medical-500" />
            <h4 className="text-lg font-semibold">Next Appointment</h4>
          </div>
          <p className="text-muted-foreground mt-2">{reportData.nextAppointment}</p>
        </Card>
      )}
    </div>
  );
}