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
    const { data, error } = await supabase.functions.invoke<SymptomAnalysisResult>(
      'analyze-symptoms',
      {
        body: { symptoms },
      }
    );

    if (error) {
      throw new Error(error.message || 'Failed to analyze symptoms');
    }

    if (!data) {
      throw new Error('No response from analysis service');
    }

    return data;
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    throw error;
  }
}