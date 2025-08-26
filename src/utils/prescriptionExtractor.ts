// Prescription extraction utility using Gemini API

export interface ExtractedMedicine {
  medicationName: string;
  dosage: {
    morning: number;
    noon: number;
    afternoon: number;
    night: number;
  };
  instructions: string;
  frequency?: string;
  duration?: string;
}

export interface ExtractedPrescriptionData {
  doctorName?: string;
  date?: string;
  medicines: ExtractedMedicine[];
  notes?: string;
}

export async function extractPrescriptionData(imageFile: File): Promise<ExtractedPrescriptionData> {
  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Call the Supabase Edge Function for secure API handling
    const response = await fetch('/functions/v1/extract-prescription', {
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

    const prescriptionData: ExtractedPrescriptionData = await response.json();
    return prescriptionData;

  } catch (error) {
    console.error('Error extracting prescription data:', error);
    throw new Error('Failed to extract prescription data. Please try again or enter manually.');
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