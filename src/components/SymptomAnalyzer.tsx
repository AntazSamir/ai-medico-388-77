import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

interface SymptomAnalysis {
  possibleConditions: string[];
  recommendations: string[];
  severity: 'mild' | 'moderate' | 'severe' | 'urgent';
  disclaimer: string;
}

const SymptomAnalyzer: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast.error('Please describe your symptoms first');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a medical assistant providing preliminary symptom analysis. 
              Always include a disclaimer that this is not professional medical advice and users should consult healthcare providers.
              Respond in JSON format with: possibleConditions (array), recommendations (array), severity (mild/moderate/severe/urgent), disclaimer (string).
              Focus on general health guidance and common conditions.`
            },
            {
              role: 'user',
              content: `Please analyze these symptoms and provide guidance: ${symptoms}`
            }
          ],
          max_tokens: 800,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze symptoms');
      }

      const data = await response.json();
      const analysisResult = JSON.parse(data.choices[0].message.content);
      setAnalysis(analysisResult);
      
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      toast.error('Failed to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'severe': return 'text-orange-600';
      case 'urgent': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6" />
            Symptom Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="symptoms" className="block text-sm font-medium mb-2">
              Describe your symptoms in detail:
            </label>
            <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Please describe your symptoms, when they started, their severity, and any other relevant details..."
              rows={4}
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={analyzeSymptoms} 
            disabled={isAnalyzing || !symptoms.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Symptoms...
              </>
            ) : (
              'Analyze Symptoms'
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Analysis Results
                <span className={`text-sm font-medium ${getSeverityColor(analysis.severity)}`}>
                  Severity: {analysis.severity.toUpperCase()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Possible Conditions:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {analysis.possibleConditions.map((condition, index) => (
                    <li key={index} className="text-gray-700">{condition}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Recommendations:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Important Disclaimer:</h3>
                <p className="text-yellow-700 text-sm">{analysis.disclaimer}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SymptomAnalyzer;
