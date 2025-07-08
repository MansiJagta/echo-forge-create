import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Mic, 
  Play, 
  Pause, 
  Download, 
  Loader2, 
  Languages, 
  AudioWaveform, 
  Bot,
  Sparkles,
  Upload
} from "lucide-react";

interface GenerationJob {
  id: string;
  text: string;
  language: string;
  voice: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  audioUrl?: string;
  createdAt: Date;
}

const VoiceGenerator = () => {
  const [text, setText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedVoice, setSelectedVoice] = useState("aria");
  const [selectedAPI, setSelectedAPI] = useState("elevenlabs");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentJobs, setRecentJobs] = useState<GenerationJob[]>([]);
  const { toast } = useToast();

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "ta", name: "Tamil", flag: "🇮🇳" },
    { code: "te", name: "Telugu", flag: "🇮🇳" },
    { code: "bn", name: "Bengali", flag: "🇧🇩" },
    { code: "gu", name: "Gujarati", flag: "🇮🇳" },
    { code: "mr", name: "Marathi", flag: "🇮🇳" },
    { code: "pa", name: "Punjabi", flag: "🇮🇳" },
    { code: "ur", name: "Urdu", flag: "🇵🇰" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
    { code: "ru", name: "Russian", flag: "🇷🇺" }
  ];

  const voices = [
    { id: "aria", name: "Aria", gender: "Female", accent: "American" },
    { id: "roger", name: "Roger", gender: "Male", accent: "British" },
    { id: "sarah", name: "Sarah", gender: "Female", accent: "Australian" },
    { id: "charlie", name: "Charlie", gender: "Male", accent: "Canadian" },
    { id: "priya", name: "Priya", gender: "Female", accent: "Indian" },
    { id: "arjun", name: "Arjun", gender: "Male", accent: "Indian" }
  ];

  const apis = [
    { id: "elevenlabs", name: "ElevenLabs", description: "Premium quality voice synthesis" },
    { id: "openai", name: "OpenAI TTS", description: "High-quality neural voices" },
    { id: "google", name: "Google Cloud TTS", description: "Natural language processing" },
    { id: "azure", name: "Azure Cognitive", description: "Microsoft's speech services" }
  ];

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to generate speech",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Create new job
    const newJob: GenerationJob = {
      id: Math.random().toString(36).substr(2, 9),
      text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
      language: selectedLanguage,
      voice: selectedVoice,
      status: 'processing',
      progress: 0,
      createdAt: new Date()
    };

    setRecentJobs(prev => [newJob, ...prev]);

    // Simulate generation process
    try {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setRecentJobs(prev => prev.map(job => 
          job.id === newJob.id ? { ...job, progress } : job
        ));
      }

      // Complete the job
      setRecentJobs(prev => prev.map(job => 
        job.id === newJob.id 
          ? { 
              ...job, 
              status: 'completed', 
              progress: 100,
              audioUrl: `https://example.com/audio/${newJob.id}.mp3` 
            } 
          : job
      ));

      toast({
        title: "Success!",
        description: "Voice generation completed successfully",
      });

    } catch (error) {
      setRecentJobs(prev => prev.map(job => 
        job.id === newJob.id ? { ...job, status: 'failed' } : job
      ));
      
      toast({
        title: "Error",
        description: "Failed to generate voice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: GenerationJob['status']) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'processing': return 'bg-warning';
      case 'failed': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: GenerationJob['status']) => {
    switch (status) {
      case 'completed': return <Download className="w-4 h-4" />;
      case 'processing': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'failed': return <span className="text-destructive">⚠</span>;
      default: return <Loader2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-6xl">
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Generation Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Voice Generation Studio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* API Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">AI API Provider</label>
                <Select value={selectedAPI} onValueChange={setSelectedAPI}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {apis.map(api => (
                      <SelectItem key={api.id} value={api.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{api.name}</span>
                          <span className="text-xs text-muted-foreground">- {api.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Text Input with Transliteration */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Text Content</label>
                  <Badge variant="secondary" className="text-xs">
                    <Languages className="w-3 h-3 mr-1" />
                    Auto-transliteration enabled
                  </Badge>
                </div>
                <Textarea
                  placeholder="Enter your text here... (Supports multiple languages and auto-transliteration)"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-32 resize-none"
                />
                <div className="text-xs text-muted-foreground">
                  {text.length}/5000 characters
                </div>
              </div>

              {/* Language and Voice Selection */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span className="mr-2">{lang.flag}</span>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Voice</label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map(voice => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <div className="flex items-center gap-2">
                            <span>{voice.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {voice.gender}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {voice.accent}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Upload Voice Sample */}
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/20">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <div className="text-sm text-muted-foreground mb-2">
                  Upload your voice sample (optional)
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
                variant="hero"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Voice
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Audio Section */}
        <div className="space-y-6">
          <Card className="shadow-card border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AudioWaveform className="w-5 h-5 text-primary" />
              Recent Audio
            </CardTitle>
            </CardHeader>
            <CardContent>
              {recentJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No audio generated yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentJobs.slice(0, 5).map((job) => (
                    <div 
                      key={job.id} 
                      className="p-3 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {job.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {languages.find(l => l.code === job.language)?.flag}
                              {languages.find(l => l.code === job.language)?.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {job.voice}
                            </span>
                          </div>
                        </div>
                        <div className="ml-2">
                          {getStatusIcon(job.status)}
                        </div>
                      </div>
                      
                      {job.status === 'processing' && (
                        <div className="space-y-1">
                          <Progress value={job.progress} className="h-1" />
                          <p className="text-xs text-muted-foreground">
                            {job.progress}% complete
                          </p>
                        </div>
                      )}
                      
                      {job.status === 'completed' && (
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="sm">
                            <Play className="w-3 h-3 mr-1" />
                            Play
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        {job.createdAt.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VoiceGenerator;