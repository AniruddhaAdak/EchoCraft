import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Mic } from "lucide-react";
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
  onFileSelect: (file: File) => void;
}

export const TranscriptionUploader = ({ onFileSelect }: TranscriptionUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const validateFile = (file: File) => {
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
    const droppedFile = e.dataTransfer.files[0];
    if (validateFile(droppedFile)) {
      setFile(droppedFile);
      onFileSelect(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
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
        setFile(recordedFile);
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
          accept=".mp3,.wav,.m4a,.flac,.ogg,.webm,.mp4"
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
      <div className="mt-4 flex justify-center">
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            toggleRecording();
          }}
          variant={isRecording ? "destructive" : "outline"}
          className="flex items-center gap-2"
        >
          <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
          {isRecording ? "Stop Recording" : "Record Audio"}
        </Button>
      </div>
    </div>
  );
};