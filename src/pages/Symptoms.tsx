
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import { Stethoscope, AlertTriangle, Clock, ArrowLeft, User, CheckCircle } from "lucide-react";
import { analyzeSymptoms } from "@/utils/symptomAnalyzer";

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

export default function Symptoms() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SymptomAnalysisResult | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      toast({
        title: "Error",
        description: "Please enter your symptoms",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeSymptoms(symptoms);
      setAnalysisResult(result);

      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your symptoms and provided recommendations.",
      });
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      toast({
        title: "Error",
        description: "Unable to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Emergency": return "text-red-600 bg-red-50";
      case "Severe": return "text-orange-600 bg-orange-50";
      case "Moderate": return "text-yellow-600 bg-yellow-50";
      default: return "text-green-600 bg-green-50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-600 bg-red-50";
      case "Medium": return "text-yellow-600 bg-yellow-50";
      default: return "text-green-600 bg-green-50";
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen p-4 bg-gradient-to-br from-medical-50 to-medical-100">
        <div className="max-w-4xl mx-auto space-y-8 pt-8">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/profile")}
              className="text-medical-600 border-medical-600 hover:bg-medical-50 hover:text-medical-700"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </div>
          <Card className="glass-card p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Symptom Analysis</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-gray-700 font-medium">Describe your symptoms</label>
                <Textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Please describe your symptoms in detail (e.g., fever, headache, cough)..."
                  className="min-h-[200px] resize-none transition-all duration-300 focus:ring-2 focus:ring-medical-500 focus:border-medical-500"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-medical-500 hover:bg-medical-600 text-white btn-hover-lift"
                disabled={loading}
              >
                <Stethoscope className="mr-2 h-5 w-5" />
                {loading ? "Analyzing..." : "Analyze Symptoms"}
              </Button>
            </form>
          </Card>

          {analysisResult && (
            <>
              {/* Severity and Urgency Alert */}
              <Card className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(analysisResult.severity)}`}>
                    {analysisResult.severity === "Emergency" && <AlertTriangle className="h-4 w-4" />}
                    {analysisResult.severity !== "Emergency" && <Clock className="h-4 w-4" />}
                    {analysisResult.severity} Severity
                  </div>
                </div>
                <p className="text-gray-600 mt-3">{analysisResult.urgency}</p>
              </Card>

              {/* Possible Conditions */}
              <Card className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Stethoscope className="h-6 w-6 text-medical-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Possible Conditions</h2>
                </div>
                
                <div className="space-y-4">
                  {analysisResult.possibleConditions.map((condition, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{condition.name}</h3>
                        <span className="text-sm font-medium text-medical-600 bg-medical-50 px-2 py-1 rounded">
                          {condition.probability}% likely
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{condition.description}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recommended Treatments */}
              <Card className="glass-card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="h-6 w-6 text-medical-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Recommended Treatments</h2>
                </div>
                
                <div className="space-y-4">
                  {analysisResult.recommendedTreatments.map((treatment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{treatment.treatment}</h3>
                        <span className={`text-sm font-medium px-2 py-1 rounded ${getPriorityColor(treatment.priority)}`}>
                          {treatment.priority} Priority
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{treatment.description}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Follow-up Advice */}
              {analysisResult.followUpAdvice.length > 0 && (
                <Card className="glass-card p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Follow-up Advice</h2>
                  <ul className="space-y-2">
                    {analysisResult.followUpAdvice.map((advice, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-medical-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{advice}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {/* Medical Disclaimer */}
              <Card className="glass-card p-6 bg-medical-50 border-medical-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-medical-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-medical-700 mb-2">Important Medical Disclaimer</h3>
                    <p className="text-sm text-medical-600">{analysisResult.disclaimer}</p>
                  </div>
                </div>
              </Card>
            </>
          )}

          <Card className="glass-card p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Medical History</h2>
            <p className="text-gray-500">No previous medical records found.</p>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
