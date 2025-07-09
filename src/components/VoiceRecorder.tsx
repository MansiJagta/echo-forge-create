import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square,
  Trash2,
  Upload
} from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
}

const VoiceRecorder = ({ onRecordingComplete }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [audioSource, setAudioSource] = useState<'recording' | 'upload' | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Set up audio analysis for volume visualization
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      microphone.connect(analyser);
      
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioSource('recording');
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        onRecordingComplete?.(blob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start volume analysis
      const analyzeVolume = () => {
        if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
          setVolume(Math.min(100, (average / 255) * 100));
        }
        
        if (isRecording) {
          animationRef.current = requestAnimationFrame(analyzeVolume);
        }
      };
      analyzeVolume();

      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      setVolume(0);

      toast({
        title: "Recording completed",
        description: `Recorded ${recordingTime} seconds of audio`,
      });
    }
  };

  const playRecording = () => {
    if (audioUrl && !isPlaying) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };
      
      audio.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current = null;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an audio file",
          variant: "destructive"
        });
        return;
      }

      // Set audio data
      setAudioBlob(file);
      setAudioSource('upload');
      
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      // Calculate duration (approximate based on file size)
      const estimatedDuration = Math.round(file.size / 16000); // rough estimate
      setRecordingTime(estimatedDuration);
      
      onRecordingComplete?.(file);

      toast({
        title: "File uploaded",
        description: `Audio file "${file.name}" ready for voice cloning`,
      });
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    setAudioSource(null);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    toast({
      title: "Audio deleted",
      description: "Audio file has been removed",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Voice Recording</h3>
            <p className="text-sm text-muted-foreground">
              Record your voice sample for cloning
            </p>
          </div>

          {/* Recording Controls */}
          <div className="flex justify-center gap-3 flex-wrap">
            {!isRecording && !audioBlob && (
              <>
                <Button onClick={startRecording} variant="hero" size="lg">
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
                <Button onClick={triggerFileUpload} variant="outline" size="lg">
                  <Upload className="w-5 h-5 mr-2" />
                  Choose File
                </Button>
              </>
            )}

            {isRecording && (
              <Button onClick={stopRecording} variant="destructive" size="lg">
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </Button>
            )}

            {audioBlob && !isRecording && (
              <div className="flex gap-2">
                {!isPlaying ? (
                  <Button onClick={playRecording} variant="outline">
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                ) : (
                  <Button onClick={pauseRecording} variant="outline">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                
                <Button onClick={deleteRecording} variant="outline">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                
                <Button variant="hero">
                  <Upload className="w-4 h-4 mr-2" />
                  Use Recording
                </Button>
              </div>
            )}
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-mono text-primary">
                  {formatTime(recordingTime)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Recording in progress...
                </div>
              </div>
              
              {/* Volume Visualizer */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground text-center">
                  Input Level
                </div>
                <Progress value={volume} className="h-2" />
              </div>
              
              {/* Recording Indicator */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">REC</span>
                </div>
              </div>
            </div>
          )}

          {/* Recording Info */}
          {audioBlob && !isRecording && (
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">
                Recording Duration
              </div>
              <div className="text-lg font-semibold">
                {formatTime(recordingTime)}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Ready to use for voice cloning
              </div>
            </div>
          )}
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceRecorder;