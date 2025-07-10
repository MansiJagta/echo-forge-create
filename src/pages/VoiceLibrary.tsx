import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Mic, ArrowLeft, Play, User, Users, Globe } from "lucide-react";
import { useState } from "react";

interface VoiceOption {
  id: string;
  name: string;
  gender: "Male" | "Female";
  accent: string;
  age: string;
  description: string;
  category: string;
  previewText: string;
}

const VoiceLibrary = () => {
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  const voiceLibrary: VoiceOption[] = [
    {
      id: "aria",
      name: "Aria",
      gender: "Female",
      accent: "American",
      age: "Young Adult",
      description: "Clear, professional voice perfect for business presentations",
      category: "Professional",
      previewText: "Hello, this is Aria. I'm here to help with your voice generation needs."
    },
    {
      id: "marcus",
      name: "Marcus",
      gender: "Male",
      accent: "British",
      age: "Middle-aged",
      description: "Sophisticated British accent, ideal for educational content",
      category: "Educational",
      previewText: "Good day, I'm Marcus. Let me assist you with creating engaging content."
    },
    {
      id: "sofia",
      name: "Sofia",
      gender: "Female",
      accent: "Spanish",
      age: "Young Adult",
      description: "Warm, friendly voice with subtle Spanish accent",
      category: "Conversational",
      previewText: "Hola, soy Sofia. I bring warmth and personality to your projects."
    },
    {
      id: "james",
      name: "James",
      gender: "Male",
      accent: "American",
      age: "Adult",
      description: "Deep, authoritative voice perfect for narration",
      category: "Narration",
      previewText: "I'm James, your narrator for compelling storytelling experiences."
    },
    {
      id: "elena",
      name: "Elena",
      gender: "Female",
      accent: "Italian",
      age: "Adult",
      description: "Melodic Italian accent, great for creative projects",
      category: "Creative",
      previewText: "Ciao, I'm Elena. Let's create something beautiful together."
    },
    {
      id: "david",
      name: "David",
      gender: "Male",
      accent: "Australian",
      age: "Young Adult",
      description: "Friendly Australian accent, perfect for casual content",
      category: "Casual",
      previewText: "G'day mate, I'm David. Ready to make your content more engaging."
    },
    {
      id: "priya",
      name: "Priya",
      gender: "Female",
      accent: "Indian",
      age: "Adult",
      description: "Clear Indian accent, excellent for diverse audiences",
      category: "Global",
      previewText: "Namaste, I'm Priya. I help connect with audiences worldwide."
    },
    {
      id: "antoine",
      name: "Antoine",
      gender: "Male",
      accent: "French",
      age: "Middle-aged",
      description: "Elegant French accent, perfect for luxury content",
      category: "Luxury",
      previewText: "Bonjour, je suis Antoine. Let's create something magnifique."
    }
  ];

  const categories = ["All", "Professional", "Educational", "Conversational", "Narration", "Creative", "Casual", "Global", "Luxury"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredVoices = selectedCategory === "All" 
    ? voiceLibrary 
    : voiceLibrary.filter(voice => voice.category === selectedCategory);

  const handlePlayVoice = (voiceId: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
    } else {
      setPlayingVoice(voiceId);
      // Simulate audio playback - in real implementation, this would play actual audio
      setTimeout(() => setPlayingVoice(null), 3000);
    }
  };

  const handleSelectVoice = (voiceId: string) => {
    setSelectedVoice(voiceId);
  };

  const handleApplyVoice = () => {
    if (selectedVoice) {
      // Pass selected voice back to generator
      const selectedVoiceData = voiceLibrary.find(v => v.id === selectedVoice);
      if (selectedVoiceData) {
        localStorage.setItem('selectedVoice', JSON.stringify(selectedVoiceData));
        window.history.back();
      }
    }
  };

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
              <Button variant="ghost" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Generator
              </Button>
              {selectedVoice && (
                <Button onClick={handleApplyVoice}>
                  Apply Selected Voice
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Voice Library Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Voice Library</h1>
          <p className="text-muted-foreground">
            Choose from our collection of premium AI voices for your projects
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Voice Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVoices.map((voice) => (
            <Card 
              key={voice.id} 
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                selectedVoice === voice.id ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
              onClick={() => handleSelectVoice(voice.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{voice.name}</CardTitle>
                  {voice.gender === "Male" ? (
                    <User className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Users className="w-5 h-5 text-pink-500" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {voice.accent}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {voice.age}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {voice.description}
                </p>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs italic text-muted-foreground mb-2">
                    Preview text:
                  </p>
                  <p className="text-sm">"{voice.previewText}"</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayVoice(voice.id);
                    }}
                  >
                    <Play className={`w-4 h-4 mr-1 ${playingVoice === voice.id ? 'animate-pulse' : ''}`} />
                    {playingVoice === voice.id ? 'Playing...' : 'Preview'}
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedVoice === voice.id ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectVoice(voice.id);
                    }}
                  >
                    {selectedVoice === voice.id ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No voices found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceLibrary;