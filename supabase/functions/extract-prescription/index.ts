import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractedMedicine {
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

interface ExtractedPrescriptionData {
  doctorName?: string;
  date?: string;
  medicines: ExtractedMedicine[];
  notes?: string;
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

    const { imageData, mimeType } = await req.json();

    if (!imageData || !mimeType) {
      return new Response(
        JSON.stringify({ error: 'Missing imageData or mimeType' }),
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
                  text: `Analyze this prescription image and extract the following information in JSON format:
                  {
                    "doctorName": "doctor's name if visible",
                    "date": "prescription date if visible (YYYY-MM-DD format)",
                    "medicines": [
                      {
                        "medicationName": "full medicine name with strength",
                        "dosage": {
                          "morning": 0,
                          "noon": 0, 
                          "afternoon": 0,
                          "night": 0
                        },
                        "instructions": "specific instructions for this medicine",
                        "frequency": "how often to take (e.g., 'twice daily', 'as needed')",
                        "duration": "how long to take (e.g., '7 days', '2 weeks')"
                      }
                    ],
                    "notes": "any additional notes or warnings"
                  }
                  
                  Important instructions:
                  - Extract ALL medicines mentioned in the prescription
                  - For dosage, interpret text like "1-0-1-0" as morning:1, noon:0, afternoon:1, night:0
                  - If dosage format is unclear, try to map frequency to appropriate times
                  - Include medicine strength/concentration in the medication name
                  - Be precise with medicine names and dosages
                  - Return only valid JSON, no additional text`
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageData
                  }
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

    const prescriptionData: ExtractedPrescriptionData = JSON.parse(jsonMatch[0]);
    
    // Validate and clean the data
    const cleanedData = {
      doctorName: prescriptionData.doctorName || '',
      date: prescriptionData.date || new Date().toISOString().split('T')[0],
      medicines: prescriptionData.medicines?.map(med => ({
        medicationName: med.medicationName || 'Unknown Medicine',
        dosage: {
          morning: Number(med.dosage?.morning) || 0,
          noon: Number(med.dosage?.noon) || 0,
          afternoon: Number(med.dosage?.afternoon) || 0,
          night: Number(med.dosage?.night) || 0
        },
        instructions: med.instructions || 'Take as prescribed',
        frequency: med.frequency,
        duration: med.duration
      })) || [],
      notes: prescriptionData.notes || ''
    };

    return new Response(
      JSON.stringify(cleanedData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in extract-prescription function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to extract prescription data', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});