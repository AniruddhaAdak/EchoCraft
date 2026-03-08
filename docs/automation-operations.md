# Automation Operations

## Daily maintenance workflow

The repository includes a scheduled workflow in `.github/workflows/daily-maintenance-pr.yml`.

## What it does

- installs dependencies
- runs lint
- runs build
- generates a dated maintenance report
- opens a pull request

## Manual use

Use the Actions tab in GitHub to trigger the workflow manually when you want an on-demand maintenance PR.

## Changing the schedule

Update the `cron` entry in the workflow file and commit the change through a normal pull request.