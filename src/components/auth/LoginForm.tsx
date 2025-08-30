
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MedicalSignInCard from "@/components/ui/travel-connect-signin-1";
import { BackgroundPaths } from "@/components/ui/background-paths";

export default function LoginForm() {
  return (
    <div className="relative min-h-screen">
      {/* Background with paths */}
      <div className="absolute inset-0">
        <BackgroundPaths
          title="Welcome Back"
          subtitle="Sign in to your health dashboard"
          showButton={false}
        />
      </div>
      
      {/* Login form overlay */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <MedicalSignInCard />
      </div>
    </div>
  );
}
