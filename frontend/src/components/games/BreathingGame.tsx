
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RefreshCw } from "lucide-react";

interface BreathingGameProps {
  onComplete: () => void;
}

// Breathing exercise phases
const PHASES = [
  { name: "inhale", duration: 4000, instruction: "Breathe in slowly..." },
  { name: "hold", duration: 4000, instruction: "Hold your breath..." },
  { name: "exhale", duration: 6000, instruction: "Breathe out slowly..." },
  { name: "rest", duration: 2000, instruction: "Rest..." },
];

export function BreathingGame({ onComplete }: BreathingGameProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  const phaseStartTimeRef = useRef<number>(0);

  // Total duration of one complete breath cycle
  const cycleDuration = PHASES.reduce((total, phase) => total + phase.duration, 0);
  
  // Number of cycles needed for a complete session
  const REQUIRED_CYCLES = 3;

  useEffect(() => {
    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (cyclesCompleted >= REQUIRED_CYCLES) {
      endSession();
    }
  }, [cyclesCompleted]);

  const toggleActive = () => {
    if (isActive) {
      pauseBreathing();
    } else {
      startBreathing();
    }
  };

  const startBreathing = () => {
    setIsActive(true);
    phaseStartTimeRef.current = performance.now();
    
    // Start the animation frame loop
    const updateFrame = (timestamp: number) => {
      if (!isActive) return;
      
      const elapsed = timestamp - phaseStartTimeRef.current;
      const currentPhaseDuration = PHASES[currentPhase].duration;
      
      // Update progress within current phase
      const phaseProgress = Math.min(elapsed / currentPhaseDuration, 1);
      setProgress(phaseProgress * 100);
      
      // Update total time
      setTotalTime(prev => prev + 16.67); // Approximately 60fps
      
      // Move to next phase if current one is complete
      if (elapsed >= currentPhaseDuration) {
        const nextPhase = (currentPhase + 1) % PHASES.length;
        setCurrentPhase(nextPhase);
        phaseStartTimeRef.current = timestamp;
        
        // Count a completed cycle
        if (nextPhase === 0) {
          setCyclesCompleted(prev => prev + 1);
        }
      }
      
      timerRef.current = requestAnimationFrame(updateFrame);
    };
    
    timerRef.current = requestAnimationFrame(updateFrame);
  };

  const pauseBreathing = () => {
    setIsActive(false);
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetBreathing = () => {
    pauseBreathing();
    setCurrentPhase(0);
    setProgress(0);
    setCyclesCompleted(0);
    setTotalTime(0);
  };

  const endSession = () => {
    pauseBreathing();
    onComplete();
  };

  // Format seconds into mm:ss
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate overall session progress
  const sessionProgress = (cyclesCompleted * cycleDuration + 
    currentPhase * PHASES[currentPhase].duration + 
    (progress / 100) * PHASES[currentPhase].duration) / 
    (REQUIRED_CYCLES * cycleDuration) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-wellness-green-dark">Deep Breathing Exercise</CardTitle>
        <CardDescription>
          Follow the breathing pattern to reduce stress and anxiety. Complete {REQUIRED_CYCLES} cycles.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative flex flex-col items-center justify-center p-10 bg-wellness-green-light/10 rounded-lg">
          <div className={`absolute w-40 h-40 rounded-full transition-all duration-1000 ease-in-out ${
            PHASES[currentPhase].name === "inhale" 
              ? "scale-100 bg-wellness-green-light/30" 
              : PHASES[currentPhase].name === "hold" 
              ? "scale-100 bg-wellness-green/50" 
              : PHASES[currentPhase].name === "exhale" 
              ? "scale-50 bg-wellness-green-light/30"
              : "scale-50 bg-wellness-green-light/20"
          }`} />
          
          <h3 className="text-2xl font-medium text-wellness-green-dark z-10">
            {PHASES[currentPhase].instruction}
          </h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current phase: {PHASES[currentPhase].name}</span>
            <span>{Math.floor(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall progress</span>
            <span>{cyclesCompleted}/{REQUIRED_CYCLES} cycles</span>
          </div>
          <Progress value={sessionProgress} className="h-2" />
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={resetBreathing}
            disabled={isActive}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          
          <Button onClick={toggleActive}>
            {isActive ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                {totalTime > 0 ? "Resume" : "Start"}
              </>
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-between text-sm text-muted-foreground">
        <div>Time: {formatTime(totalTime)}</div>
        <div>Cycles: {cyclesCompleted}/{REQUIRED_CYCLES}</div>
      </CardFooter>
    </Card>
  );
}
