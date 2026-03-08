import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "@/hooks/use-toast";
import { appConfig, hasRequiredKeys } from "@/utils/appConfig";

const getModel = () => {
  if (!hasRequiredKeys.generation) {
    toast({
      variant: "destructive",
      title: "Missing Gemini API key",
      description: "Add VITE_GEMINI_API_KEY to your environment before generating content."
    });
    throw new Error("Missing Gemini API key");
  }

  const genAI = new GoogleGenerativeAI(appConfig.geminiApiKey);
  return genAI.getGenerativeModel({ model: "gemini-pro" });
};

const generateContent = async (prompt: string) => {
  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Generation error:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to generate content. Please try again."
    });
    throw error;
  }
};

export const generateBlogPost = async (transcription: string) => {
  const prompt = `Create a descriptive blog post with emojis at the start of each paragraph based on this transcription: ${transcription}`;
  return generateContent(prompt);
};

export const generateSocialPost = async (transcription: string) => {
  const prompt = `Create a short, engaging social media post with relevant hashtags and emojis based on this transcription: ${transcription}. Keep it under 280 characters.`;
  return generateContent(prompt);
};

export const translateText = async (text: string, targetLanguage: string) => {
  const languageNames = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
    ar: "Arabic",
    hi: "Hindi",
    bn: "Bengali",
    pa: "Punjabi",
    te: "Telugu",
    mr: "Marathi",
    tr: "Turkish",
    ta: "Tamil",
    vi: "Vietnamese",
    ur: "Urdu"
  };

  const languageName = languageNames[targetLanguage as keyof typeof languageNames] || targetLanguage;
  const prompt = `Translate the following text to ${languageName}. Maintain the original meaning and tone: ${text}`;
  return generateContent(prompt);
};