// Universal medical report schema used across frontend and edge functions

export type LabResultStatus = "Normal" | "High" | "Low" | "Critical";
export type FindingSeverity = "Mild" | "Moderate" | "Severe";

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  weight?: string;
  height?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
}

export interface LabResultItem {
  testName: string;
  value: string;
  unit?: string | null;
  referenceRange?: string | null;
  status?: LabResultStatus | null;
}

export interface ClinicalFinding {
  category: string;
  finding?: string;
  severity?: FindingSeverity | null;
}

export interface UniversalMedicalReport {
  reportType: string;
  patientName?: string | null;
  doctorName?: string | null;
  hospitalName?: string | null;
  date?: string | null; // YYYY-MM-DD
  vitalSigns?: VitalSigns;
  labResults?: LabResultItem[];
  findings?: ClinicalFinding[];
  diagnosis?: string[];
  recommendations?: string[];
  summary?: string | null;
  nextAppointment?: string | null;
  // Confidence scores per top-level section/field (0.0-1.0)
  confidence?: {
    reportType?: number;
    patientName?: number;
    doctorName?: number;
    hospitalName?: number;
    date?: number;
    vitalSigns?: number;
    labResults?: number;
    findings?: number;
    diagnosis?: number;
    recommendations?: number;
    summary?: number;
    nextAppointment?: number;
  };
  // Fields that were deemed uncertain during validation
  uncertainFields?: string[];
}


