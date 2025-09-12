import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

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
  unit?: string | null;
  referenceRange?: string | null;
  status?: "Normal" | "High" | "Low" | "Critical" | null;
}

interface ExtractedFindings {
  category: string;
  finding?: string;
  severity?: "Mild" | "Moderate" | "Severe" | null;
}

interface ExtractedReportData {
  reportType: string;
  patientName?: string | null;
  doctorName?: string | null;
  hospitalName?: string | null;
  date?: string | null; // YYYY-MM-DD
  vitalSigns?: ExtractedVitalSigns;
  labResults?: ExtractedLabResult[];
  findings?: ExtractedFindings[];
  diagnosis?: string[];
  recommendations?: string[];
  summary?: string | null;
  nextAppointment?: string | null;
}

// Zod schemas for validation
const VitalSignsSchema = z.object({
  bloodPressure: z.string().optional(),
  heartRate: z.string().optional(),
  temperature: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  respiratoryRate: z.string().optional(),
  oxygenSaturation: z.string().optional(),
}).partial();

const LabResultItemSchema = z.object({
  testName: z.string().min(1),
  value: z.string().min(1),
  unit: z.string().nullable().optional(),
  referenceRange: z.string().nullable().optional(),
  status: z.enum(["Normal","High","Low","Critical"]).nullable().optional(),
});

const ClinicalFindingSchema = z.object({
  category: z.string().min(1),
  finding: z.string().optional(),
  severity: z.enum(["Mild","Moderate","Severe"]).nullable().optional(),
});

const UniversalReportSchema = z.object({
  reportType: z.string().min(1),
  patientName: z.string().nullable().optional(),
  doctorName: z.string().nullable().optional(),
  hospitalName: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  vitalSigns: VitalSignsSchema.optional(),
  labResults: z.array(LabResultItemSchema).optional(),
  findings: z.array(ClinicalFindingSchema).optional(),
  diagnosis: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
  summary: z.string().nullable().optional(),
  nextAppointment: z.string().nullable().optional(),
});

function standardizeReportType(input: string): string {
  const t = (input || "").toLowerCase();
  if (/(cbc|hematology|blood)/.test(t)) return "Blood Test";
  if (/(x[- ]?ray)/.test(t)) return "X-Ray";
  if (/(ct|computed tomography)/.test(t)) return "CT Scan";
  if (/(mri|magnetic resonance)/.test(t)) return "MRI";
  if (/(ultrasound|usg|sonography)/.test(t)) return "Ultrasound";
  if (/(ecg|electrocardiogram)/.test(t)) return "ECG";
  if (/(pathology|biopsy|histopath)/.test(t)) return "Pathology";
  if (/(discharge)/.test(t)) return "Discharge Summary";
  if (/(prescription|rx)/.test(t)) return "Prescription";
  return input || "Unknown Report";
}

function computeConfidence(clean: ExtractedReportData) {
  const conf: Record<string, number> = {};
  const present = (v: unknown) => (v === null || v === undefined) ? 0 : (typeof v === 'string' ? (v.trim().length > 0 ? 1 : 0) : 1);
  conf.reportType = present(clean.reportType);
  conf.patientName = present(clean.patientName);
  conf.doctorName = present(clean.doctorName);
  conf.hospitalName = present(clean.hospitalName);
  conf.date = present(clean.date);
  conf.vitalSigns = clean.vitalSigns && Object.values(clean.vitalSigns).some(v => present(v)) ? 0.8 : 0;
  conf.labResults = (clean.labResults && clean.labResults.length > 0) ? 0.9 : 0;
  conf.findings = (clean.findings && clean.findings.length > 0) ? 0.7 : 0;
  conf.diagnosis = (clean.diagnosis && clean.diagnosis.length > 0) ? 0.8 : 0;
  conf.recommendations = (clean.recommendations && clean.recommendations.length > 0) ? 0.6 : 0;
  conf.summary = present(clean.summary);
  conf.nextAppointment = present(clean.nextAppointment);
  return conf;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageData, mimeType, textContent } = await req.json();

    if ((!imageData || !mimeType) && !textContent) {
      return new Response(
        JSON.stringify({ error: 'Missing input. Provide imageData+mimeType or textContent.' }),
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

      const messages: unknown[] = [
        { role: 'system', content: systemPrompt },
      ];
      if (textContent && typeof textContent === 'string') {
        messages.push({ role: 'user', content: [{ type: 'text', text: `Extract from the following medical report text:
${textContent}
` }] });
      } else if (imageData && mimeType) {
        const dataUrl = `data:${mimeType};base64,${imageData}`;
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: 'Extract the structured JSON strictly following the schema.' },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        });
      }
      const openAiModel = (Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini').trim();
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: openAiModel,
          temperature: 0.2,
          max_tokens: 1200,
          messages
        })
      });
    } else {
      const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
      if (!geminiApiKey) {
        throw new Error('Neither OPENAI_API_KEY nor GEMINI_API_KEY is configured');
      }

      const parts: unknown[] = [];
      const promptText = `Analyze this medical report and extract the JSON per the schema in the instructions.`;
      parts.push({ text: promptText });
      if (textContent && typeof textContent === 'string') {
        parts.push({ text: `Report text:\n${textContent}` });
      } else if (imageData && mimeType) {
        parts.push({ inline_data: { mime_type: mimeType, data: imageData } });
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
                    text: `Analyze this medical report and extract the following information in JSON format:
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
                  ...parts
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

    // Validate against schema, standardize report type, and compute uncertainty
    const standardizedType = standardizeReportType(reportData.reportType || 'Unknown Report');
    const candidate: ExtractedReportData = {
      reportType: standardizedType,
      patientName: reportData.patientName ?? null,
      doctorName: reportData.doctorName ?? null,
      hospitalName: reportData.hospitalName ?? null,
      date: reportData.date ?? null,
      vitalSigns: reportData.vitalSigns || {},
      labResults: (reportData.labResults || []).map((lr) => ({
        testName: lr.testName,
        value: lr.value,
        unit: lr.unit ?? null,
        referenceRange: lr.referenceRange ?? null,
        status: lr.status ?? null
      })),
      findings: (reportData.findings || []).map((f) => ({
        category: f.category,
        finding: f.finding ?? undefined,
        severity: f.severity ?? null
      })),
      diagnosis: reportData.diagnosis || [],
      recommendations: reportData.recommendations || [],
      summary: reportData.summary ?? null,
      nextAppointment: reportData.nextAppointment ?? null
    };

    const parsed = UniversalReportSchema.safeParse(candidate);
    const uncertainFields: string[] = [];
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        if (issue.path && issue.path.length > 0) {
          uncertainFields.push(issue.path.join('.'));
        }
      }
    }
    const cleanedData = candidate as ExtractedReportData & { confidence?: Record<string, number>, uncertainFields?: string[] };
    cleanedData.reportType = standardizedType;
    const confidence = computeConfidence(cleanedData);
    (cleanedData as any).confidence = confidence;
    if (uncertainFields.length > 0) {
      (cleanedData as any).uncertainFields = Array.from(new Set(uncertainFields));
    }

    // Minimal logging (no PHI in logs where possible)
    try {
      const meta = {
        hasImage: Boolean(imageData && mimeType),
        hasText: Boolean(textContent && typeof textContent === 'string'),
        mimeType: mimeType || null,
        reportType: cleanedData.reportType,
        fields: Object.keys(confidence).filter(k => confidence[k] > 0),
      };
      console.log('[extract-medical-report] request meta:', JSON.stringify(meta));
    } catch (_) {
      // ignore logging errors
    }

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