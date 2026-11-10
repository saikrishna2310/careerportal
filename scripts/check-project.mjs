import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const failures = [];
const requiredFiles = [
  'package.json',
  'apps/web/package.json',
  'apps/web/.env.example',
  'apps/mobile/package.json',
  'apps/mobile/app.json',
  'apps/mobile/.env.example',
  'packages/shared/package.json',
  'packages/shared/src/index.ts',
  'supabase/migrations/202611090001_initial_schema.sql',
  'supabase/migrations/202611090002_application_workflow.sql',
];

for (const file of requiredFiles) {
  if (!existsSync(resolve(root, file))) failures.push(`Missing required file: ${file}`);
}

for (const file of ['package.json', 'apps/web/package.json', 'apps/mobile/package.json', 'packages/shared/package.json', 'apps/mobile/app.json']) {
  try {
    JSON.parse(readFileSync(resolve(root, file), 'utf8'));
  } catch (error) {
    failures.push(`Invalid JSON in ${file}: ${error.message}`);
  }
}

const rootPackage = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
for (const workspace of rootPackage.workspaces ?? []) {
  if (!existsSync(resolve(root, workspace, 'package.json'))) {
    failures.push(`Workspace is missing package.json: ${workspace}`);
  }
}

for (const file of ['apps/web/.env.example', 'apps/mobile/.env.example']) {
  const content = readFileSync(resolve(root, file), 'utf8');
  if (/SERVICE_ROLE|SECRET_KEY|sb_secret_/i.test(content)) {
    failures.push(`Potential privileged Supabase key found in frontend template: ${file}`);
  }
}

if (failures.length) {
  console.error('CareerConnect structure check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`CareerConnect structure check passed (${requiredFiles.length} required files, ${rootPackage.workspaces.length} workspaces).`);
}
