import { aiApi } from "@/lib/api";

interface VoiceAnalysisResult {
  mood: string;
  score: number;
  energy: number;
  sentimentScore: number;
  emotional_state: string;
  detected_emotions: string[];
  transcribed_text: string;
  user_id: string;
  game_recommendations?: any[];
}

interface TextAnalysisResult {
  mood: string;
  score: number;
  energy: number;
  sentimentScore: number;
  emotional_state: string;
  detected_emotions: string[];
  user_id: string;
}

interface RecommendationResult {
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    link?: string;
    mood: string;
  }>;
  user_id: string;
}

interface SummaryResult {
  insights: string;
  recommendations: string;
  user_id: string;
}

export const aiService = {
  /**
   * Analyze voice recording
   */
  analyzeVoice: async (audioBlob: Blob): Promise<VoiceAnalysisResult> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice_recording.webm');
    
    const response = await aiApi.post('/analyze-voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  /**
   * Analyze text to detect mood and emotions
   */
  analyzeText: async (text: string): Promise<TextAnalysisResult> => {
    const response = await aiApi.post('/analyze-text', { text });
    return response.data;
  },
  
  /**
   * Generate personalized recommendations based on mood
   */
  generateRecommendations: async (mood: string, energyLevel: number, detectedEmotions: string[] = []): Promise<RecommendationResult> => {
    const response = await aiApi.post('/generate-recommendations', {
      mood,
      energyLevel,
      detectedEmotions,
    });
    
    return response.data;
  },
  
  /**
   * Generate weekly summary based on check-in data
   */
  generateSummary: async (checkIns: any[]): Promise<SummaryResult> => {
    const response = await aiApi.post('/generate-summary', {
      checkIns,
    });
    
    return response.data;
  },
  
  /**
   * Generate and download PDF report
   */
  generatePdfReport: async (checkIns: any[]): Promise<Blob> => {
    const response = await aiApi.post('/generate-pdf-report', {
      checkIns,
    }, {
      responseType: 'blob'
    });
    
    return response.data;
  },
  
  /**
   * Get AI service statistics
   */
  getStats: async (): Promise<any> => {
    const response = await aiApi.get('/stats');
    return response.data;
  },
  
  /**
   * Health check
   */
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await aiApi.get('/health');
    return response.data;
  }
};