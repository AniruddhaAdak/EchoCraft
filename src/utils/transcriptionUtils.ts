import { toast } from "@/components/ui/use-toast";

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Success",
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

export const downloadTranscription = (text: string) => {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transcription.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  toast({
    title: "Success",
    description: "Transcription downloaded successfully"
  });
};