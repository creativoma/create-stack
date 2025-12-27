#!/usr/bin/env node
import prompts from 'prompts';
import pc from 'picocolors';
import { VERSION, BANNER, HELP_TEXT } from './constants.js';
import { getPrompts } from './prompts.js';
import { createProject } from './create.js';
import { checkPrerequisites, printPrerequisiteWarnings } from './utils.js';
import { validateProjectConfig } from './schemas.js';
import type { ProjectConfig } from './types.js';

const args = process.argv.slice(2);

if (args.includes('--version') || args.includes('-v')) {
  console.log(`create-stack v${VERSION}`);
  process.exit(0);
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(HELP_TEXT);
  process.exit(0);
}

const onCancel = () => {
  console.log(pc.red('\n  Operation cancelled'));
  process.exit(0);
};

async function main(): Promise<void> {
  console.log(BANNER);

  // Get user input
  const allPrompts = getPrompts();
  const response = await prompts(allPrompts, { onCancel });

  // Validate configuration with Zod
  try {
    validateProjectConfig(response);
  } catch (error) {
    console.error(pc.red('\nConfiguration validation failed:'));
    if (error instanceof Error) {
      console.error(pc.dim(error.message));
    }
    process.exit(1);
  }

  const config = response as ProjectConfig;

  if (!config.confirm) {
    console.log(pc.yellow('\n  Maybe next time!'));
    process.exit(0);
  }

  // Check prerequisites
  const issues = await checkPrerequisites(config.packageManager);
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
  await createProject(config);
}

main().catch((error: Error) => {
  console.error(pc.red('\n  Error:'), error.message);
  process.exit(1);
});
