import { toast } from "@/hooks/use-toast";

const OPENAI_API_KEY = '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';

export const generateBlogPost = async (transcription: string) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{
          role: "system",
          content: "You are a creative blog writer. Create a descriptive blog post with emojis at the start of each paragraph based on the provided transcription."
        }, {
          role: "user",
          content: `Create a blog post from this transcription: ${transcription}`
        }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Blog generation error:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to generate blog post. Please try again."
    });
    throw error;
  }
};

export const generateSocialPost = async (transcription: string) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "You are a social media expert. Create a short, engaging social media post with relevant hashtags and emojis based on the provided transcription."
        }, {
          role: "user",
          content: `Create a social media post from this transcription: ${transcription}`
        }],
        temperature: 0.8,
        max_tokens: 280
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Social post generation error:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to generate social post. Please try again."
    });
    throw error;
  }
};

export const translateText = async (text: string, targetLanguage: string) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: `You are a professional translator. Translate the following text to ${targetLanguage}.`
        }, {
          role: "user",
          content: text
        }],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Translation error:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to translate text. Please try again."
    });
    throw error;
  }
};