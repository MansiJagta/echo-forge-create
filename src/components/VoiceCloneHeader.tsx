import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mic, Sparkles, Users, Globe } from "lucide-react";

const VoiceCloneHeader = () => {
  return (
    <header className="w-full bg-gradient-hero relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
      
      <div className="container mx-auto px-6 py-24 relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">VoiceForge</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Button variant="ghost" asChild>
              <Link to="/info#features" className="text-foreground">Features</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/info#pricing" className="text-foreground">Pricing</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/auth" className="text-foreground border-border">Sign In</Link>
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-border">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI Voice Technology</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Create Lifelike{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Voice Clones
            </span>{" "}
            In Seconds
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Advanced AI voice cloning platform with multi-language support and transliteration. 
            Generate natural-sounding speech from text with famous API integrations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="hero" size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/generator">
                <Mic className="w-5 h-5 mr-2" />
                Start Voice Cloning
              </Link>
            </Button>
            <Button variant="glass" size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/info">Get Info</Link>
            </Button>
          </div>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-foreground">5-Second Voice Clone</span>
            </div>
            <div className="flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-foreground">15+ Languages</span>
            </div>
            <div className="flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-full px-4 py-2 border border-border">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-foreground">Team Collaboration</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default VoiceCloneHeader;