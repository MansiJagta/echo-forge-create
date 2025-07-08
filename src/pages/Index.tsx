import VoiceCloneHeader from "@/components/VoiceCloneHeader";
import VoiceGenerator from "@/components/VoiceGenerator";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <VoiceCloneHeader />
      <VoiceGenerator />
      <FeaturesSection />
      <HowItWorksSection />
    </div>
  );
};

export default Index;
