import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Type, 
  Download, 
  ArrowRight, 
  Mic, 
  AudioWaveform,
  Languages,
  Bot
} from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      icon: <Upload className="w-8 h-8" />,
      title: "Add a Voice",
      description: "Upload a short audio sample of at least 5 seconds or record your voice directly through our platform. Our AI analyzes voice characteristics instantly.",
      features: ["5-second minimum", "Multiple formats", "Real-time analysis"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: "02", 
      icon: <Type className="w-8 h-8" />,
      title: "Generate Content",
      description: "Type or paste your text, select your preferred voice, language, and API provider. Enable transliteration for multi-language support.",
      features: ["15+ languages", "API selection", "Auto-transliteration"],
      color: "from-purple-500 to-pink-500"
    },
    {
      number: "03",
      icon: <Download className="w-8 h-8" />,
      title: "Manage Assets",
      description: "Track generation progress in real-time, organize audio files, and collaborate with your team. Download in multiple formats or integrate directly.",
      features: ["Real-time status", "Team sharing", "Multiple formats"],
      color: "from-green-500 to-emerald-500"
    }
  ];

  const apiProviders = [
    { name: "ElevenLabs", logo: <Bot className="w-6 h-6" />, quality: "Premium" },
    { name: "OpenAI TTS", logo: <AudioWaveform className="w-6 h-6" />, quality: "High" },
    { name: "Google Cloud", logo: <Languages className="w-6 h-6" />, quality: "Natural" },
    { name: "Azure", logo: <Mic className="w-6 h-6" />, quality: "Enterprise" }
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6">
            Simple Process
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How It Works
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create and use your AI voice clone in just three simple steps with real-time progress tracking
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="group hover:shadow-glow transition-all duration-500 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 animate-fade-in h-full">
                <CardContent className="p-8">
                  {/* Step Number and Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {step.icon}
                    </div>
                    <div className="text-6xl font-bold text-muted/20 group-hover:text-primary/20 transition-colors duration-300">
                      {step.number}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Arrow (except for last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* API Providers Section */}
        <div className="bg-gradient-secondary rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Powered by Industry-Leading APIs
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose from premium voice synthesis providers to ensure the highest quality output for your projects
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {apiProviders.map((provider, index) => (
              <Card key={index} className="p-4 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    {provider.logo}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{provider.name}</div>
                    <Badge variant="outline" className="text-xs">
                      {provider.quality}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button variant="hero" size="lg">
            Start Creating Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;