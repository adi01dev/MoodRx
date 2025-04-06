import { useState, useEffect, useRef } from "react";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Save, Check } from "lucide-react";

interface ColorRelaxGameProps {
  onComplete: () => void;
}

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
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_PALETTES[0].colors[0]);
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

  useEffect(() => {
    const resizeCanvas = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const container = canvas.parentElement;
      if (!container) return;

      canvas.width = container.clientWidth;
      canvas.height = 300;
      drawBackground();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    drawBackground();
  }, [selectedColor, customColor, fadeInOut]);

  useEffect(() => {
    if (breathingActive) {
      startBreathingAnimation();
      timerRef.current = window.setInterval(() => {
        setTimeSpent((prev) => {
          if (prev >= 60 && !gameCompleted) {
            completeGame();
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [breathingActive]);

  useEffect(() => {
    setSelectedColor(selectedPalette.colors[0]);
  }, [selectedPalette]);

  const drawBackground = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const gradient = ctx.createLinearGradient(0, 0, w, h);
    const baseColor =
      selectedColor === "custom"
        ? `rgb(${customColor.r}, ${customColor.g}, ${customColor.b})`
        : selectedColor;
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(1, lightenColor(baseColor, 30));

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    if (breathingActive) drawBreathingCircles(ctx, w, h);
  };

  const drawBreathingCircles = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number
  ) => {
    const centerX = w / 2;
    const centerY = h / 2;
    const maxRadius = Math.min(w, h) * 0.4;

    for (let i = 3; i >= 0; i--) {
      const radius = maxRadius * (0.5 + i * 0.15) * (0.8 + fadeInOut * 0.2);
      const opacity = Math.max(0, 0.5 - i * 0.1 - fadeInOut * 0.2);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

      const color =
        selectedColor === "custom"
          ? customColor
          : hexToRgb(selectedColor) || { r: 0, g: 0, b: 0 };

      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
      ctx.fill();
    }
  };

  const startBreathingAnimation = () => {
    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      let newFade = fadeInOut + fadeDirectionRef.current * 0.0005 * delta;

      if (newFade > 1) {
        fadeDirectionRef.current = -1;
        newFade = 1;
      } else if (newFade < 0) {
        fadeDirectionRef.current = 1;
        newFade = 0;
      }

      setFadeInOut(newFade);
      drawBackground();

      if (breathingActive) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const completeGame = () => {
    setBreathingActive(false);
    setGameCompleted(true);
    onComplete();
  };

  const lightenColor = (color: string, percent: number) => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    return `rgb(${Math.min(255, rgb.r + percent)}, ${Math.min(255, rgb.g + percent)}, ${Math.min(255, rgb.b + percent)})`;
  };

  const hexToRgb = (hex: string) => {
    if (hex.startsWith("rgb")) {
      const [r, g, b] = hex.match(/\d+/g)!.map(Number);
      return { r, g, b };
    }
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const formatTime = (sec: number) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Color Relaxation</CardTitle>
        <CardDescription>
          Focus on calming colors and breathing patterns to reduce stress and anxiety.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-hidden rounded-lg">
          <canvas ref={canvasRef} className="w-full h-[300px]" />
        </div>

        <Tabs defaultValue="palette">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="palette">Color Palettes</TabsTrigger>
            <TabsTrigger value="custom">Custom Color</TabsTrigger>
          </TabsList>

          <TabsContent value="palette">
            <div className="grid grid-cols-2 gap-3">
              {COLOR_PALETTES.map((palette) => (
                <Button
                  key={palette.name}
                  variant="outline"
                  className={`h-auto py-2 ${selectedPalette.name === palette.name ? "border-primary" : ""}`}
                  onClick={() => setSelectedPalette(palette)}
                >
                  <div className="w-full text-left">
                    <div className="mb-1 font-medium">{palette.name}</div>
                    <div className="flex gap-1">
                      {palette.colors.map((color, i) => (
                        <div
                          key={i}
                          className="h-4 w-4 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="text-sm font-medium">Select Color</h3>
              <div className="flex flex-wrap gap-2">
                {selectedPalette.colors.map((color, i) => (
                  <button
                    key={i}
                    className={`h-8 w-8 rounded-full border-2 ${selectedColor === color ? "border-black/70" : "border-transparent"}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <div className="space-y-4">
              {["r", "g", "b"].map((ch) => (
                <div className="space-y-2" key={ch}>
                  <div className="flex justify-between text-sm font-medium">
                    <label className="capitalize">{ch === "r" ? "Red" : ch === "g" ? "Green" : "Blue"}</label>
                    <span>{customColor[ch as keyof typeof customColor]}</span>
                  </div>
                  <Slider
                    value={[customColor[ch as keyof typeof customColor]]}
                    min={0}
                    max={255}
                    step={1}
                    onValueChange={(values) =>
                      setCustomColor({ ...customColor, [ch]: values[0] })
                    }
                  />
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <div
                  className="h-10 w-20 rounded-md border"
                  style={{
                    backgroundColor: `rgb(${customColor.r}, ${customColor.g}, ${customColor.b})`,
                  }}
                />
                <Button variant="outline" size="sm" onClick={() => setSelectedColor("custom")}>
                  <Save className="h-4 w-4 mr-1" />
                  Apply Color
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Time: {formatTime(timeSpent)}</span>
          <Button
            onClick={breathingActive ? () => setBreathingActive(false) : timeSpent >= 30 ? completeGame : () => setBreathingActive(true)}
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
          <div className="bg-green-100 p-4 rounded-lg text-center">
            <h3 className="font-medium text-green-800 mb-2">Great job!</h3>
            <p className="text-sm">
              You completed {formatTime(timeSpent)} of color relaxation. This practice helps reduce stress and improve your mood.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground text-center">
        {breathingActive ? "Breathe slowly and focus on the colors..." : "Select calming colors and begin your relaxation."}
      </CardFooter>
    </Card>
  );
}
