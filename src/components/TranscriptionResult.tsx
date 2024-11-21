import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download, Globe } from "lucide-react";
import { TranslationDropdown } from "./TranslationDropdown";
import { copyToClipboard, downloadTranscription } from "@/utils/transcriptionUtils";
import { translateText } from "@/utils/openaiUtils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TranscriptionResultProps {
  transcriptionResult: string;
  onTranslate: (language: string) => void;
}

export const TranscriptionResult = ({ transcriptionResult, onTranslate }: TranscriptionResultProps) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async (language: string) => {
    try {
      setIsTranslating(true);
      const translatedText = await translateText(transcriptionResult, language);
      onTranslate(translatedText);
      toast({
        title: "Translation complete",
        description: "Your text has been translated successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Translation failed",
        description: "Please try again later"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Transcription Result</span>
          <TranslationDropdown onLanguageSelect={handleTranslate} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-purple-50 p-4 rounded-lg max-h-[400px] overflow-y-auto">
          {transcriptionResult}
        </div>
      </CardContent>
      <CardFooter className="flex gap-4 flex-wrap">
        <Button onClick={() => copyToClipboard(transcriptionResult)} variant="outline">
          <Copy className="mr-2 h-4 w-4" />
          Copy Text
        </Button>
        <Button onClick={() => downloadTranscription(transcriptionResult)} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button 
          onClick={() => handleTranslate("en")} 
          variant="outline" 
          disabled={isTranslating}
        >
          <Globe className="mr-2 h-4 w-4" />
          {isTranslating ? "Translating..." : "Translate"}
        </Button>
      </CardFooter>
    </Card>
  );
};