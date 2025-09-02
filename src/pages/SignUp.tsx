
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MedicalSignIn from "@/components/ui/signin-design";
import PageTransition from "@/components/PageTransition";

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (data: { email: string; password: string; name: string; confirmPassword: string }) => {
    setIsLoading(true);
    
    // Validate password confirmation
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (authData.user) {
        toast({
          title: "Account created successfully",
          description: "Please check your email to verify your account",
        });
        navigate("/login");
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
    navigate("/login");
  };

  return (
    <PageTransition>
      <MedicalSignIn
        mode="signup"
        onSubmit={handleSignUp}
        onToggleMode={handleToggleMode}
        isLoading={isLoading}
      />
    </PageTransition>
  );
}
