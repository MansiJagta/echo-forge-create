import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
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
  Upload,
  FileAudio,
  Wand2,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface GenerationStatus {
  id: string;
  text: string;
  originalText: string;
  cleanedText: string;
  transliteratedText: string;
  language: string;
  voice: string;
  status: 'preparing' | 'cleaning' | 'transliterating' | 'generating' | 'completed' | 'failed';
  progress: number;
  audioUrl?: string;
  uploadedAudioUrl?: string;
  createdAt: Date;
}

const AdvancedGenerator = () => {
  const [text, setText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedVoice, setSelectedVoice] = useState("aria");
  const [selectedAPI, setSelectedAPI] = useState("elevenlabs");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<GenerationStatus[]>([]);
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setUploadedAudio(file);
      toast({
        title: "Audio uploaded",
        description: `${file.name} ready for voice cloning`,
      });
    } else {
      toast({
        title: "Invalid file",
        description: "Please select an audio file",
        variant: "destructive"
      });
    }
  };

  const simulateTextCleaning = (originalText: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate text cleaning: remove extra spaces, normalize punctuation
        const cleaned = originalText
          .replace(/\s+/g, ' ')
          .replace(/['"'']/g, "'")
          .replace(/[""]/g, '"')
          .trim();
        resolve(cleaned);
      }, 1000);
    });
  };

  const simulateTransliteration = (text: string, language: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate Google transliteration API response
        if (language === 'hi') {
          resolve(text + " (हिन्दी transliteration)");
        } else if (language === 'ta') {
          resolve(text + " (தமிழ் transliteration)");
        } else {
          resolve(text);
        }
      }, 1500);
    });
  };

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
    
    const newGeneration: GenerationStatus = {
      id: Math.random().toString(36).substr(2, 9),
      text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
      originalText: text,
      cleanedText: "",
      transliteratedText: "",
      language: selectedLanguage,
      voice: selectedVoice,
      status: 'preparing',
      progress: 0,
      uploadedAudioUrl: uploadedAudio ? URL.createObjectURL(uploadedAudio) : undefined,
      createdAt: new Date()
    };

    setGenerationHistory(prev => [newGeneration, ...prev]);

    try {
      // Step 1: Text Cleaning
      setGenerationHistory(prev => prev.map(gen => 
        gen.id === newGeneration.id ? { ...gen, status: 'cleaning', progress: 20 } : gen
      ));
      
      const cleanedText = await simulateTextCleaning(text);
      
      setGenerationHistory(prev => prev.map(gen => 
        gen.id === newGeneration.id ? { ...gen, cleanedText, progress: 40 } : gen
      ));

      // Step 2: Transliteration
      setGenerationHistory(prev => prev.map(gen => 
        gen.id === newGeneration.id ? { ...gen, status: 'transliterating', progress: 60 } : gen
      ));

      const transliteratedText = await simulateTransliteration(cleanedText, selectedLanguage);
      
      setGenerationHistory(prev => prev.map(gen => 
        gen.id === newGeneration.id ? { ...gen, transliteratedText, progress: 80 } : gen
      ));

      // Step 3: Voice Generation
      setGenerationHistory(prev => prev.map(gen => 
        gen.id === newGeneration.id ? { ...gen, status: 'generating', progress: 90 } : gen
      ));

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Complete generation
      setGenerationHistory(prev => prev.map(gen => 
        gen.id === newGeneration.id 
          ? { 
              ...gen, 
              status: 'completed', 
              progress: 100,
              audioUrl: `https://example.com/audio/${newGeneration.id}.mp3` 
            } 
          : gen
      ));

      toast({
        title: "Success!",
        description: "Voice generation completed successfully",
      });

    } catch (error) {
      setGenerationHistory(prev => prev.map(gen => 
        gen.id === newGeneration.id ? { ...gen, status: 'failed' } : gen
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

  const getStatusIcon = (status: GenerationStatus['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'preparing':
      case 'cleaning':
      case 'transliterating':
      case 'generating': 
        return <Loader2 className="w-4 h-4 animate-spin text-warning" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: GenerationStatus['status']) => {
    switch (status) {
      case 'preparing': return 'Preparing...';
      case 'cleaning': return 'Cleaning text...';
      case 'transliterating': return 'Transliterating...';
      case 'generating': return 'Generating voice...';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Advanced Voice Generator</h1>
        <p className="text-muted-foreground">Generate high-quality voice with text cleaning, transliteration, and voice cloning</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Generation Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Advanced Generation Studio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* API Selection */}
              <div className="space-y-2">
                <Label>AI API Provider</Label>
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

              {/* Text Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Text Content</Label>
                  <Badge variant="secondary" className="text-xs">
                    <Wand2 className="w-3 h-3 mr-1" />
                    Auto-cleaning & transliteration
                  </Badge>
                </div>
                <Textarea
                  placeholder="Enter your text here... It will be automatically cleaned and transliterated based on the selected language."
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
                  <Label>Language</Label>
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
                  <Label>Voice</Label>
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

              {/* Voice Sample Upload */}
              <div className="space-y-2">
                <Label>Voice Sample Upload (Optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/20">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadedAudio ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileAudio className="w-6 h-6 text-success" />
                      <span className="text-sm font-medium">{uploadedAudio.name}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setUploadedAudio(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <div className="text-sm text-muted-foreground mb-2">
                        Upload your voice sample for cloning
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Audio File
                      </Button>
                    </>
                  )}
                </div>
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
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Advanced Voice
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Generation History & Status */}
        <div className="space-y-6">
          <Card className="shadow-card border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AudioWaveform className="w-5 h-5 text-primary" />
                Generation Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generationHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No generations started yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generationHistory.slice(0, 10).map((generation) => (
                    <div 
                      key={generation.id} 
                      className="p-4 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {generation.text}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {languages.find(l => l.code === generation.language)?.flag}
                              {languages.find(l => l.code === generation.language)?.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {generation.voice}
                            </span>
                          </div>
                        </div>
                        <div className="ml-2 flex items-center gap-2">
                          {getStatusIcon(generation.status)}
                          <span className="text-xs text-muted-foreground">
                            {getStatusText(generation.status)}
                          </span>
                        </div>
                      </div>
                      
                      {generation.status !== 'completed' && generation.status !== 'failed' && (
                        <div className="space-y-2">
                          <Progress value={generation.progress} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {generation.progress}% complete
                          </div>
                        </div>
                      )}

                      {generation.cleanedText && (
                        <div className="text-xs">
                          <span className="font-medium text-muted-foreground">Cleaned: </span>
                          <span className="text-foreground">{generation.cleanedText.substring(0, 50)}...</span>
                        </div>
                      )}

                      {generation.transliteratedText && generation.transliteratedText !== generation.cleanedText && (
                        <div className="text-xs">
                          <span className="font-medium text-muted-foreground">Transliterated: </span>
                          <span className="text-foreground">{generation.transliteratedText.substring(0, 50)}...</span>
                        </div>
                      )}
                      
                      {generation.status === 'completed' && (
                        <div className="flex items-center gap-2">
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
                      
                      <div className="text-xs text-muted-foreground">
                        {generation.createdAt.toLocaleTimeString()}
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

export default AdvancedGenerator;