import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Loader2,
  MessageSquare,
  Mic2,
  ShieldAlert,
  Sparkles,
  Wand2,
} from "lucide-react";

import { AnimatedFooter } from "@/components/AnimatedFooter";
import { SessionHistory } from "@/components/SessionHistory";
import { TranscriptionResult } from "@/components/TranscriptionResult";
import { TranscriptionUploader } from "@/components/TranscriptionUploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { appConfig, missingConfig } from "@/utils/appConfig";
import { loadHistoryEntries, prependHistoryEntry, type HistoryEntry } from "@/utils/historyUtils";
import { generateBlogPost, generateSocialPost } from "@/utils/openaiUtils";
import { copyToClipboard } from "@/utils/transcriptionUtils";

const workflowSteps = [
  {
    title: "Capture or upload",
    description: "Bring in voice notes, meetings, interviews, or podcasts from any supported audio format.",
  },
  {
    title: "Transcribe and translate",
    description: "Turn raw audio into readable text, then translate it without losing momentum.",
  },
  {
    title: "Publish faster",
    description: "Generate blog and social drafts, preview them, and send only the good ones to a post workspace.",
  },
];

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [transcriptionResult, setTranscriptionResult] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const [translationLanguage, setTranslationLanguage] = useState("");
  const [generatedBlog, setGeneratedBlog] = useState("");
  const [generatedSocial, setGeneratedSocial] = useState("");
  const [generationTarget, setGenerationTarget] = useState<"blog" | "social" | null>(null);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setHistoryEntries(loadHistoryEntries());
  }, []);

  const resetDerivedOutputs = () => {
    setTranslatedText("");
    setTranslationLanguage("");
    setGeneratedBlog("");
    setGeneratedSocial("");
    setGenerationTarget(null);
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleClearSelection = () => {
    setFile(null);
  };

  const handleLoadHistoryEntry = (entry: HistoryEntry) => {
    setTranscriptionResult(entry.transcript);
    resetDerivedOutputs();
    toast({
      title: "Session restored",
      description: `Loaded transcript from ${entry.fileName}`,
    });
  };

  const transcribeAudio = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an audio file first.",
      });
      return;
    }

    if (!appConfig.assemblyAiApiKey) {
      toast({
        variant: "destructive",
        title: "Missing AssemblyAI key",
        description: "Add VITE_ASSEMBLYAI_API_KEY to your .env file before transcribing.",
      });
      return;
    }

    try {
      setIsTranscribing(true);
      resetDerivedOutputs();
      setProgress(10);
      setStatus("Uploading audio file...");

      const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: {
          authorization: appConfig.assemblyAiApiKey,
          "content-type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload the audio file.");
      }

      const uploadData = await uploadResponse.json();
      setProgress(40);
      setStatus("Audio file uploaded. Starting transcription...");

      const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: {
          authorization: appConfig.assemblyAiApiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({ audio_url: uploadData.upload_url }),
      });

      if (!transcriptResponse.ok) {
        throw new Error("Failed to create the transcription request.");
      }

      const transcriptData = await transcriptResponse.json();
      setProgress(60);
      setStatus("Transcription in progress...");

      let transcriptionStatus = "queued";
      while (transcriptionStatus !== "completed" && transcriptionStatus !== "error") {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const statusResponse = await fetch(
          `https://api.assemblyai.com/v2/transcript/${transcriptData.id}`,
          {
            headers: { authorization: appConfig.assemblyAiApiKey },
          }
        );

        if (!statusResponse.ok) {
          throw new Error("Failed to check transcription status.");
        }

        const statusData = await statusResponse.json();
        transcriptionStatus = statusData.status;

        if (transcriptionStatus === "completed") {
          setProgress(100);
          setStatus("Transcription completed!");
          setTranscriptionResult(statusData.text);

          const nextHistory = prependHistoryEntry(
            {
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              fileName: file.name,
              transcript: statusData.text,
            },
            historyEntries
          );

          setHistoryEntries(nextHistory);
          toast({
            title: "Success!",
            description: "Your audio has been successfully transcribed.",
          });
        } else if (transcriptionStatus === "error") {
          throw new Error("Transcription failed.");
        } else {
          setProgress(transcriptionStatus === "processing" ? 70 : 50);
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleBlogPost = async () => {
    if (!transcriptionResult) {
      toast({
        variant: "destructive",
        title: "No transcription",
        description: "Please transcribe your audio first",
      });
      return;
    }

    try {
      setGenerationTarget("blog");
      const blogPost = await generateBlogPost(transcriptionResult);
      setGeneratedBlog(blogPost);
      toast({
        title: "Blog draft ready",
        description: "Review it below or open it in the post workspace.",
      });
    } finally {
      setGenerationTarget(null);
    }
  };

  const handleSocialPost = async () => {
    if (!transcriptionResult) {
      toast({
        variant: "destructive",
        title: "No transcription",
        description: "Please transcribe your audio first",
      });
      return;
    }

    try {
      setGenerationTarget("social");
      const socialPost = await generateSocialPost(transcriptionResult);
      setGeneratedSocial(socialPost);
      toast({
        title: "Social post ready",
        description: "Review it below or open it in the post workspace.",
      });
    } finally {
      setGenerationTarget(null);
    }
  };

  const handleTranslation = (nextTranslatedText: string, language: string) => {
    setTranslatedText(nextTranslatedText);
    setTranslationLanguage(language);
  };

  const openGeneratedContent = (type: "blog" | "social") => {
    const content = type === "blog" ? generatedBlog : generatedSocial;
    navigate("/posts", { state: { type, content } });
  };

  return (
    <div className="mesh-background min-h-screen bg-gradient-to-b from-fuchsia-50 via-white to-sky-50">
      <div className="relative container mx-auto max-w-6xl px-4 py-8">
        <div className="absolute left-0 top-16 h-40 w-40 rounded-full bg-fuchsia-200/40 blur-3xl animate-float" />
        <div className="absolute right-4 top-28 h-56 w-56 rounded-full bg-sky-200/40 blur-3xl animate-float" />

        <section className="relative mb-10 grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div className="animate-fade-in">
            <div className="mb-5 flex flex-wrap gap-3">
              <Badge className="rounded-full bg-fuchsia-100 px-4 py-1 text-fuchsia-700 hover:bg-fuchsia-100">
                AI transcription studio
              </Badge>
              <Badge className="rounded-full bg-sky-100 px-4 py-1 text-sky-700 hover:bg-sky-100">
                Blog + social workflow
              </Badge>
            </div>
            <h1 className="mb-4 max-w-3xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Turn every voice note into a publishable content pipeline.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              EchoCraft captures audio, builds polished transcripts, translates them, and spins them into content drafts without forcing you across multiple tools.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                onClick={transcribeAudio}
                disabled={!file || isTranscribing || missingConfig.assemblyAi}
                className="rounded-full px-6"
              >
                {isTranscribing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mic2 className="mr-2 h-4 w-4" />
                )}
                {isTranscribing ? "Transcribing" : "Start with audio"}
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-6"
                onClick={() => document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            <Card className="animate-pulse-glow border-white/70 bg-white/85 shadow-xl backdrop-blur">
              <CardHeader>
                <CardDescription>What improved in this pass</CardDescription>
                <CardTitle className="text-2xl text-slate-950">More product, less demo</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-fuchsia-50 p-4">Secure env-based API setup</div>
                <div className="rounded-2xl bg-sky-50 p-4">Recent session recall</div>
                <div className="rounded-2xl bg-amber-50 p-4">Inline generation and translation workspace</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {(missingConfig.assemblyAi || missingConfig.gemini) && (
          <Card className="mb-8 border-amber-200 bg-amber-50/90 shadow-lg">
            <CardContent className="flex flex-col gap-2 p-5 text-sm text-amber-900 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Environment setup needed</p>
                  <p>
                    {missingConfig.assemblyAi && "Add VITE_ASSEMBLYAI_API_KEY. "}
                    {missingConfig.gemini && "Add VITE_GEMINI_API_KEY for blog, social, and translation features."}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => copyToClipboard("VITE_ASSEMBLYAI_API_KEY=\nVITE_GEMINI_API_KEY=")}>Copy env template</Button>
            </CardContent>
          </Card>
        )}

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          {workflowSteps.map((step, index) => (
            <Card key={step.title} className="border-white/60 bg-white/80 shadow-md backdrop-blur">
              <CardHeader>
                <CardDescription>Step {index + 1}</CardDescription>
                <CardTitle className="text-xl text-slate-900">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-slate-600">{step.description}</CardContent>
            </Card>
          ))}
        </section>

        <section id="workspace" className="grid gap-8 lg:grid-cols-[1.35fr_0.8fr]">
          <div>
            <Card className="mb-8 border-white/60 bg-white/85 shadow-xl backdrop-blur transition-shadow duration-300 hover:shadow-2xl">
              <CardHeader>
                <CardTitle>Upload Audio</CardTitle>
                <CardDescription>Drag, drop, record, and keep your transcription workflow in one place.</CardDescription>
              </CardHeader>
              <CardContent>
                <TranscriptionUploader
                  selectedFile={file}
                  onFileSelect={handleFileSelect}
                  onClearSelection={handleClearSelection}
                />
              </CardContent>
              <CardFooter className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={transcribeAudio}
                  disabled={!file || isTranscribing || missingConfig.assemblyAi}
                  className="w-full rounded-full sm:w-auto"
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Transcribing...
                    </>
                  ) : (
                    "Start Transcription"
                  )}
                </Button>
                <Button
                  onClick={handleBlogPost}
                  variant="outline"
                  className="w-full rounded-full sm:w-auto"
                  disabled={!transcriptionResult || generationTarget !== null || missingConfig.gemini}
                >
                  {generationTarget === "blog" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  Generate Blog
                </Button>
                <Button
                  onClick={handleSocialPost}
                  variant="outline"
                  className="w-full rounded-full sm:w-auto"
                  disabled={!transcriptionResult || generationTarget !== null || missingConfig.gemini}
                >
                  {generationTarget === "social" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="mr-2 h-4 w-4" />
                  )}
                  Create Social Post
                </Button>
              </CardFooter>
            </Card>

            {isTranscribing && (
              <Card className="mb-8 animate-fade-in border-white/60 bg-white/80 shadow-lg backdrop-blur">
                <CardContent className="pt-6">
                  <Progress value={progress} className="mb-2" />
                  <p className="text-center text-sm text-fuchsia-700">{status}</p>
                </CardContent>
              </Card>
            )}

            {transcriptionResult && (
              <div className="space-y-8">
                <TranscriptionResult
                  transcriptionResult={transcriptionResult}
                  translatedResult={translatedText}
                  translationLanguage={translationLanguage}
                  onTranslate={handleTranslation}
                />

                <Card className="border-white/60 bg-white/85 shadow-xl backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl text-slate-950">
                      <Wand2 className="h-5 w-5 text-fuchsia-600" />
                      Generated Content Studio
                    </CardTitle>
                    <CardDescription>
                      Keep working here, then open a full post workspace when something is worth refining.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue={generatedBlog ? "blog" : generatedSocial ? "social" : "blog"}>
                      <TabsList className="mb-4 grid w-full max-w-md grid-cols-2 rounded-full bg-slate-100">
                        <TabsTrigger value="blog" className="rounded-full">Blog draft</TabsTrigger>
                        <TabsTrigger value="social" className="rounded-full">Social post</TabsTrigger>
                      </TabsList>
                      <TabsContent value="blog">
                        {generatedBlog ? (
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <p className="mb-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{generatedBlog}</p>
                            <div className="flex flex-wrap gap-3">
                              <Button onClick={() => openGeneratedContent("blog")}>Open Blog Workspace</Button>
                              <Button variant="outline" onClick={() => copyToClipboard(generatedBlog)}>Copy Blog Draft</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                            Generate a blog draft after transcription to preview it here.
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="social">
                        {generatedSocial ? (
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                            <p className="mb-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{generatedSocial}</p>
                            <div className="flex flex-wrap gap-3">
                              <Button onClick={() => openGeneratedContent("social")}>Open Social Workspace</Button>
                              <Button variant="outline" onClick={() => copyToClipboard(generatedSocial)}>Copy Social Post</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                            Generate a social post after transcription to preview it here.
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <SessionHistory entries={historyEntries} onLoadEntry={handleLoadHistoryEntry} />

            <Card className="border-white/60 bg-white/80 shadow-lg backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                  <Sparkles className="h-5 w-5 text-fuchsia-600" />
                  Creator shortcuts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-fuchsia-50 p-4">Use voice recording when you want fast idea capture without leaving the page.</div>
                <div className="rounded-2xl bg-sky-50 p-4">Save transcripts as reusable raw material before generating polished content.</div>
                <div className="rounded-2xl bg-amber-50 p-4">Translate before generating social copy when you want region-specific messaging.</div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      <AnimatedFooter />
    </div>
  );
};

export default Index;