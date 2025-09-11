
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppBackgroundPaths } from "@/components/ui/app-background-paths";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load pages for better mobile performance and code splitting
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Symptoms = lazy(() => import("./pages/Symptoms"));
const Profile = lazy(() => import("./pages/Profile"));
const FamilyMembers = lazy(() => import("./pages/FamilyMembers"));
const FamilyMemberReportCard = lazy(() => import("./pages/FamilyMemberReportCard"));
const Medications = lazy(() => import("./pages/Medications"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const BackgroundShowcase = lazy(() => import("./pages/BackgroundShowcase"));
const DebugBackground = lazy(() => import("./pages/DebugBackground"));
const EmailDebug = lazy(() => import("./pages/EmailDebug"));

// Loading component for better UX during lazy loading
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medical-50 via-white to-medical-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-500 mx-auto mb-4"></div>
      <p className="text-medical-600">Loading...</p>
    </div>
  </div>
);

// Deployment trigger comment - Updated at 5 min interval

function App() {
  console.log('App component rendering...');
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Optimize for mobile - reduce refetch frequency
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        retry: 2, // Reduce retries for mobile
        refetchOnWindowFocus: false, // Disable on mobile
      },
    },
  });

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppBackgroundPaths>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <div className="container-mobile safe-area-padding">
                  <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/background-showcase" element={<BackgroundShowcase />} />
                    <Route path="/debug-background" element={<DebugBackground />} />
                    <Route path="/debug/email" element={<EmailDebug />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/symptoms" element={<Symptoms />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/family" element={<FamilyMembers />} />
                    <Route path="/family/:memberId" element={<FamilyMemberReportCard />} />
                    <Route path="/medications" element={<Medications />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </Suspense>
            </BrowserRouter>
          </AppBackgroundPaths>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
