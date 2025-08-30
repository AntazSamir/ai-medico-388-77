
import SignUpForm from "@/components/auth/SignUpForm";
import PageTransition from "@/components/PageTransition";

export default function SignUp() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medical-50 to-medical-100 p-4">
        <SignUpForm />
      </div>
    </PageTransition>
  );
}
