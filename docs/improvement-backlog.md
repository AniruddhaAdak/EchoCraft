# EchoCraft Improvement Backlog

This file mirrors the 10 GitHub issues that should exist once repository write access is available.

## Issue 1: Remove hardcoded API keys and move secrets to environment variables
- Replace all committed API keys with `VITE_` environment variables.
- Add runtime validation and user-facing setup guidance when keys are missing.
- Provide an `.env.example` file and correct the README setup steps.

## Issue 2: Improve the landing page with a stronger product story
- Replace the plain hero with a more premium, feature-led introduction.
- Add benefit cards, workflow steps, and stronger visual hierarchy.
- Make the page feel like a product, not just a demo.

## Issue 3: Upgrade the uploader experience
- Add drag-active styling, selected file metadata, and a clear selection action.
- Improve recording affordances and error handling.
- Make upload state visible before transcription begins.

## Issue 4: Add transcript insights and export options
- Show words, characters, and estimated reading time.
- Add richer export actions such as JSON export.
- Surface actions more clearly for creators.

## Issue 5: Add transcript history and session recall
- Persist recent sessions in local storage.
- Let users reload earlier transcripts without re-uploading files.
- Keep recent work visible on the home screen.

## Issue 6: Improve translation UX
- Show the translated output inline instead of a generic toast.
- Preserve the selected language label.
- Make copy and reuse of translated content easier.

## Issue 7: Turn content generation into a workspace
- Keep generated blog and social content visible on the home screen.
- Add preview panels and one-click open actions.
- Avoid forcing navigation immediately after generation.

## Issue 8: Improve the generated post page
- Add better content formatting, copy/download actions, and stronger metadata.
- Improve comment entry and empty states.
- Make social sharing failure fall back gracefully.

## Issue 9: Add more motion and atmosphere without hurting usability
- Introduce subtle floating gradients, staged reveals, and richer cards.
- Improve background depth and product feel.
- Keep motion tasteful and lightweight.

## Issue 10: Add quality safeguards for future automation
- Ensure lint and build stay green before automated PRs run daily.
- Reduce noisy warnings over time.
- Keep future automation focused on reviewable, credible changes.
