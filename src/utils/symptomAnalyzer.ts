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
    console.log('Analyzing symptoms:', symptoms);
    console.log('API Key available:', !!import.meta.env.VITE_OPENAI_API_KEY);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Analyze symptoms keywords for more realistic responses
    const lowerSymptoms = symptoms.toLowerCase();
    const hasRespiratory = /cough|shortness|breath|wheez|chest pain/.test(lowerSymptoms);
    const hasFever = /fever|hot|chills|temperature/.test(lowerSymptoms);
    const hasGI = /nausea|vomit|diarrhea|stomach|abdominal/.test(lowerSymptoms);
    const hasNeurological = /headache|dizzy|confusion|seizure/.test(lowerSymptoms);
    
    let severity: "Mild" | "Moderate" | "Severe" | "Emergency" = "Mild";
    let conditions: Array<{name: string; probability: number; description: string}> = [];
    let treatments: Array<{treatment: string; priority: "High" | "Medium" | "Low"; description: string}> = [];
    
    if (hasRespiratory && hasFever) {
      severity = "Moderate";
      conditions = [
        { name: "Upper Respiratory Infection", probability: 65, description: "Common viral or bacterial infection of the upper respiratory tract" },
        { name: "Pneumonia", probability: 25, description: "Infection that inflames air sacs in lungs" },
        { name: "Bronchitis", probability: 40, description: "Inflammation of the lining of bronchial tubes" }
      ];
      treatments = [
        { treatment: "Rest and hydration", priority: "High", description: "Get plenty of rest and drink fluids" },
        { treatment: "See healthcare provider", priority: "High", description: "Schedule appointment within 24-48 hours" },
        { treatment: "Monitor symptoms", priority: "Medium", description: "Watch for worsening symptoms" }
      ];
    } else if (hasGI) {
      severity = "Mild";
      conditions = [
        { name: "Gastroenteritis", probability: 70, description: "Stomach flu causing inflammation of stomach and intestines" },
        { name: "Food poisoning", probability: 45, description: "Illness caused by contaminated food" }
      ];
      treatments = [
        { treatment: "Stay hydrated", priority: "High", description: "Drink clear fluids, avoid solid foods initially" },
        { treatment: "Rest", priority: "Medium", description: "Allow your body to recover" },
        { treatment: "BRAT diet", priority: "Low", description: "Bananas, rice, applesauce, toast when ready" }
      ];
    } else if (hasNeurological) {
      severity = "Moderate";
      conditions = [
        { name: "Tension headache", probability: 60, description: "Common headache caused by stress or muscle tension" },
        { name: "Migraine", probability: 30, description: "Severe headache often with nausea and sensitivity to light" }
      ];
      treatments = [
        { treatment: "Pain relief medication", priority: "High", description: "Over-the-counter pain relievers as directed" },
        { treatment: "Rest in dark room", priority: "Medium", description: "Avoid bright lights and loud sounds" },
        { treatment: "Stay hydrated", priority: "Medium", description: "Dehydration can worsen headaches" }
      ];
    } else {
      // Generic response
      conditions = [
        { name: "Common viral infection", probability: 50, description: "General viral illness with various symptoms" },
        { name: "Stress-related symptoms", probability: 30, description: "Physical symptoms caused by stress or anxiety" }
      ];
      treatments = [
        { treatment: "Rest and self-care", priority: "High", description: "Get adequate rest and manage stress" },
        { treatment: "Monitor symptoms", priority: "Medium", description: "Keep track of symptom changes" },
        { treatment: "Consult healthcare provider if worsens", priority: "Low", description: "Seek medical advice if symptoms persist or worsen" }
      ];
    }
    
    const result: SymptomAnalysisResult = {
      possibleConditions: conditions,
      recommendedTreatments: treatments,
      severity,
      urgency: severity === "Emergency" ? "Seek immediate medical attention" : 
               severity === "Severe" ? "See a healthcare provider within 24 hours" :
               severity === "Moderate" ? "Consider seeing a healthcare provider within 1-3 days" :
               "Monitor symptoms, see healthcare provider if they worsen or persist",
      disclaimer: "This analysis is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.",
      followUpAdvice: [
        "Monitor your symptoms closely",
        "Stay hydrated and get adequate rest",
        "Contact a healthcare provider if symptoms worsen",
        "Seek immediate medical attention if you experience severe symptoms"
      ]
    };
    
    console.log('Analysis result:', result);
    return result;
    
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    throw new Error('Unable to analyze symptoms at this time. Please try again later.');
  }
}
