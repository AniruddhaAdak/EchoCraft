import { toast } from "@/components/ui/use-toast";

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
          content: "You are a creative blog writer. Create a descriptive blog post with emojis at the start of each line based on the provided transcription."
        }, {
          role: "user",
          content: `Create a blog post from this transcription: ${transcription}`
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate blog post');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to generate blog post"
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
          content: "You are a social media expert. Create a short, engaging social media post with emojis based on the provided transcription."
        }, {
          role: "user",
          content: `Create a social media post from this transcription: ${transcription}`
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate social post');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to generate social post"
    });
    throw error;
  }
};