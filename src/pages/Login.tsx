
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MedicalSignIn from "@/components/ui/travel-connect-signin-1";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PageTransition from "@/components/PageTransition";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (formData: any) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to AI Medico",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    navigate("/signup");
  };

  return (
    <PageTransition>
      <MedicalSignIn 
        mode="signin" 
        onSubmit={handleLogin}
        onToggleMode={handleToggleMode}
        isLoading={isLoading}
      />
    </PageTransition>
  );
}
