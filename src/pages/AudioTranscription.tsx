import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, Mic, FileAudio, Clock, CheckCircle, AlertCircle, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TranscriptionResult {
  id: string;
  filename: string;
  text: string;
  timestamp: Date;
  duration?: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

const AudioTranscription = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResults, setTranscriptionResults] = useState<TranscriptionResult[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sample demo transcription for testing
  const demoTranscription = `Hello, this is a sample transcription from an audio file. 
  
This demonstrates how the audio transcription feature works. The system can process various audio formats including MP3, WAV, M4A, and others.

The transcription includes punctuation, paragraph breaks, and maintains the natural flow of speech. This is particularly useful for:
- Meeting recordings
- Podcast transcripts
- Interview documentation
- Lecture notes
- Voice memos

The system supports multiple languages and can handle different accents and speaking speeds.`;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check if file is audio
      if (!selectedFile.type.startsWith('audio/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an audio file (mp3, wav, m4a, etc.)",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 25MB)
      if (selectedFile.size > 25 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 25MB",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
      toast({
        title: "File selected",
        description: `${selectedFile.name} is ready for transcription`,
      });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an audio file first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('audio', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`;
        
        // If it's an API key error, offer demo mode
        if (errorMessage.includes('API key') || errorMessage.includes('OpenAI')) {
          toast({
            title: "API Key Required",
            description: "Using demo mode. Set up your OpenAI API key for real transcriptions.",
            variant: "default",
          });
          setIsDemoMode(true);
          
          // Simulate demo transcription
          setTimeout(() => {
            const newTranscription: TranscriptionResult = {
              id: Date.now().toString(),
              filename: file.name,
              text: demoTranscription,
              timestamp: new Date(),
              status: 'completed',
              duration: 45,
            };
            
            setTranscriptionResults(prev => [newTranscription, ...prev]);
            setCurrentTranscription(demoTranscription);
            setFile(null);
            
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            
            toast({
              title: "Demo transcription completed",
              description: "This is a sample transcription. Set up your OpenAI API key for real transcriptions.",
            });
          }, 1000);
          
          return;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      const newTranscription: TranscriptionResult = {
        id: result.id || Date.now().toString(),
        filename: file.name,
        text: result.text || '',
        timestamp: new Date(),
        status: 'completed',
        duration: result.duration,
      };

      setTranscriptionResults(prev => [newTranscription, ...prev]);
      setCurrentTranscription(result.text || '');
      setFile(null);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Transcription completed",
        description: "Your audio has been successfully transcribed",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleDownload = (transcription: TranscriptionResult) => {
    const blob = new Blob([transcription.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${transcription.filename.replace(/\.[^/.]+$/, '')}_transcription.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Transcription text has been downloaded",
    });
  };

  const handleRecordAudio = () => {
    // This would integrate with browser's MediaRecorder API
    toast({
      title: "Recording feature",
      description: "Audio recording feature coming soon!",
    });
  };

  const getStatusIcon = (status: TranscriptionResult['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <FileAudio className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: TranscriptionResult['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Audio Transcription</h1>
        <p className="text-center text-muted-foreground">
          Upload your audio files and get accurate text transcriptions instantly
        </p>
        {isDemoMode && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-300 text-center">
              🎭 Demo Mode: Set up your OpenAI API key for real transcriptions
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Audio File
            </CardTitle>
            <CardDescription>
              Support for MP3, WAV, M4A, and other audio formats up to 25MB
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isTranscribing}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRecordAudio}
                  disabled={isUploading || isTranscribing}
                  className="flex items-center gap-2"
                >
                  <Mic className="h-4 w-4" />
                  Record Audio
                </Button>
              </div>
              
              <Input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {file && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <FileAudio className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <Badge variant="secondary">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                </div>
              )}
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
              
              <Button
                onClick={handleUpload}
                disabled={!file || isUploading || isTranscribing}
                className="w-full"
              >
                {isUploading ? 'Uploading...' : 'Transcribe Audio'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Transcription */}
        {currentTranscription && (
          <Card>
            <CardHeader>
              <CardTitle>Current Transcription</CardTitle>
              <CardDescription>
                Latest transcription result
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentTranscription}
                readOnly
                className="min-h-[200px] resize-none"
                placeholder="Transcription will appear here..."
              />
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => {
                    const blob = new Blob([currentTranscription], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'transcription.txt';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Text
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Transcriptions */}
        {transcriptionResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Transcriptions</CardTitle>
              <CardDescription>
                Your recent audio transcriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transcriptionResults.map((transcription) => (
                  <div
                    key={transcription.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(transcription.status)}
                      <div>
                        <p className="font-medium">{transcription.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          {transcription.timestamp.toLocaleString()}
                          {transcription.duration && ` • ${Math.round(transcription.duration)}s`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getStatusText(transcription.status)}
                      </Badge>
                      {transcription.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(transcription)}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AudioTranscription;