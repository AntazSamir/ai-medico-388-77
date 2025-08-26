import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { symptoms } = await req.json();

    if (!symptoms) {
      return new Response(
        JSON.stringify({ error: 'Missing symptoms description' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze the following symptoms and provide a medical assessment in JSON format:

                  Symptoms: "${symptoms}"

                  Please provide analysis in this exact JSON structure:
                  {
                    "possibleConditions": [
                      {
                        "name": "condition name",
                        "probability": number (0-100),
                        "description": "brief description of the condition"
                      }
                    ],
                    "recommendedTreatments": [
                      {
                        "treatment": "treatment name",
                        "priority": "High/Medium/Low",
                        "description": "description of the treatment"
                      }
                    ],
                    "severity": "Mild/Moderate/Severe/Emergency",
                    "urgency": "description of how urgent medical attention is needed",
                    "disclaimer": "medical disclaimer about consulting healthcare professionals",
                    "followUpAdvice": ["advice 1", "advice 2", "advice 3"]
                  }

                  Guidelines:
                  - List up to 3 most likely conditions based on symptoms
                  - Provide evidence-based treatment recommendations
                  - Consider symptom severity and combinations
                  - Always include appropriate medical disclaimers
                  - Prioritize safety and recommend professional consultation for serious symptoms
                  - Return only valid JSON, no additional text
                  - Be thorough but concise in descriptions`
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('No content received from Gemini API');
    }

    const extractedText = data.candidates[0].content.parts[0].text;
    
    // Parse JSON from the response
    const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini API response');
    }

    const analysisResult: SymptomAnalysisResult = JSON.parse(jsonMatch[0]);
    
    // Validate and ensure required fields
    const cleanedResult = {
      possibleConditions: analysisResult.possibleConditions || [],
      recommendedTreatments: analysisResult.recommendedTreatments || [],
      severity: analysisResult.severity || 'Mild',
      urgency: analysisResult.urgency || 'Consult a healthcare provider if symptoms persist',
      disclaimer: analysisResult.disclaimer || 'This analysis is for informational purposes only and should not replace professional medical advice.',
      followUpAdvice: analysisResult.followUpAdvice || []
    };

    return new Response(
      JSON.stringify(cleanedResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in analyze-symptoms function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze symptoms', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});