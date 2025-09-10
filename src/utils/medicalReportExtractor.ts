// Medical report extraction utility using universal schema
import { UniversalMedicalReport } from "@/types/medicalReport";

export async function extractMedicalReportData(imageFile: File): Promise<UniversalMedicalReport> {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Call the Supabase Edge Function for secure API handling
    const response = await fetch('/functions/v1/extract-medical-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: base64Image.split(',')[1], // Remove data:image/jpeg;base64, prefix
        mimeType: imageFile.type
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed: ${response.statusText}`);
    }

    const reportData: UniversalMedicalReport = await response.json();
    return reportData;

  } catch (error) {
    console.error('Error extracting medical report data:', error);
    throw new Error('Failed to extract medical report data. Please try again or enter manually.');
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}