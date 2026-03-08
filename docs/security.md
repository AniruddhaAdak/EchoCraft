# Security and Secret Management

## Secrets

- Store API keys in `.env` locally or in platform environment settings.
- Never commit real keys to the repository.
- Rotate keys if you suspect accidental exposure.

## Pull requests

- Review screenshots for exposed tokens.
- Avoid copying real credentials into issue comments or PR descriptions.
- Keep security-sensitive fixes focused and easy to review.

## Local development

Use `.env.example` as the template for required variables.

## Sensitive reports

Use a private maintainer contact path for security concerns instead of public issues.