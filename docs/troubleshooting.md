# Troubleshooting

## Missing API key errors

Make sure `.env` contains `VITE_ASSEMBLYAI_API_KEY` and `VITE_GEMINI_API_KEY`, then restart the dev server.

## Microphone does not record

- confirm browser microphone permission
- check OS input device selection
- retry with a supported browser

## Lint warnings

The current repo has a few shared UI fast-refresh warnings, but lint should not fail.

## Build failures

- run `npm install`
- make sure you are on a supported Node version
- rerun `npm run build` from the repo root