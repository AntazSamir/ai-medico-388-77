import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
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

    const systemPrompt = 'You are a careful medical assistant. Return only strict JSON. Do not include backticks or extra text.';
    const schemaText = `{
      "possibleConditions": [
        { "name": "condition name", "probability": number (0-100), "description": "brief description" }
      ],
      "recommendedTreatments": [
        { "treatment": "treatment name", "priority": "High" | "Medium" | "Low", "description": "treatment details" }
      ],
      "severity": "Mild" | "Moderate" | "Severe" | "Emergency",
      "urgency": "how urgent medical attention is needed",
      "disclaimer": "medical disclaimer about consulting healthcare professionals",
      "followUpAdvice": ["advice 1", "advice 2", "advice 3"]
    }`;

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze these symptoms and respond ONLY with valid JSON matching this exact schema (no markdown, no comments):\n\nSymptoms: "${symptoms}"\n\nSchema: ${schemaText}\n\nGuidelines:\n- Up to 3 most likely conditions\n- Evidence-based treatments\n- Consider severity and combinations\n- Include clear disclaimer\n- Prioritize safety and recommend professional consultation for serious symptoms` }
      ],
      temperature: 0.2,
      max_tokens: 800
    };

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('OpenAI API error:', errText);
      throw new Error(`OpenAI API request failed: ${aiResponse.status} ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const content: string = aiData.choices?.[0]?.message?.content || '';

    if (!content) {
      throw new Error('No content received from OpenAI API');
    }

    let parsed: SymptomAnalysisResult | null = null;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    if (!parsed) {
      throw new Error('Failed to parse JSON from OpenAI response');
    }

    const cleanedResult: SymptomAnalysisResult = {
      possibleConditions: parsed.possibleConditions || [],
      recommendedTreatments: parsed.recommendedTreatments || [],
      severity: parsed.severity || 'Mild',
      urgency: parsed.urgency || 'Consult a healthcare provider if symptoms persist',
      disclaimer: parsed.disclaimer || 'This analysis is for informational purposes only and should not replace professional medical advice.',
      followUpAdvice: parsed.followUpAdvice || []
    };

    return new Response(
      JSON.stringify(cleanedResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in analyze-symptoms function (OpenAI):', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze symptoms', 
        details: error?.message || String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});