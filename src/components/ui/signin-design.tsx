import React, { useRef, useEffect, useState } from "react";
import { Eye, EyeOff, ArrowRight, Heart, Shield, Brain, Activity, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Helper function to merge class names
const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
};

// Custom Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}

const Button = ({ 
  children, 
  variant = "default", 
  className = "", 
  ...props 
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantStyles = {
    default: "bg-primary bg-gradient-to-r from-medical-500 to-medical-600 text-white hover:from-medical-600 hover:to-medical-700",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = ({ className = "", ...props }: InputProps) => {
  return (
    <input
      className={`flex h-10 w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-medical-500 focus-visible:ring-offset-2 focus-visible:border-medical-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className}`}
      {...props}
    />
  );
};

type RoutePoint = {
  x: number;
  y: number;
  delay: number;
};

const MedicalNetworkMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Set up medical network connections
  const routes: { start: RoutePoint; end: RoutePoint; color: string }[] = [
    {
      start: { x: 100, y: 150, delay: 0 },
      end: { x: 200, y: 80, delay: 2 },
      color: "#0ea5e9", // medical-500
    },
    {
      start: { x: 200, y: 80, delay: 2 },
      end: { x: 260, y: 120, delay: 4 },
      color: "#0ea5e9",
    },
    {
      start: { x: 50, y: 50, delay: 1 },
      end: { x: 150, y: 180, delay: 3 },
      color: "#0ea5e9",
    },
    {
      start: { x: 280, y: 60, delay: 0.5 },
      end: { x: 180, y: 180, delay: 2.5 },
      color: "#0ea5e9",
    },
  ];

  // Create dots for the medical network visualization
  const generateDots = (width: number, height: number) => {
    const dots = [];
    const gap = 15;
    const dotRadius = 1.5;

    // Create a medical network pattern
    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        // Shape the dots to form a medical network pattern
        const isInNetworkShape =
          // Hospital nodes
          ((x < width * 0.3 && x > width * 0.1) && (y < height * 0.4 && y > height * 0.2)) ||
          // Clinic nodes
          ((x < width * 0.7 && x > width * 0.5) && (y < height * 0.3 && y > height * 0.1)) ||
          // Research centers
          ((x < width * 0.5 && x > width * 0.3) && (y < height * 0.7 && y > height * 0.5)) ||
          // Patient network
          ((x < width * 0.9 && x > width * 0.6) && (y < height * 0.8 && y > height * 0.4));

        if (isInNetworkShape && Math.random() > 0.4) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.6 + 0.3,
          });
        }
      }
    }
    return dots;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });

    resizeObserver.observe(canvas.parentElement as Element);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dots = generateDots(dimensions.width, dimensions.height);
    let animationFrameId: number;
    let startTime = Date.now();

    // Draw background dots
    function drawDots() {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Draw the dots
      dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14, 165, 233, ${dot.opacity})`; // medical-500
        ctx.fill();
      });
    }

    // Draw animated routes
    function drawRoutes() {
      const currentTime = (Date.now() - startTime) / 1000;
      
      routes.forEach(route => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;
        
        const duration = 3;
        const progress = Math.min(elapsed / duration, 1);
        
        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;
        
        // Draw the route line
        ctx.beginPath();
        ctx.moveTo(route.start.x, route.start.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = route.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw the start point
        ctx.beginPath();
        ctx.arc(route.start.x, route.start.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = route.color;
        ctx.fill();
        
        // Draw the moving point
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#38bdf8"; // medical-400
        ctx.fill();
        
        // Add glow effect to the moving point
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56, 189, 248, 0.4)"; // medical-400 with opacity
        ctx.fill();
        
        // If the route is complete, draw the end point
        if (progress === 1) {
          ctx.beginPath();
          ctx.arc(route.end.x, route.end.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = route.color;
          ctx.fill();
        }
      });
    }
    
    // Animation loop
    function animate() {
      drawDots();
      drawRoutes();
      
      // If all routes are complete, restart the animation
      const currentTime = (Date.now() - startTime) / 1000;
      if (currentTime > 12) {
        startTime = Date.now();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

interface MedicalSignInProps {
  mode?: "signin" | "signup";
  onSubmit?: (data: { email: string; password: string; [key: string]: any }) => void;
  onToggleMode?: () => void;
  isLoading?: boolean;
}

const MedicalSignIn = ({ 
  mode = "signin", 
  onSubmit, 
  onToggleMode,
  isLoading = false 
}: MedicalSignInProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
    rememberMe: false
  });
  const [isHovered, setIsHovered] = useState(false);
  const [forgotPasswordDialogOpen, setForgotPasswordDialogOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
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
    <div className="flex w-full h-full items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl overflow-hidden rounded-2xl flex bg-white/90 backdrop-blur-xl shadow-2xl border border-medical-100/50"
      >
        {/* Left side - Medical Network Map */}
        <div className="hidden md:block w-1/2 h-[700px] relative overflow-hidden border-r border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-br from-medical-50/80 to-medical-100/80 backdrop-blur-sm">
            <MedicalNetworkMap />
            
            {/* Logo and text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mb-8"
              >
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-medical-500 to-medical-600 flex items-center justify-center mb-4 mx-auto">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
                  AI Medico
                </h1>
                <p className="text-gray-600 text-center text-lg">
                  Your Health, AI Powered
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="space-y-4 max-w-xs"
              >
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-8 h-8 bg-medical-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-medical-600" />
                  </div>
                  <span className="text-sm">AI-Powered Diagnosis</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-8 h-8 bg-medical-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-medical-600" />
                  </div>
                  <span className="text-sm">Secure Health Records</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-8 h-8 bg-medical-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-medical-600" />
                  </div>
                  <span className="text-sm">Real-time Monitoring</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="mt-8 text-center"
              >
                <p className="text-gray-500 text-sm">
                  Trusted by healthcare professionals worldwide
                </p>
                <div className="flex justify-center items-center space-x-6 mt-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-medical-600">50K+</div>
                    <div className="text-xs text-gray-500">Patients</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-medical-600">98%</div>
                    <div className="text-xs text-gray-500">Accuracy</div>
                  </div>
                  <div className="w-px h-8 bg-gray-300" />
                  <div className="text-center">
                    <div className="text-lg font-bold text-medical-600">24/7</div>
                    <div className="text-xs text-gray-500">Support</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right side - Sign in form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-sm mx-auto w-full"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {mode === "signin" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-medical-600 text-lg">
                {mode === "signin" 
                  ? "Sign in to access your health dashboard" 
                  : "Join the future of healthcare"
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12"
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 border-2 border-medical-200 focus:border-medical-500 rounded-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={isPasswordVisible ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-12 pr-10 border-2 border-medical-200 focus:border-medical-500 rounded-lg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-medical-500 hover:text-medical-600 transition-colors"
                  >
                    {isPasswordVisible ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {mode === "signup" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ 
                      duration: 0.4, 
                      ease: [0.4, 0.0, 0.2, 1],
                      y: { type: "spring", stiffness: 300, damping: 30 }
                    }}
                  >
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                        Confirm Password
                      </label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="h-12 border-2 border-medical-200 focus:border-medical-500 rounded-lg"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {mode === "signin" && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                      className="h-4 w-4 text-medical-500 border-gray-300 rounded focus:ring-medical-500"
                    />
                    <label htmlFor="rememberMe" className="text-sm text-medical-600">
                      Remember me
                    </label>
                  </div>
                  <Dialog open={forgotPasswordDialogOpen} onOpenChange={setForgotPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <motion.button 
                        type="button" 
                        className="text-sm text-medical-600 hover:text-medical-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        Forgot password?
                      </motion.button>
                    </DialogTrigger>
                    <AnimatePresence>
                      {forgotPasswordDialogOpen && (
                        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border border-medical-100 shadow-2xl rounded-2xl overflow-hidden">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            transition={{ 
                              type: "spring", 
                              stiffness: 300, 
                              damping: 25,
                              duration: 0.3
                            }}
                          >
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <DialogHeader className="space-y-3">
                          <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                            <motion.div 
                              className="p-2 bg-medical-100 rounded-lg"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
                            >
                              <Mail className="h-5 w-5 text-medical-500" />
                            </motion.div>
                            Reset Password
                          </DialogTitle>
                          <DialogDescription className="text-gray-600 leading-relaxed">
                            Enter your email address and we'll send you a link to reset your password.
                          </DialogDescription>
                        </DialogHeader>
                      </motion.div>
                      <motion.div 
                        className="space-y-6 py-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                      >
                        <div className="space-y-3">
                          <label htmlFor="forgot-email" className="text-sm font-semibold text-gray-700">
                            Email Address
                          </label>
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="Enter your email address"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            className="h-12 border-2 border-medical-200 focus:border-medical-500 focus:ring-2 focus:ring-medical-500/20 rounded-lg transition-all duration-200 bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                        <motion.div 
                          className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-3 pt-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <Button
                              variant="outline"
                              onClick={() => {
                                setForgotPasswordDialogOpen(false);
                                setForgotPasswordEmail("");
                              }}
                              disabled={isResettingPassword}
                              className="h-9 px-4 text-sm border-2 border-medical-200 text-medical-600 hover:bg-medical-50 hover:border-medical-300 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              Cancel
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          >
                            <Button
                              onClick={handleForgotPassword}
                              disabled={isResettingPassword || !forgotPasswordEmail}
                              className="h-9 px-4 text-sm bg-gradient-to-r from-medical-500 to-medical-600 hover:from-medical-600 hover:to-medical-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                            >
                              {isResettingPassword ? (
                                <>
                                  <motion.div 
                                    className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Mail className="mr-2 h-3 w-3" />
                                  Send Reset Link
                                </>
                              )}  
                            </Button>
                          </motion.div>
                        </motion.div>
                      </motion.div>
                          </motion.div>
                        </DialogContent>
                      )}
                    </AnimatePresence>
                  </Dialog>
                </div>
              )}

              <motion.div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                }}
                whileTap={{ 
                  scale: 0.98,
                  transition: { duration: 0.1, ease: [0.4, 0.0, 0.2, 1] }
                }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base font-medium bg-medical-500 hover:bg-medical-600 text-white rounded-lg shadow-lg"
                >
                  {mode === "signin" ? "Sign In" : "Create Account"}
                  <motion.div
                    animate={{ x: isHovered ? 5 : 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 400, 
                      damping: 25,
                      duration: 0.3
                    }}
                  >
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </form>



            <div className="mt-6 text-center">
              <button
                onClick={onToggleMode}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {mode === "signin" 
                  ? "Don't have an account? " 
                  : "Already have an account? "
                }
                <span className="text-medical-600 font-medium hover:text-medical-700">
                  {mode === "signin" ? "Sign up" : "Sign in"}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default MedicalSignIn;