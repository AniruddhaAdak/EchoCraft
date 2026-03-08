# Environment Setup

## Required variables

Create a `.env` file in the project root and define:

```env
VITE_ASSEMBLYAI_API_KEY=your_assemblyai_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Local startup

1. Run `npm install`.
2. Add the required environment variables.
3. Start the app with `npm run dev`.

## Validation

Before shipping changes, run:

```bash
npm run lint
npm run build
```

## Safety note

Never commit a real `.env` file or production API keys to the repository.