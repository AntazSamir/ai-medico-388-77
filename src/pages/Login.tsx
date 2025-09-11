
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MedicalSignIn from "@/components/ui/signin-design";
import PageTransition from "@/components/PageTransition";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // Handle specific email confirmation errors
        if (error.message.includes('email_not_confirmed') || error.message.includes('Email not confirmed')) {
          toast({
            title: "Email not confirmed",
            description: "Please check your email and click the confirmation link before signing in.",
            variant: "destructive",
          });
          
          // Offer to resend confirmation email
          try {
            await supabase.auth.resend({
              type: 'signup',
              email: data.email,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`
              }
            });
            toast({
              title: "Confirmation email sent",
              description: "Please check your email for the confirmation link.",
            });
          } catch (resendError) {
            console.error('Failed to resend confirmation:', resendError);
          }
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (authData.user) {
        // Double-check email confirmation status
        if (!authData.user.email_confirmed_at) {
          toast({
            title: "Email confirmation required",
            description: "Please confirm your email address before signing in.",
            variant: "destructive",
          });
          
          // Resend confirmation email
          try {
            await supabase.auth.resend({
              type: 'signup',
              email: data.email,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`
              }
            });
            toast({
              title: "Confirmation email sent",
              description: "Please check your email for the confirmation link.",
            });
          } catch (resendError) {
            console.error('Failed to resend confirmation:', resendError);
          }
          return;
        }

        toast({
          title: "Login successful",
          description: "Welcome back!",
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
