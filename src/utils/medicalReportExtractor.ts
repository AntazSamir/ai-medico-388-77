// Medical report extraction utility using universal schema
import { UniversalMedicalReport } from "@/types/medicalReport";

export async function extractMedicalReportData(input: File | { text: string }): Promise<UniversalMedicalReport> {
  try {
    let body: Record<string, unknown> = {};
    if (input instanceof File) {
      const base64Image = await fileToBase64(input);
      body = {
        imageData: base64Image.split(',')[1],
        mimeType: input.type
      };
    } else if (typeof input === 'object' && typeof input.text === 'string') {
      body = { textContent: input.text };
    } else {
      throw new Error('Unsupported input for extraction');
    }

    const response = await fetch('/functions/v1/extract-medical-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any));
      const details = (errorData && (errorData.details || errorData.error)) || null;
      throw new Error(details || `API request failed: ${response.status} ${response.statusText}`);
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