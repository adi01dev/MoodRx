
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Square, Send, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

interface VoiceRecorderProps {
  onAnalysisComplete?: (result: any) => void;
}

export function VoiceRecorder({ onAnalysisComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Clean up audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Start recording
  const startRecording = async () => {
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });
      
      mediaRecorder.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
      });
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start recording timer
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
      
      toast({
        title: "Recording started",
        description: "Speak clearly about how you're feeling today.",
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording failed",
        description: "Please check your microphone permissions and try again.",
        variant: "destructive",
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => {
        track.stop();
      });
      
      setIsRecording(false);
      
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      toast({
        title: "Recording completed",
        description: "Your voice check-in has been captured.",
      });
    }
  };

  // Format the recording time as mm:ss
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Submit the recording for analysis
  const analyzeRecording = async () => {
    if (!audioBlob) {
      toast({
        title: "No recording",
        description: "Please record your voice first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Create form data to send the audio file
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await api.post("/mood/analyze-voice", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (onAnalysisComplete) {
        onAnalysisComplete(response.data);
      }

      toast({
        title: "Analysis complete",
        description: "Your mood has been analyzed successfully.",
      });
    } catch (error) {
      console.error("Error analyzing recording:", error);
      toast({
        title: "Analysis failed",
        description: "There was a problem analyzing your recording.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <div 
            className={`w-24 h-24 rounded-full flex items-center justify-center ${
              isRecording 
                ? "bg-red-100 animate-pulse" 
                : audioBlob 
                  ? "bg-green-100" 
                  : "bg-wellness-teal-light"
            }`}
          >
            {isRecording ? (
              <div className="text-center">
                <div className="text-red-500 animate-pulse">
                  <Mic className="h-8 w-8 mx-auto" />
                </div>
                <div className="text-sm font-semibold mt-1 text-red-500">
                  {formatTime(recordingTime)}
                </div>
              </div>
            ) : audioBlob ? (
              <div className="text-wellness-green-dark">
                <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <Mic className="h-10 w-10 text-wellness-teal-dark" />
            )}
          </div>

          <div className="space-y-2 w-full">
            <div className="flex justify-center space-x-3">
              {!isRecording ? (
                <Button 
                  className="bg-wellness-blue hover:bg-wellness-blue-dark" 
                  onClick={startRecording}
                  disabled={isAnalyzing}
                >
                  Start Recording
                </Button>
              ) : (
                <Button 
                  variant="destructive" 
                  onClick={stopRecording}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              )}
            </div>

            {audioBlob && !isRecording && (
              <div className="mt-4 flex flex-col space-y-3 items-center">
                <audio src={audioUrl || undefined} controls className="w-full max-w-sm" />
                
                <Button 
                  className="bg-wellness-green hover:bg-wellness-green-dark"
                  onClick={analyzeRecording}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Analyze My Mood
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
