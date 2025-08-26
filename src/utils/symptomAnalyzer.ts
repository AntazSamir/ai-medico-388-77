interface SymptomAnalysisResult {
  possibleConditions: Array<{
    name: string;
    probability: number;
    description: string;
  }>;
  recommendedTreatments: Array<{
    treatment: string;
    priority: "High" | "Medium" | "Low";
    description: string;
  }>;
  severity: "Mild" | "Moderate" | "Severe" | "Emergency";
  urgency: string;
  disclaimer: string;
  followUpAdvice: string[];
}

export async function analyzeSymptoms(symptoms: string): Promise<SymptomAnalysisResult> {
  try {
    const response = await fetch('/functions/v1/analyze-symptoms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze symptoms');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    throw error;
  }
}