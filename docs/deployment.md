# Deployment Guide

## Build step

Use `npm run build` to produce the static output in `dist/`.

## Environment variables

Set `VITE_ASSEMBLYAI_API_KEY` and `VITE_GEMINI_API_KEY` in the hosting platform before deployment.

## Recommended flow

1. Run `npm run lint`.
2. Run `npm run build`.
3. Deploy the `dist/` output to your static hosting provider.
4. Verify transcription, translation, and content generation after release.

## Security note

Do not hardcode real secrets in source files or screenshots.