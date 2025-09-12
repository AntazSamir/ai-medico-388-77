import { supabase } from "@/integrations/supabase/client";
import { UniversalMedicalReport } from "@/types/medicalReport";

export interface SaveReportOptions {
  userId: string;
  familyMemberId?: string | null;
  imageUrl?: string | null;
}

export async function saveExtractedMedicalReport(
  report: UniversalMedicalReport,
  options: SaveReportOptions
) {
  const { userId, familyMemberId = null, imageUrl = null } = options;
  const payload = {
    user_id: userId,
    family_member_id: familyMemberId,
    image_url: imageUrl,
    report_type: report.reportType,
    patient_name: report.patientName ?? null,
    doctor_name: report.doctorName ?? null,
    hospital_name: report.hospitalName ?? null,
    report_date: report.date ?? null,
    extracted_data: report as unknown,
  };

  const { data, error } = await supabase.from("medical_reports").insert(payload).select().single();
  if (error) throw error;
  return data;
}


