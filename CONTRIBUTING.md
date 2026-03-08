# Contributing to EchoCraft

Thanks for contributing to EchoCraft.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Add `VITE_ASSEMBLYAI_API_KEY` and `VITE_GEMINI_API_KEY`.
4. Start the app with `npm run dev`.

## Quality checks

Before opening a pull request, run:

```bash
npm run lint
npm run build
```

## Pull requests

- Keep changes focused and reviewable.
- Explain user impact clearly.
- Mention any environment or API changes.
- Include screenshots when the UI changes.

## Safe contribution rules

- Never commit real API keys.
- Prefer incremental changes over broad rewrites.
- Keep documentation aligned with the current product behavior.