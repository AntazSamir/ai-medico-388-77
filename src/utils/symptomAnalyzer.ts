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
    console.log('Calling analyze-symptoms function with:', { symptoms });
    
    const { data, error } = await supabase.functions.invoke<SymptomAnalysisResult>(
      'analyze-symptoms',
      {
        body: { symptoms },
      }
    );

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message || 'Failed to analyze symptoms');
    }

    if (!data) {
      console.error('No data returned from function');
      throw new Error('No response from analysis service');
    }

    console.log('Analysis result:', data);
    return data;
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    throw error;
  }
}