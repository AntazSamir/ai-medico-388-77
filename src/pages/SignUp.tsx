
import SignUpForm from "@/components/auth/SignUpForm";
import PageTransition from "@/components/PageTransition";
import { BackgroundPaths } from "@/components/ui/background-paths";

export default function SignUp() {
  return (
    <PageTransition>
      <div className="relative min-h-screen">
        {/* Background with paths */}
        <div className="absolute inset-0">
          <BackgroundPaths
            title="Join AI Medico"
            subtitle="Create your account for personalized healthcare"
            showButton={false}
          />
        </div>
        
        {/* Sign up form overlay */}
        <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
          <SignUpForm />
        </div>
      </div>
    </PageTransition>
  );
}
