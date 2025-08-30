import { useNavigate } from "react-router-dom";
import { BackgroundPaths } from "@/components/ui/background-paths";
import PageTransition from "@/components/PageTransition";

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <PageTransition>
      <BackgroundPaths
        title="AI Medico"
        subtitle="Advanced healthcare management with AI-powered insights"
        buttonText="Get Started"
        onButtonClick={handleGetStarted}
      />
    </PageTransition>
  );
};

export default Index;
