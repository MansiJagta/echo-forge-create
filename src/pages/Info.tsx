import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mic } from "lucide-react";

const Info = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">VoiceForge</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/generator" className="flex items-center gap-2">
                  Start Generating
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <FeaturesSection />
      <HowItWorksSection />
      
      {/* Call to Action */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Create Your Voice Clone?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of users who are already creating amazing voice content with our AI technology.
          </p>
          <Button asChild variant="hero" size="lg">
            <Link to="/generator" className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Get Started Now
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Info;