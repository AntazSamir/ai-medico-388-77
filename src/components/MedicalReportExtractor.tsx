import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2, FileText, X } from "lucide-react";
import { extractMedicalReportData, ExtractedReportData } from "@/utils/medicalReportExtractor";

interface MedicalReportExtractorProps {
  onReportExtracted: (reportData: ExtractedReportData, imageUrl?: string) => void;
  onCancel: () => void;
}

export default function MedicalReportExtractor({ onReportExtracted, onCancel }: MedicalReportExtractorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Unsupported file type",
        description: "Images are supported now. PDF/DOC coming soon.",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleExtractReport = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      setUploadProgress(30);
      
      // Extract medical report data using Gemini API
      const reportData = await extractMedicalReportData(selectedImage);
      
      setUploadProgress(90);
      
      // Pass the extracted data to parent component
      onReportExtracted(reportData, imagePreview || undefined);
      
      setUploadProgress(100);
      
      toast({
        title: "Medical report extracted successfully!",
        description: `Extracted data from ${reportData.reportType || 'medical report'}`,
      });

      // Reset state
      setSelectedImage(null);
      setImagePreview(null);
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Error extracting medical report:', error);
      toast({
        title: "Extraction failed",
        description: error instanceof Error ? error.message : "Failed to extract medical report data",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <FileText className="h-12 w-12 text-medical-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Extract Medical Report Data</h3>
          <p className="text-muted-foreground">
            Upload an image of a medical report to automatically extract structured data
          </p>
        </div>

        {!imagePreview ? (
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-medical-500/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Drop medical report image here</p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse files
              </p>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx"
              onChange={handleFileInput}
              className="hidden"
              required
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={imagePreview} 
                alt="Medical report preview" 
                className="w-full max-h-96 object-contain rounded-lg border"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={resetUpload}
                className="absolute top-2 right-2"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Extracting medical data...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={onCancel} disabled={isUploading}>
                Cancel
              </Button>
              <Button variant="outline" onClick={resetUpload} disabled={isUploading}>
                Choose Different Image
              </Button>
              <Button 
                onClick={handleExtractReport}
                disabled={isUploading}
                className="bg-medical-500 hover:bg-medical-600 text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Extract Data
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}