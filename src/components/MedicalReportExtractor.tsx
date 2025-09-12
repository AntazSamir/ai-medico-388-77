import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AnalyzerLoader from "@/components/AnalyzerLoader";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader2, FileText, X } from "lucide-react";
import { extractMedicalReportData } from "@/utils/medicalReportExtractor";
import { UniversalMedicalReport } from "@/types/medicalReport";
import { ocrImageToText } from "@/utils/ocr";
import { extractPdfText } from "@/utils/pdf";

interface MedicalReportExtractorProps {
  onReportExtracted: (reportData: UniversalMedicalReport, imageUrl?: string) => void;
  onCancel: () => void;
}

export default function MedicalReportExtractor({ onReportExtracted, onCancel }: MedicalReportExtractorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrPreview, setOcrPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setOcrPreview("");
    if (file.type.startsWith('image/')) {
      setSelectedPdf(null);
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Kick off OCR in background to enable text fallback/edit
      try {
        const text = await ocrImageToText(file);
        setOcrPreview(text);
      } catch (_) {
        setOcrPreview("");
      }
    } else if (file.type === 'application/pdf') {
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedPdf(file);
      try {
        const text = await extractPdfText(file);
        setOcrPreview(text);
      } catch (e) {
        setOcrPreview("");
        toast({ title: 'PDF processing failed', description: e instanceof Error ? e.message : 'Unable to read PDF', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Unsupported file type', description: 'Please upload an image (PNG/JPG/WebP) or PDF.', variant: 'destructive' });
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleExtractReport = async () => {
    if (!selectedImage && !selectedPdf && !ocrPreview) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      setUploadProgress(30);
      let reportData: UniversalMedicalReport;
      if (ocrPreview && (!selectedImage && selectedPdf)) {
        // PDF path already produced text
        reportData = await extractMedicalReportData({ text: ocrPreview });
      } else if (ocrPreview && selectedImage) {
        // Prefer OCR text to reduce tokens and errors
        reportData = await extractMedicalReportData({ text: ocrPreview });
      } else if (selectedImage) {
        reportData = await extractMedicalReportData(selectedImage);
      } else {
        // As a last resort, try any text gathered
        reportData = await extractMedicalReportData({ text: ocrPreview });
      }
      
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
      setSelectedPdf(null);
      setImagePreview(null);
      setOcrPreview("");
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Error extracting medical report:', error);
      const message = error instanceof Error ? error.message : "Failed to extract medical report data";
      toast({ title: "Extraction failed", description: message, variant: "destructive" });
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
              <p className="text-lg font-medium mb-2">Drop medical report file here</p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse files
              </p>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf"
              onChange={handleFileInput}
              className="hidden"
              required
            />

            {(selectedImage || selectedPdf) && !imagePreview && (
              <div className="flex items-center justify-between gap-3 p-3 rounded border bg-gray-50">
                <div className="text-left text-sm">
                  <div className="font-medium truncate max-w-[220px]">{(selectedImage || selectedPdf)!.name}</div>
                  <div className="text-muted-foreground text-xs">Ready to extract</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetUpload}>Change</Button>
                  <Button size="sm" className="bg-medical-500 hover:bg-medical-600 text-white" onClick={handleExtractReport}>
                    <FileText className="h-4 w-4 mr-2" />
                    Extract
                  </Button>
                </div>
              </div>
            )}

            {ocrPreview && (
              <div className="text-left space-y-2">
                <p className="text-sm font-medium">OCR text preview (editable)</p>
                <textarea
                  className="w-full h-32 p-2 border rounded text-sm"
                  value={ocrPreview}
                  onChange={(e) => setOcrPreview(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleExtractReport} className="bg-medical-500 hover:bg-medical-600 text-white">
                    <FileText className="h-4 w-4 mr-2" /> Use Text For Extraction
                  </Button>
                </div>
              </div>
            )}
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
                size="sm"
                onClick={handleExtractReport}
                className="absolute top-2 right-14 bg-medical-500 hover:bg-medical-600 text-white"
                disabled={isUploading}
              >
                <FileText className="h-4 w-4 mr-2" />
                Extract
              </Button>
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
              <div className="space-y-4">
                <AnalyzerLoader progress={uploadProgress} />
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