import VoiceCloneHeader from "@/components/VoiceCloneHeader";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Mic, Sparkles } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <VoiceCloneHeader />
      
      {/* Call to Action Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-border">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Ready to get started?</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Start Creating Your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Voice Clone
            </span>{" "}
            Now
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience the power of AI voice cloning with our advanced generation studio. 
            Transform text into lifelike speech in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="lg" className="text-lg px-8 py-6">
              <Link to="/generator">
                <Mic className="w-5 h-5 mr-2" />
                Start Generating
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg" className="text-lg px-8 py-6">
              <Link to="/info">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;