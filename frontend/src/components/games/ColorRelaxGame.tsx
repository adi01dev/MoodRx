
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Check } from "lucide-react";

interface ColorRelaxGameProps {
  onComplete: () => void;
}

// Color palette presets for relaxation
const COLOR_PALETTES = [
  {
    name: "Ocean Calm",
    colors: ["#023E8A", "#0077B6", "#0096C7", "#00B4D8", "#48CAE4", "#90E0EF"],
  },
  {
    name: "Forest Serenity",
    colors: ["#1B4332", "#2D6A4F", "#40916C", "#52B788", "#74C69D", "#95D5B2"],
  },
  {
    name: "Sunset Glow",
    colors: ["#7F5539", "#B08968", "#DDA15E", "#FFDDD2", "#FFCDB2", "#E8985E"],
  },
  {
    name: "Lavender Fields",
    colors: ["#4A4E69", "#5A5D8A", "#7984AB", "#9A8C98", "#C9ADA7", "#F2E9E4"],
  },
];

export function ColorRelaxGame({ onComplete }: ColorRelaxGameProps) {
  const [selectedPalette, setSelectedPalette] = useState(COLOR_PALETTES[0]);
  const [selectedColor, setSelectedColor] = useState(selectedPalette.colors[0]);
  const [customColor, setCustomColor] = useState({ r: 100, g: 150, b: 200 });
  const [breathingActive, setBreathingActive] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [fadeInOut, setFadeInOut] = useState<number>(0);
  const fadeDirectionRef = useRef<number>(1);

  // Setup canvas drawing on component mount
  useEffect(() => {
    setupCanvas();
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Update canvas when color or palette changes
  useEffect(() => {
    drawBackground();
  }, [selectedColor, customColor]);

  useEffect(() => {
    // When breathing starts, setup breathing animation and timer
    if (breathingActive) {
      startBreathingAnimation();
      timerRef.current = window.setInterval(() => {
        setTimeSpent(prev => {
          // Auto-complete after 60 seconds
          if (prev >= 60 && !gameCompleted) {
            completeGame();
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      // Clean up animation and timer when stopped
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [breathingActive]);

  // Change colors when palette changes
  useEffect(() => {
    setSelectedColor(selectedPalette.colors[0]);
  }, [selectedPalette]);

  const setupCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Make canvas responsive
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = 300; // Fixed height or determine based on container
      
      drawBackground();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  };

  const drawBackground = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    
    if (selectedColor === 'custom') {
      const rgbString = `rgb(${customColor.r}, ${customColor.g}, ${customColor.b})`;
      gradient.addColorStop(0, rgbString);
      gradient.addColorStop(1, lightenColor(rgbString, 30));
    } else {
      gradient.addColorStop(0, selectedColor);
      gradient.addColorStop(1, lightenColor(selectedColor, 30));
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Add some subtle circles for visual interest
    if (breathingActive) {
      drawBreathingCircles(ctx, w, h);
    }
  };

  const drawBreathingCircles = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const centerX = w / 2;
    const centerY = h / 2;
    const maxRadius = Math.min(w, h) * 0.4;
    
    // Draw ripple circles with opacity based on breathing animation
    for (let i = 3; i >= 0; i--) {
      const radius = maxRadius * (0.5 + (i * 0.15)) * (0.8 + fadeInOut * 0.2);
      const opacity = Math.max(0, 0.5 - (i * 0.1) - fadeInOut * 0.2);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      
      if (selectedColor === 'custom') {
        ctx.fillStyle = `rgba(${customColor.r}, ${customColor.g}, ${customColor.b}, ${opacity})`;
      } else {
        const color = hexToRgb(selectedColor);
        if (color) {
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
        }
      }
      
      ctx.fill();
    }
  };

  const startBreathingAnimation = () => {
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      
      // Update fade in/out effect
      const fadeSpeed = 0.0005;
      const newFade = fadeInOut + (fadeDirectionRef.current * fadeSpeed * deltaTime);
      
      if (newFade > 1) {
        fadeDirectionRef.current = -1;
        setFadeInOut(1);
      } else if (newFade < 0) {
        fadeDirectionRef.current = 1;
        setFadeInOut(0);
      } else {
        setFadeInOut(newFade);
      }
      
      drawBackground();
      
      if (breathingActive) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    if (!animFrameRef.current) {
      animFrameRef.current = requestAnimationFrame(animate);
    }
  };

  const toggleBreathing = () => {
    setBreathingActive(!breathingActive);
  };

  const completeGame = () => {
    setBreathingActive(false);
    setGameCompleted(true);
    onComplete();
  };

  // Helper function to lighten a color
  const lightenColor = (color: string, percent: number) => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    
    return `rgb(${Math.min(255, rgb.r + percent)}, ${Math.min(255, rgb.g + percent)}, ${Math.min(255, rgb.b + percent)})`;
  };

  // Helper to convert hex to rgb
  const hexToRgb = (hex: string) => {
    // Check if it's already an rgb color
    if (hex.startsWith('rgb')) {
      const rgbValues = hex.match(/\d+/g);
      if (rgbValues && rgbValues.length >= 3) {
        return {
          r: parseInt(rgbValues[0], 10),
          g: parseInt(rgbValues[1], 10),
          b: parseInt(rgbValues[2], 10)
        };
      }
      return null;
    }
    
    // Remove # if present
    const cleanHex = hex.charAt(0) === '#' ? hex.slice(1) : hex;
    
    // Convert to rgb
    const bigint = parseInt(cleanHex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-wellness-green-dark">Color Relaxation</CardTitle>
        <CardDescription>
          Focus on calming colors and breathing patterns to reduce stress and anxiety.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-hidden rounded-lg">
          <canvas 
            ref={canvasRef} 
            className="w-full h-[300px]"
          />
        </div>
        
        <Tabs defaultValue="palette">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="palette">Color Palettes</TabsTrigger>
            <TabsTrigger value="custom">Custom Color</TabsTrigger>
          </TabsList>
          
          <TabsContent value="palette" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {COLOR_PALETTES.map((palette) => (
                <Button
                  key={palette.name}
                  variant="outline"
                  className={`h-auto py-2 justify-start ${
                    selectedPalette.name === palette.name ? "border-wellness-green" : ""
                  }`}
                  onClick={() => setSelectedPalette(palette)}
                >
                  <div className="w-full">
                    <div className="text-left mb-1">{palette.name}</div>
                    <div className="flex space-x-1">
                      {palette.colors.map((color, i) => (
                        <div
                          key={i}
                          className="h-4 w-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Select Color</h3>
              <div className="flex flex-wrap gap-2">
                {selectedPalette.colors.map((color, i) => (
                  <button
                    key={i}
                    className={`h-8 w-8 rounded-full border-2 ${
                      selectedColor === color ? "border-black/70" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Red</label>
                  <span className="text-sm">{customColor.r}</span>
                </div>
                <Slider
                  value={[customColor.r]}
                  min={0}
                  max={255}
                  step={1}
                  onValueChange={(values) => setCustomColor({ ...customColor, r: values[0] })}
                  className="bg-red-100"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Green</label>
                  <span className="text-sm">{customColor.g}</span>
                </div>
                <Slider
                  value={[customColor.g]}
                  min={0}
                  max={255}
                  step={1}
                  onValueChange={(values) => setCustomColor({ ...customColor, g: values[0] })}
                  className="bg-green-100"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Blue</label>
                  <span className="text-sm">{customColor.b}</span>
                </div>
                <Slider
                  value={[customColor.b]}
                  min={0}
                  max={255}
                  step={1}
                  onValueChange={(values) => setCustomColor({ ...customColor, b: values[0] })}
                  className="bg-blue-100"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div 
                  className="h-10 w-20 rounded-md border border-gray-200"
                  style={{ 
                    backgroundColor: `rgb(${customColor.r}, ${customColor.g}, ${customColor.b})` 
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedColor('custom')}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Apply Color
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Time: {formatTime(timeSpent)}
          </span>
          
          <Button
            onClick={breathingActive ? toggleBreathing : timeSpent >= 30 ? completeGame : toggleBreathing}
            variant={breathingActive ? "outline" : "default"}
          >
            {gameCompleted ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Completed
              </>
            ) : breathingActive ? (
              "Pause Breathing"
            ) : timeSpent >= 30 ? (
              "Complete Exercise"
            ) : (
              "Start Breathing"
            )}
          </Button>
        </div>
        
        {gameCompleted && (
          <div className="bg-wellness-green-light/20 p-4 rounded-lg text-center">
            <h3 className="font-medium text-wellness-green-dark mb-2">
              Great job!
            </h3>
            <p className="text-sm">
              You completed {formatTime(timeSpent)} of color relaxation. 
              This practice can help reduce stress and improve your mood.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        {breathingActive ? 
         "Breathe slowly and focus on the colors..." : 
         "Select colors that feel calming to you and focus on gentle breathing."}
      </CardFooter>
    </Card>
  );
}
