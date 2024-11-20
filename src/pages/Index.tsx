import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Copy, Download, Mic, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const API_KEY = 'ca95804f5de7464e9ea41d795ff27116';

const supportedFormats = [
  'audio/mpeg',      // .mp3
  'audio/wav',       // .wav
  'audio/x-wav',     // .wav alternative
  'audio/mp4',       // .m4a
  'audio/flac',      // .flac
  'audio/ogg',       // .ogg
  'audio/webm'       // .webm
];

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [transcriptionResult, setTranscriptionResult] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File) => {
    if (supportedFormats.includes(file.type)) {
      return true;
    }
    toast({
      variant: "destructive",
      title: "Invalid file format",
      description: "Please upload an audio file in MP3, WAV, M4A, FLAC, OGG, or WEBM format."
    });
    return false;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcriptionResult);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard"
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy text"
      });
    }
  };

  const downloadTranscription = () => {
    const blob = new Blob([transcriptionResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcription.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded!",
      description: "Your transcription has been downloaded"
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
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-200 rounded-lg p-8 text-center cursor-pointer
                         hover:border-purple-400 transition-colors duration-300"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".mp3,.wav,.m4a,.flac,.ogg,.webm"
                className="hidden"
              />
              <Upload className="mx-auto mb-4 text-purple-500" size={40} />
              <p className="text-purple-600 mb-2">{file ? file.name : "Click or drag file here"}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {supportedFormats.map(format => (
                  <Badge key={format} variant="secondary">
                    {format.split('/')[1]}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
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
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Start Transcription
                </>
              )}
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
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>Transcription Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-purple-50 p-4 rounded-lg max-h-[400px] overflow-y-auto">
                {transcriptionResult}
              </div>
            </CardContent>
            <CardFooter className="flex gap-4 flex-wrap">
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                Copy Text
              </Button>
              <Button onClick={downloadTranscription} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;