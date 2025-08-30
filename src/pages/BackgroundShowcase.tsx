import { BackgroundPaths } from "@/components/ui/background-paths";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function BackgroundShowcase() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <BackgroundPaths 
        title="AI Medico" 
        subtitle="Your Health, AI Powered"
      />
      
      {/* Navigation button */}
      <div className="fixed top-4 left-4 z-50">
        <Button 
          onClick={() => navigate("/dashboard")}
          variant="outline"
          className="bg-white/90 backdrop-blur-sm hover:bg-white/100"
        >
          ← Back to Dashboard
        </Button>
      </div>
    </div>
  );
}