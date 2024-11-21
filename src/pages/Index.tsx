import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TranscriptionUploader } from "@/components/TranscriptionUploader";
import { AnimatedFooter } from "@/components/AnimatedFooter";
import { TranscriptionResult } from "@/components/TranscriptionResult";
import { generateBlogPost, generateSocialPost } from "@/utils/openaiUtils";
import { useNavigate } from "react-router-dom";

const API_KEY = 'ca95804f5de7464e9ea41d795ff27116';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [transcriptionResult, setTranscriptionResult] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const transcribeAudio = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an audio file first."
      });
      return;
    }

    try {
      setIsTranscribing(true);
      setProgress(10);
      setStatus("Uploading audio file...");

      const formData = new FormData();
      formData.append('audio', file);

      const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
        method: 'POST',
        headers: {
          'authorization': API_KEY
        },
        body: formData
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload the audio file.');

      const uploadData = await uploadResponse.json();
      setProgress(40);
      setStatus("Audio file uploaded. Starting transcription...");

      const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
          'authorization': API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ audio_url: uploadData.upload_url })
      });

      if (!transcriptResponse.ok) throw new Error('Failed to create the transcription request.');

      const transcriptData = await transcriptResponse.json();
      setProgress(60);
      setStatus("Transcription in progress...");

      let transcriptionStatus = 'queued';
      while (transcriptionStatus !== 'completed' && transcriptionStatus !== 'error') {
        await new Promise(r => setTimeout(r, 3000));
        const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptData.id}`, {
          headers: { 'authorization': API_KEY }
        });

        if (!statusResponse.ok) throw new Error('Failed to check transcription status.');

        const statusData = await statusResponse.json();
        transcriptionStatus = statusData.status;

        if (transcriptionStatus === 'completed') {
          setProgress(100);
          setStatus("Transcription completed!");
          setTranscriptionResult(statusData.text);
          toast({
            title: "Success!",
            description: "Your audio has been successfully transcribed."
          });
        } else if (transcriptionStatus === 'error') {
          throw new Error('Transcription failed.');
        } else {
          setProgress(transcriptionStatus === 'processing' ? 70 : 50);
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred"
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
        description: "Please transcribe your audio first"
      });
      return;
    }

    try {
      const blogPost = await generateBlogPost(transcriptionResult);
      navigate("/posts", { state: { type: "blog", content: blogPost } });
    } catch (error) {
      // Error already handled in generateBlogPost
    }
  };

  const handleSocialPost = async () => {
    if (!transcriptionResult) {
      toast({
        variant: "destructive",
        title: "No transcription",
        description: "Please transcribe your audio first"
      });
      return;
    }

    try {
      const socialPost = await generateSocialPost(transcriptionResult);
      navigate("/posts", { state: { type: "social", content: socialPost } });
    } catch (error) {
      // Error already handled in generateSocialPost
    }
  };

  const handleTranslation = async (language: string) => {
    if (!transcriptionResult) {
      toast({
        variant: "destructive",
        title: "No transcription",
        description: "Please transcribe your audio first"
      });
      return;
    }

    toast({
      title: "Coming soon",
      description: "Translation will be available soon"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-purple-900 mb-4">EchoCraft</h1>
          <p className="text-lg text-purple-600">Transform your audio into text with precision and style</p>
        </div>

        <Card className="mb-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Upload Audio</CardTitle>
            <CardDescription>Drag and drop your audio file or click to select</CardDescription>
          </CardHeader>
          <CardContent>
            <TranscriptionUploader onFileSelect={handleFileSelect} />
          </CardContent>
          <CardFooter className="flex gap-4 flex-wrap justify-center">
            <Button
              onClick={transcribeAudio}
              disabled={!file || isTranscribing}
              className="w-full sm:w-auto"
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
              className="w-full sm:w-auto"
              disabled={!transcriptionResult}
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Blog
            </Button>
            <Button
              onClick={handleSocialPost}
              variant="outline"
              className="w-full sm:w-auto"
              disabled={!transcriptionResult}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Create Social Post
            </Button>
          </CardFooter>
        </Card>

        {isTranscribing && (
          <Card className="mb-8 animate-fade-in">
            <CardContent className="pt-6">
              <Progress value={progress} className="mb-2" />
              <p className="text-center text-sm text-purple-600">{status}</p>
            </CardContent>
          </Card>
        )}

        {transcriptionResult && (
          <TranscriptionResult 
            transcriptionResult={transcriptionResult}
            onTranslate={handleTranslation}
          />
        )}
      </div>
      <AnimatedFooter />
    </div>
  );
};

export default Index;
