
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { Download, Loader2, Calendar } from "lucide-react";

interface Summary {
  id: string;
  date: string;
  available: boolean;
  url?: string;
}

export function WeeklySummary() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/summaries');
      setSummaries(response.data);
    } catch (error) {
      console.error('Error fetching summaries:', error);
      toast({
        title: "Error",
        description: "Could not load weekly summaries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    try {
      setGenerating(true);
      const response = await api.post('/summaries/generate');
      
      // Add the new summary to the list
      setSummaries([response.data, ...summaries]);
      
      toast({
        title: "Summary Generated",
        description: "Your weekly wellness summary is ready to download.",
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate your weekly summary. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadSummary = (url: string, date: string) => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Create a hidden link element
    const link = document.createElement('a');
    link.href = url;
    link.download = `MoodBloom_Summary_${formattedDate}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Weekly Wellness Summaries
        </CardTitle>
        <CardDescription>
          Track your progress with downloadable PDF summaries
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-wellness-green" />
          </div>
        ) : (
          <>
            {summaries.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>No summaries available yet.</p>
                <p className="text-sm mt-1">
                  Complete at least 3 days of check-ins to generate your first summary.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {summaries.map((summary) => (
                  <div key={summary.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="font-medium">
                        {new Date(summary.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        Weekly wellness summary
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadSummary(summary.url!, summary.date)}
                      disabled={!summary.available || !summary.url}
                      className="flex items-center"
                    >
                      {summary.available ? (
                        <>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </>
                      ) : (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Processing
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-wellness-green hover:bg-wellness-green-dark text-white"
          onClick={generateSummary}
          disabled={generating || loading}
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Summary...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generate New Summary
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
