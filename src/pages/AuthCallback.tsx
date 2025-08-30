import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<"processing" | "success" | "ready" | "error">("processing");

  useEffect(() => {
    document.title = "Email Confirmation | Health Dashboard";

    const handleAuthRedirect = async () => {
      try {
        // Attempt to exchange a code-based session (magic link / recovery)
        await supabase.auth.exchangeCodeForSession(window.location.href);
      } catch (_) {
        // Ignore if no code is present; Supabase may already process hash tokens
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus("success");
          toast({ title: "Email confirmed", description: "You're now signed in." });
          setTimeout(() => navigate("/dashboard", { replace: true }), 900);
          return;
        }
        setStatus("ready");
      } catch (e) {
        setStatus("error");
      }
    };

    handleAuthRedirect();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medical-50 to-medical-100 p-4">
      <Card className="w-full max-w-md p-8 space-y-4 text-center glass-card">
        {status === "processing" && (
          <div className="space-y-3">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-medical-600" />
            <h1 className="text-xl font-semibold">Confirming your email…</h1>
            <p className="text-sm text-muted-foreground">This will just take a moment.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-3">
            <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" />
            <h1 className="text-xl font-semibold">Email confirmed!</h1>
            <p className="text-sm text-muted-foreground">Redirecting to your dashboard…</p>
          </div>
        )}

        {status === "ready" && (
          <div className="space-y-4">
            <AlertCircle className="mx-auto h-8 w-8 text-medical-600" />
            <h1 className="text-xl font-semibold">You're all set</h1>
            <p className="text-sm text-muted-foreground">
              Your email is confirmed. Please sign in to continue.
            </p>
            <Button className="w-full" onClick={() => navigate("/login")}>Go to Login</Button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
            <h1 className="text-xl font-semibold">Link error</h1>
            <p className="text-sm text-muted-foreground">The confirmation link is invalid or expired.</p>
            <Button className="w-full" onClick={() => navigate("/login")}>Go to Login</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
