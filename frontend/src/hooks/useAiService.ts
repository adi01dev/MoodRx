import { useState } from "react";
import { aiService } from "@/services/aiService";
import { useToast } from "@/components/ui/use-toast";

export function useAiService() {
  const [isAnalyzingVoice, setIsAnalyzingVoice] = useState(false);
  const [isAnalyzingText, setIsAnalyzingText] = useState(false);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const { toast } = useToast();
  
  const analyzeVoice = async (audioBlob: Blob) => {
    setIsAnalyzingVoice(true);
    try {
      const result = await aiService.analyzeVoice(audioBlob);
      return result;
    } catch (error) {
      console.error("Error analyzing voice:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze your voice recording. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsAnalyzingVoice(false);
    }
  };
  
  const analyzeText = async (text: string) => {
    setIsAnalyzingText(true);
    try {
      const result = await aiService.analyzeText(text);
      return result;
    } catch (error) {
      console.error("Error analyzing text:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze your text. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsAnalyzingText(false);
    }
  };
  
  const generateRecommendations = async (mood: string, energyLevel: number, detectedEmotions: string[] = []) => {
    setIsGeneratingRecommendations(true);
    try {
      const result = await aiService.generateRecommendations(mood, energyLevel, detectedEmotions);
      return result;
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Recommendations Failed",
        description: "Could not generate recommendations. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };
  
  const generateSummary = async (checkIns: any[]) => {
    setIsGeneratingSummary(true);
    try {
      const result = await aiService.generateSummary(checkIns);
      return result;
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Summary Failed",
        description: "Could not generate your weekly summary. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGeneratingSummary(false);
    }
  };
  
  const generatePdfReport = async (checkIns: any[]) => {
    setIsGeneratingPdf(true);
    try {
      const pdfBlob = await aiService.generatePdfReport(checkIns);
      
      // Create a download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'mood_summary.pdf');
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Generated",
        description: "Your mood summary PDF has been downloaded.",
      });
      
      return true;
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "PDF Generation Failed",
        description: "Could not generate your PDF report. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  
  return {
    analyzeVoice,
    analyzeText,
    generateRecommendations,
    generateSummary,
    generatePdfReport,
    isAnalyzingVoice,
    isAnalyzingText,
    isGeneratingRecommendations,
    isGeneratingSummary,
    isGeneratingPdf,
  };
}
