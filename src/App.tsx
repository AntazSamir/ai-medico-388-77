
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppBackgroundPaths } from "@/components/ui/app-background-paths";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Symptoms from "./pages/Symptoms";
import Profile from "./pages/Profile";
import FamilyMembers from "./pages/FamilyMembers";
import FamilyMemberReportCard from "./pages/FamilyMemberReportCard";
import Medications from "./pages/Medications";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";

// Deployment trigger comment - Updated at 5 min interval

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppBackgroundPaths />
        <div className="relative z-10">
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/symptoms" element={<Symptoms />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/family" element={<FamilyMembers />} />
            <Route path="/family/:memberId" element={<FamilyMemberReportCard />} />
            <Route path="/medications" element={<Medications />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
