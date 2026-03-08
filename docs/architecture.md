# Architecture Overview

## Frontend shell

EchoCraft is a Vite + React + TypeScript application with routing handled in `src/App.tsx`.

## Main user flows

- `src/pages/Index.tsx`: upload, record, transcribe, translate, and generate content.
- `src/pages/Posts.tsx`: review generated long-form and social content.

## Core utilities

- `src/utils/appConfig.ts`: environment-based API key access.
- `src/utils/openaiUtils.ts`: Gemini-powered content generation and translation.
- `src/utils/historyUtils.ts`: local transcript history persistence.
- `src/utils/transcriptionUtils.ts`: copy and export helpers.

## External dependencies

- AssemblyAI for transcription.
- Gemini for generation and translation.
- Tailwind and shadcn/ui for interface primitives.

## Automation

The repo also contains a scheduled maintenance workflow under `.github/workflows/daily-maintenance-pr.yml`.