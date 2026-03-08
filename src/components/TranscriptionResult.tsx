import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, FileJson, Globe, Languages, Sigma, Timer } from "lucide-react";
import { TranslationDropdown } from "./TranslationDropdown";
import { copyToClipboard, downloadJsonFile, downloadTranscription } from "@/utils/transcriptionUtils";
import { translateText } from "@/utils/openaiUtils";
import { useToast } from "@/hooks/use-toast";
import { translationLanguages } from "@/utils/languages";

interface TranscriptionResultProps {
  transcriptionResult: string;
  translatedResult?: string;
  translationLanguage?: string;
  onTranslate: (translatedText: string, language: string) => void;
}

export const TranscriptionResult = ({
  transcriptionResult,
  translatedResult,
  translationLanguage,
  onTranslate,
}: TranscriptionResultProps) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const stats = useMemo(() => {
    const words = transcriptionResult.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const characterCount = transcriptionResult.length;
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

    return { wordCount, characterCount, readingMinutes };
  }, [transcriptionResult]);

  const handleTranslate = async (language: string) => {
    try {
      setIsTranslating(true);
      const translatedText = await translateText(transcriptionResult, language);
      onTranslate(translatedText, language);
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

  const activeLanguage = translationLanguages.find((language) => language.code === translationLanguage)?.name;

  return (
    <Card className="animate-scale-in border-white/60 bg-white/85 shadow-xl backdrop-blur">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-2xl text-slate-950">Transcript Workspace</CardTitle>
          <TranslationDropdown onLanguageSelect={handleTranslate} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-fuchsia-700">
              <Sigma className="h-4 w-4" />
              Word count
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.wordCount}</p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-sky-700">
              <Languages className="h-4 w-4" />
              Characters
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.characterCount}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-700">
              <Timer className="h-4 w-4" />
              Read time
            </div>
            <p className="text-2xl font-bold text-slate-900">~{stats.readingMinutes} min</p>
          </div>
        </div>

        <Tabs defaultValue={translatedResult ? "translated" : "original"}>
          <TabsList className="mb-4 grid w-full max-w-md grid-cols-2 rounded-full bg-slate-100">
            <TabsTrigger value="original" className="rounded-full">Original</TabsTrigger>
            <TabsTrigger value="translated" className="rounded-full" disabled={!translatedResult}>
              Translated
            </TabsTrigger>
          </TabsList>
          <TabsContent value="original">
            <div className="max-h-[400px] overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
              {transcriptionResult}
            </div>
          </TabsContent>
          <TabsContent value="translated">
            <div className="rounded-3xl border border-fuchsia-100 bg-fuchsia-50/70 p-5">
              <p className="mb-3 text-sm font-medium text-fuchsia-700">
                {activeLanguage ? `Translated to ${activeLanguage}` : "Translated transcript"}
              </p>
              <div className="max-h-[340px] overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {translatedResult || "Generate a translation to unlock this tab."}
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
          onClick={() => downloadJsonFile("transcription.json", {
            transcript: transcriptionResult,
            translatedResult,
            translationLanguage,
            exportedAt: new Date().toISOString(),
          })}
          variant="outline"
        >
          <FileJson className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
        <Button 
          onClick={() => handleTranslate("en")} 
          variant="outline" 
          disabled={isTranslating}
        >
          <Globe className="mr-2 h-4 w-4" />
          {isTranslating ? "Translating..." : "Translate"}
        </Button>
        {translatedResult && (
          <Button onClick={() => copyToClipboard(translatedResult)} variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Copy Translation
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};