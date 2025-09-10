import { supabase } from "@/integrations/supabase/client";
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
    const { data, error } = await supabase.functions.invoke('analyze-symptoms', {
      body: { symptoms }
    });
    if (error) {
      throw new Error(error.message || 'Failed to call analyze-symptoms');
    }
    return data as SymptomAnalysisResult;
  } catch (error) {
    console.error('Error calling analyze-symptoms function:', error);
    throw new Error('Unable to analyze symptoms at this time. Please try again later.');
  }
}
