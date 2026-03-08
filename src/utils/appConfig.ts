const assemblyAiApiKey = import.meta.env.VITE_ASSEMBLYAI_API_KEY?.trim() || "";
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim() || "";

export const appConfig = {
  assemblyAiApiKey,
  geminiApiKey,
};

export const missingConfig = {
  assemblyAi: !assemblyAiApiKey,
  gemini: !geminiApiKey,
};

export const hasRequiredKeys = {
  transcription: Boolean(assemblyAiApiKey),
  generation: Boolean(geminiApiKey),
};
