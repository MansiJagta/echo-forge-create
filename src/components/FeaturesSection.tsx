import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Languages, 
  AudioWaveform, 
  Users, 
  Zap, 
  Database,
  Bot,
  Globe,
  Sparkles,
  Volume2,
  Download,
  Shield
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Voice Cloning",
      description: "Create highly realistic voice clones from just a 5-second audio sample using advanced AI technology.",
      badge: "Core Feature"
    },
    {
      icon: <Languages className="w-6 h-6" />,
      title: "Multi-Language Support",
      description: "Generate speech in 15+ languages including Hindi, Tamil, Telugu, Bengali, and major international languages.",
      badge: "15+ Languages"
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: "Famous API Integration",
      description: "Integrated with ElevenLabs, OpenAI TTS, Google Cloud TTS, and Azure Cognitive Services for premium quality.",
      badge: "Premium APIs"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Transliteration Engine",
      description: "Automatic transliteration support for Indian languages with smart script conversion and pronunciation guides.",
      badge: "Smart Tech"
    },
    {
      icon: <AudioWaveform className="w-6 h-6" />,
      title: "Real-time Generation",
      description: "Watch your text transform into natural speech in real-time with live progress tracking and status updates.",
      badge: "Live Processing"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Share voice profiles and manage permissions across your team for seamless workflow and project management.",
      badge: "Team Tools"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Generation",
      description: "Generate high-quality speech in seconds, not minutes. Perfect for quick turnaround projects and deadlines.",
      badge: "Lightning Fast"
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Asset Management",
      description: "Organize, store, and share your generated audio files with built-in asset management and version control.",
      badge: "Organization"
    },
    {
      icon: <Volume2 className="w-6 h-6" />,
      title: "High Quality Audio",
      description: "Professional-grade audio output with customizable quality settings and multiple format support.",
      badge: "Premium Quality"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Multiple Formats",
      description: "Export your generated audio in various formats including MP3, WAV, FLAC for different use cases.",
      badge: "Flexible Export"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your voice data and generated content are secured with enterprise-grade encryption and privacy protection.",
      badge: "Enterprise Security"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Enhancement",
      description: "Advanced AI algorithms continuously improve voice quality, naturalness, and emotional expression.",
      badge: "AI Powered"
    }
  ];

  const getBadgeVariant = (badge: string) => {
    if (badge.includes("Core") || badge.includes("Premium")) return "default";
    if (badge.includes("Languages") || badge.includes("Smart")) return "secondary";
    if (badge.includes("Fast") || badge.includes("Live")) return "outline";
    return "secondary";
  };

  return (
    <section className="py-24 bg-gradient-secondary relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-border">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Features</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything you need for{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              voice cloning
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform provides all the tools you need to create, manage, 
            and utilize realistic voice clones for your content.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-glow transition-all duration-300 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <Badge variant={getBadgeVariant(feature.badge)} className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;