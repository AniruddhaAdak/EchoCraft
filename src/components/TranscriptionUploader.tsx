import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Mic, FileAudio, X, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const supportedFormats = [
  'audio/mpeg',      // .mp3
  'audio/wav',       // .wav
  'audio/x-wav',     // .wav alternative
  'audio/mp4',       // .m4a
  'audio/flac',      // .flac
  'audio/ogg',       // .ogg
  'audio/webm',      // .webm
  'video/mp4',       // video support
  'video/webm',
  'video/ogg'
];

interface TranscriptionUploaderProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onClearSelection: () => void;
}

export const TranscriptionUploader = ({ selectedFile, onFileSelect, onClearSelection }: TranscriptionUploaderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const validateFile = (file?: File) => {
    if (!file) {
      return false;
    }

    if (supportedFormats.includes(file.type)) {
      return true;
    }
    toast({
      variant: "destructive",
      title: "Invalid file format",
      description: "Please upload a supported audio or video file."
    });
    return false;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      onFileSelect(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      onFileSelect(selectedFile);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false 
      });
      
      const options = {
        mimeType: 'audio/webm;codecs=opus'
      };
      
      const mediaRecorder = new MediaRecorder(stream, options);
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const recordedFile = new File([blob], "recorded-audio.webm", { type: 'audio/webm' });
        onFileSelect(recordedFile);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Click the mic button again to stop recording"
      });
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        variant: "destructive",
        title: "Recording failed",
        description: "Please make sure you have a microphone connected and have granted permission"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Your recording is ready for transcription"
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          isDragActive
            ? "border-fuchsia-500 bg-fuchsia-50 shadow-lg"
            : "border-fuchsia-200 bg-white/80 hover:border-fuchsia-400"
        } cursor-pointer`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".mp3,.wav,.m4a,.flac,.ogg,.webm,.mp4"
          className="hidden"
        />
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-fuchsia-100 text-fuchsia-600 shadow-inner">
          <Upload size={32} />
        </div>
        <p className="mb-2 text-lg font-semibold text-slate-900">
          {selectedFile ? selectedFile.name : "Drop audio here or browse your device"}
        </p>
        <p className="mb-4 text-sm text-slate-600">
          Upload a recording or capture one live. EchoCraft turns it into a transcript, blog draft, and social copy.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {supportedFormats.map(format => (
            <Badge key={format} variant="secondary" className="bg-fuchsia-50 text-fuchsia-700">
              {format.split('/')[1]}
            </Badge>
          ))}
        </div>
      </div>
      {selectedFile && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-fuchsia-100 p-2 text-fuchsia-700">
              <FileAudio className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || "Unknown format"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              onClearSelection();
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      )}
      <div className="mt-4 flex justify-center">
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            toggleRecording();
          }}
          variant={isRecording ? "destructive" : "outline"}
          className="flex items-center gap-2 rounded-full border-fuchsia-200 bg-white/80 px-6"
        >
          <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
          {isRecording ? "Stop Recording" : "Record Audio"}
        </Button>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Sparkles className="h-3.5 w-3.5 text-fuchsia-500" />
        Voice capture works best in a quiet environment with a close microphone.
      </div>
    </div>
  );
};