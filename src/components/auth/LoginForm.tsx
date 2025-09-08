
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LogIn, Brain, Shield, ActivitySquare, Eye, EyeOff, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
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
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Reset failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset email sent",
          description: "Check your email for password reset instructions",
        });
        setForgotPasswordDialogOpen(false);
        setForgotPasswordEmail("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-medical-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-medical-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-medical-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-medical-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left side - Branding & Features */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-medical-700 leading-tight">
              Your Health,<br />
              <span className="text-medical-500">AI Powered</span>
            </h1>
            <p className="text-lg text-medical-600 max-w-md mx-auto lg:mx-0">
              Advanced disease prediction, treatment recommendations, and secure medical record management
            </p>
          </div>

          <div className="grid gap-4 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl backdrop-blur-sm border border-medical-100">
              <div className="flex-shrink-0 w-10 h-10 bg-medical-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-medical-500" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-medical-700 text-sm">AI Diagnosis</div>
                <div className="text-medical-600 text-xs">Smart symptom analysis</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl backdrop-blur-sm border border-medical-100">
              <div className="flex-shrink-0 w-10 h-10 bg-medical-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-medical-500" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-medical-700 text-sm">Secure Storage</div>
                <div className="text-medical-600 text-xs">Blockchain protection</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl backdrop-blur-sm border border-medical-100">
              <div className="flex-shrink-0 w-10 h-10 bg-medical-100 rounded-lg flex items-center justify-center">
                <ActivitySquare className="w-5 h-5 text-medical-500" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-medical-700 text-sm">Progress Tracking</div>
                <div className="text-medical-600 text-xs">Monitor your health</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="p-8 bg-white/80 backdrop-blur-xl border-medical-100 shadow-2xl">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                <p className="text-medical-600">Sign in to your account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-medical-700">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 border-medical-200 focus:border-medical-500 focus:ring-medical-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-medical-700">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pr-12 border-medical-200 focus:border-medical-500 focus:ring-medical-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-medical-500 hover:text-medical-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-medical-500 hover:bg-medical-600 text-white font-medium rounded-xl"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </form>

              <div className="space-y-3">
                <Dialog open={forgotPasswordDialogOpen} onOpenChange={setForgotPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Forgot password button clicked');
                        setForgotPasswordDialogOpen(true);
                      }}
                      className="w-full text-sm text-medical-600 hover:text-medical-700 font-medium transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-medical-500" />
                        Reset Password
                      </DialogTitle>
                      <DialogDescription>
                        Enter your email address and we'll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="forgot-email" className="text-sm font-medium text-medical-700">
                          Email Address
                        </label>
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          className="border-medical-200 focus:border-medical-500 focus:ring-medical-500"
                        />
                      </div>
                      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setForgotPasswordDialogOpen(false);
                            setForgotPasswordEmail("");
                          }}
                          disabled={isResettingPassword}
                          className="border-medical-200 text-medical-600 hover:bg-medical-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleForgotPassword}
                          disabled={isResettingPassword || !forgotPasswordEmail}
                          className="bg-medical-500 hover:bg-medical-600 text-white"
                        >
                          {isResettingPassword ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Reset Link
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="text-center pt-4 border-t border-medical-100">
                <button
                  onClick={() => navigate("/signup")}
                  className="text-medical-600 hover:text-medical-700 font-medium transition-colors"
                >
                  Don't have an account? <span className="text-medical-500">Sign up</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
