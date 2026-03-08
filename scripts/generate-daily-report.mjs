import { promises as fs } from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const today = process.env.REPORT_DATE || new Date().toISOString().slice(0, 10);
const packageJsonPath = path.join(rootDir, 'package.json');
const srcDir = path.join(rootDir, 'src');
const logDir = path.join(rootDir, '.daily-automation');
const reportsDir = path.join(rootDir, 'docs', 'daily-reports');
const reportPath = path.join(reportsDir, `${today}.md`);

function toStatusText(code) {
  return code === '0' ? 'pass' : 'fail';
}

function toBadge(statusText) {
  return statusText === 'pass' ? ':white_check_mark:' : ':x:';
}

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function walkFiles(dirPath) {
  if (!(await exists(dirPath))) {
    return [];
  }

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        return walkFiles(fullPath);
      }
      return [fullPath];
    })
  );

  return nested.flat();
}

async function readLogTail(fileName) {
  const filePath = path.join(logDir, fileName);
  if (!(await exists(filePath))) {
    return 'Log not available.';
  }

  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) {
    return 'No output captured.';
  }

  return lines.slice(-40).join('\n');
}

async function main() {
  const packageJson = await readJson(packageJsonPath);
  const sourceFiles = await walkFiles(srcDir);
  const codeFiles = sourceFiles.filter((filePath) => /\.(ts|tsx|js|jsx|css)$/i.test(filePath));

  const lintStatusCode = process.env.LINT_STATUS || '1';
  const buildStatusCode = process.env.BUILD_STATUS || '1';
  const lintStatus = toStatusText(lintStatusCode);
  const buildStatus = toStatusText(buildStatusCode);

  const lintLog = await readLogTail('lint.log');
  const buildLog = await readLogTail('build.log');

  await fs.mkdir(reportsDir, { recursive: true });

  const report = `# Daily Maintenance Report - ${today}

This report was generated automatically by the scheduled GitHub Actions workflow.

## Health Checks

| Check | Result |
| --- | --- |
| Lint | ${toBadge(lintStatus)} ${lintStatus} |
| Build | ${toBadge(buildStatus)} ${buildStatus} |

## Project Snapshot

- Base commit: ${process.env.GITHUB_SHA || 'unknown'}
- Package name: ${packageJson.name}
- Dependencies: ${Object.keys(packageJson.dependencies || {}).length}
- Dev dependencies: ${Object.keys(packageJson.devDependencies || {}).length}
- Source files scanned: ${codeFiles.length}

## Why This PR Exists

- Keeps one reviewable contribution flowing each day.
- Captures whether the repo still lints and builds cleanly.
- Leaves an auditable paper trail instead of silent direct pushes to main.

## Lint Log Tail

\`\`\`text
${lintLog}
\`\`\`

## Build Log Tail

\`\`\`text
${buildLog}
\`\`\`
`;

  await fs.writeFile(reportPath, report, 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});