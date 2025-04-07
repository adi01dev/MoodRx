
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Mic, Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

export function JournalEntry() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const { toast } = useToast();

  // Add a journal entry
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for your journal entry.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Missing content",
        description: "Please enter some content for your journal entry.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/journal/", {
        title,
        content,
      });

      toast({
        title: "Journal entry saved",
        description: "Your thoughts have been saved successfully.",
      });

      // Clear the form
      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Error saving journal entry:", error);
      toast({
        title: "Error saving entry",
        description: "There was a problem saving your journal entry.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle voice input mode
  const toggleVoiceInput = () => {
    if (!isVoiceInput) {
      startVoiceRecognition();
    } else {
      stopVoiceRecognition();
    }
  };

  // Start voice recognition
  const startVoiceRecognition = () => {
    // Check if the browser supports the Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = content;
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setContent(finalTranscript + interimTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice input error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
        setIsVoiceInput(false);
      };
      
      recognition.onend = () => {
        if (isVoiceInput) {
          recognition.start();
        }
      };
      
      // Start recognition
      recognition.start();
      
      // Store the recognition object so we can stop it later
      (window as any).currentRecognition = recognition;
      
      setIsVoiceInput(true);
      toast({
        title: "Voice input activated",
        description: "Speak clearly to record your journal entry.",
      });
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      toast({
        title: "Voice input failed",
        description: "Unable to start voice recognition.",
        variant: "destructive",
      });
    }
  };

  // Stop voice recognition
  const stopVoiceRecognition = () => {
    if ((window as any).currentRecognition) {
      (window as any).currentRecognition.stop();
      (window as any).currentRecognition = null;
    }
    
    setIsVoiceInput(false);
    toast({
      title: "Voice input deactivated",
      description: "Voice recording has stopped.",
    });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Write in Your Journal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            placeholder="Entry Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-medium"
          />
        </div>
        <div className="relative">
          <Textarea
            placeholder="What's on your mind today? How are you feeling?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] resize-y"
          />
          <Button
            variant={isVoiceInput ? "destructive" : "outline"}
            size="sm"
            onClick={toggleVoiceInput}
            className="absolute bottom-3 right-3"
          >
            <Mic className={`h-4 w-4 ${isVoiceInput ? "animate-pulse" : ""}`} />
            {isVoiceInput ? "Stop" : "Voice"}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !title.trim() || !content.trim()}
          className="bg-wellness-green hover:bg-wellness-green-dark text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Entry
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
