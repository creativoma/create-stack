#!/usr/bin/env node

import prompts from 'prompts';
import pc from 'picocolors';
import { VERSION, BANNER, HELP_TEXT } from './constants.js';
import { getPrompts } from './prompts.js';
import { createProject } from './create.js';
import { checkPrerequisites, printPrerequisiteWarnings } from './utils.js';
import type { ProjectConfig } from './types.js';

// Parse CLI arguments
const args = process.argv.slice(2);

if (args.includes('-v') || args.includes('--version')) {
  console.log(`create-stack v${VERSION}`);
  process.exit(0);
}

if (args.includes('-h') || args.includes('--help')) {
  console.log(HELP_TEXT);
  process.exit(0);
}

// Show banner
console.log(BANNER);

// Handle Ctrl+C gracefully
const onCancel = (): void => {
  console.log(pc.red('\n  Operation cancelled'));
  process.exit(0);
};

async function main(): Promise<void> {
  const allPrompts = getPrompts();

  const response = (await prompts(allPrompts, { onCancel })) as ProjectConfig;

  if (!response.confirm) {
    console.log(pc.yellow('\n  Maybe next time!'));
    process.exit(0);
  }

  // Check prerequisites before creating project
  const issues = await checkPrerequisites(response.packageManager);
  if (printPrerequisiteWarnings(issues)) {
    const { proceed } = await prompts(
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Continue anyway?',
        initial: false
      },
      { onCancel }
    );

    if (!proceed) {
      console.log(pc.yellow('\n  Please fix the issues above and try again.'));
      process.exit(1);
    }
  }

  console.log();
  await createProject(response);
}

main().catch((error: Error) => {
  console.error(pc.red('\n  Error:'), error.message);
  process.exit(1);
});
