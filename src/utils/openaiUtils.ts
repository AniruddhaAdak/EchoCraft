import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from "@/hooks/use-toast";

const genAI = new GoogleGenerativeAI("AIzaSyAtE_9KV7A62idrl5mn2FCqD93IN0f5WNE");

const generateContent = async (prompt: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
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
  const prompt = `Translate the following text to ${targetLanguage}: ${text}`;
  return generateContent(prompt);
};