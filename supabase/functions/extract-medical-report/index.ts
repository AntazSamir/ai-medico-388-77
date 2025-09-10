import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractedVitalSigns {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  weight?: string;
  height?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
}

interface ExtractedLabResult {
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status?: "Normal" | "High" | "Low" | "Critical";
}

interface ExtractedFindings {
  category: string;
  finding: string;
  severity?: "Mild" | "Moderate" | "Severe";
}

interface ExtractedReportData {
  reportType: string;
  patientName?: string;
  doctorName?: string;
  hospitalName?: string;
  date?: string;
  vitalSigns?: ExtractedVitalSigns;
  labResults?: ExtractedLabResult[];
  findings?: ExtractedFindings[];
  diagnosis?: string[];
  recommendations?: string[];
  summary?: string;
  nextAppointment?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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

    // Prefer OpenAI if available; otherwise fall back to Gemini
    const openaiKey = (Deno.env.get('OPENAI_API_KEY') || '').trim();
    const useOpenAI = Boolean(openaiKey);

    let response: Response;
    if (useOpenAI) {
      // Use OpenAI Vision via Chat Completions (gpt-4o-mini)
      const systemPrompt = `You are a medical information extraction system. Return ONLY strict JSON with the following structure and no extra text.
{
  "reportType": "type of medical report (e.g., Blood Test, X-Ray, MRI, CT, Ultrasound, ECG, Discharge Summary, Prescription, Pathology)",
  "patientName": string|null,
  "doctorName": string|null,
  "hospitalName": string|null,
  "date": "YYYY-MM-DD"|null,
  "vitalSigns": {
    "bloodPressure": string|null,
    "heartRate": string|null,
    "temperature": string|null,
    "weight": string|null,
    "height": string|null,
    "respiratoryRate": string|null,
    "oxygenSaturation": string|null
  },
  "labResults": [{
    "testName": string,
    "value": string,
    "unit": string|null,
    "referenceRange": string|null,
    "status": "Normal"|"High"|"Low"|"Critical"|null
  }],
  "findings": [{
    "category": string,
    "finding": string,
    "severity": "Mild"|"Moderate"|"Severe"|null
  }],
  "diagnosis": [string],
  "recommendations": [string],
  "summary": string|null,
  "nextAppointment": string|null
}`;

      const dataUrl = `data:${mimeType};base64,${imageData}`;
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.2,
          max_tokens: 1200,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Extract the structured JSON strictly following the schema.' },
                { type: 'image_url', image_url: { url: dataUrl } }
              ]
            }
          ]
        })
      });
    } else {
      const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
      if (!geminiApiKey) {
        throw new Error('Neither OPENAI_API_KEY nor GEMINI_API_KEY is configured');
      }

      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this medical report image and extract the following information in JSON format:
                    {
                      "reportType": "type of medical report (e.g., Blood Test, X-Ray, MRI, CT Scan, Ultrasound, ECG, etc.)",
                      "patientName": "patient's name if visible",
                      "doctorName": "doctor's name if visible",
                      "hospitalName": "hospital or clinic name if visible",
                      "date": "report date if visible (YYYY-MM-DD format)",
                      "vitalSigns": {
                        "bloodPressure": "blood pressure reading",
                        "heartRate": "heart rate with unit",
                        "temperature": "body temperature with unit",
                        "weight": "weight with unit",
                        "height": "height with unit",
                        "respiratoryRate": "respiratory rate with unit",
                        "oxygenSaturation": "oxygen saturation percentage"
                      },
                      "labResults": [
                        {
                          "testName": "name of the test/parameter",
                          "value": "measured value",
                          "unit": "unit of measurement",
                          "referenceRange": "normal range if provided",
                          "status": "Normal/High/Low/Critical based on reference range"
                        }
                      ],
                      "findings": [
                        {
                          "category": "category of finding (e.g., Cardiovascular, Respiratory, etc.)",
                          "finding": "specific finding or observation",
                          "severity": "Mild/Moderate/Severe if indicated"
                        }
                      ],
                      "diagnosis": ["list of diagnoses or conditions mentioned"],
                      "recommendations": ["list of recommendations or treatment plans"],
                      "summary": "overall summary or impression from the report",
                      "nextAppointment": "next appointment date if mentioned"
                    }
                    
                    Important instructions:
                    - Extract ALL relevant medical information from the report
                    - For lab results, include all test parameters with their values and units
                    - Categorize findings by medical specialty when possible
                    - Be precise with medical terminology and values
                    - Include reference ranges when available
                    - Determine status (Normal/High/Low/Critical) based on reference ranges
                    - Return only valid JSON, no additional text
                    - If a section is not present in the report, omit it or set to null`
                  },
                  { inline_data: { mime_type: mimeType, data: imageData } }
                ]
              }
            ]
          })
        }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Normalize model outputs to a JSON string
    let jsonString: string | null = null;
    // OpenAI chat.completions
    const openAiContent = data?.choices?.[0]?.message?.content;
    if (typeof openAiContent === 'string' && openAiContent.length > 0) {
      jsonString = openAiContent;
    }
    // Gemini response
    if (!jsonString && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      jsonString = data.candidates[0].content.parts[0].text;
    }

    if (!jsonString) {
      throw new Error('No content received from the AI API');
    }

    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const reportData: ExtractedReportData = JSON.parse(jsonMatch[0]);
    
    // Validate and clean the data
    const cleanedData = {
      reportType: reportData.reportType || 'Unknown Report',
      patientName: reportData.patientName || '',
      doctorName: reportData.doctorName || '',
      hospitalName: reportData.hospitalName || '',
      date: reportData.date || new Date().toISOString().split('T')[0],
      vitalSigns: reportData.vitalSigns || {},
      labResults: reportData.labResults || [],
      findings: reportData.findings || [],
      diagnosis: reportData.diagnosis || [],
      recommendations: reportData.recommendations || [],
      summary: reportData.summary || '',
      nextAppointment: reportData.nextAppointment || ''
    };

    return new Response(
      JSON.stringify(cleanedData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in extract-medical-report function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to extract medical report data', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});