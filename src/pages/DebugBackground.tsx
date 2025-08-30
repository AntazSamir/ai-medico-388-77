import { DebugBackgroundPaths } from "@/components/ui/debug-background";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function DebugBackground() {
  const navigate = useNavigate();

  return (
    <DebugBackgroundPaths>
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-white bg-black/50 p-4 rounded-lg backdrop-blur-sm">
            🎨 Debug Background Test
          </h1>
          <p className="text-xl text-medical-800 bg-white/80 p-4 rounded-lg backdrop-blur-sm">
            You should see animated blue paths and floating circles in the background!
          </p>
          <div className="space-x-4">
            <Button 
              onClick={() => navigate("/dashboard")}
              className="bg-white/90 text-medical-700 hover:bg-white"
            >
              ← Dashboard
            </Button>
            <Button 
              onClick={() => navigate("/background-showcase")}
              className="bg-medical-500 text-white hover:bg-medical-600"
            >
              Full Showcase →
            </Button>
          </div>
        </div>
      </div>
    </DebugBackgroundPaths>
  );
}