import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download, Globe } from "lucide-react";
import { TranslationDropdown } from "./TranslationDropdown";
import { copyToClipboard, downloadTranscription } from "@/utils/transcriptionUtils";

interface TranscriptionResultProps {
  transcriptionResult: string;
  onTranslate: (language: string) => void;
}

export const TranscriptionResult = ({ transcriptionResult, onTranslate }: TranscriptionResultProps) => {
  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Transcription Result</span>
          <TranslationDropdown onLanguageSelect={onTranslate} />
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
        <Button onClick={() => onTranslate("en")} variant="outline">
          <Globe className="mr-2 h-4 w-4" />
          Translate
        </Button>
      </CardFooter>
    </Card>
  );
};