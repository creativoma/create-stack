import ora from 'ora';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { getPackageManagerCommands } from './utils.js';
import type { ProjectConfig } from './types.js';
import { createExecutionContext } from './core/ExecutionContext.js';
import { formatError } from './core/errors.js';
import { scaffoldProject } from './setup/scaffold.js';
import { setupStyling } from './setup/styling.js';
import { setupUI } from './setup/ui.js';
import { setupDatabase } from './setup/database.js';
import { setupAnimation } from './setup/animation.js';
import { setupTooling } from './setup/tooling.js';
import { setupTesting } from './setup/testing.js';
import { setupExtras } from './setup/extras.js';

/**
 * Creates a new project based on user configuration
 *
 * This is the main orchestrator function that:
 * 1. Validates the project directory doesn't exist
 * 2. Scaffolds the base project using Vite or a meta-framework
 * 3. Installs base dependencies
 * 4. Sequentially applies all user-selected features
 * 5. Reports success or handles errors gracefully
 *
 * @param config - User's project configuration from CLI prompts
 * @throws {ConfigurationError} When project directory already exists
 * @throws {ScaffoldingError} When project scaffolding fails
 * @throws {InstallationError} When package installation fails
 * @throws {FileOperationError} When file operations fail
 */
export async function createProject(config: ProjectConfig): Promise<void> {
  const { projectName, packageManager } = config;

  const pmCommands = getPackageManagerCommands(packageManager);
  const { pm, pmRun } = pmCommands;
  const projectPath = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.log(pc.red(`\n  Directory ${projectName} already exists!`));
    process.exit(1);
  }

  let spinner = ora('Creating project...').start();
  const context = createExecutionContext(config, pmCommands, projectPath, spinner);

  try {
    await scaffoldProject(context);
    spinner.succeed('Project scaffolded');

    process.chdir(projectPath);

    spinner = ora('Installing dependencies...').start();
    context.spinner = spinner;
    await execa(pm, ['install'], { stdio: 'pipe' });
    spinner.succeed('Dependencies installed');

    await setupStyling(context);
    await setupUI(context);
    await setupDatabase(context);
    await setupAnimation(context);
    await setupTooling(context);
    await setupTesting(context);
    await setupExtras(context);

    printSuccessMessage(projectName, pmRun);
  } catch (error) {
    spinner.fail('Something went wrong');
    const formatted = formatError(error);
    console.error(pc.red(formatted.message));
    if (formatted.details) {
      console.error(pc.dim(formatted.details));
    }
    process.exit(1);
  }
}

/**
 * Prints success message with next steps for the user
 *
 * @param projectName - Name of the created project
 * @param pmRun - Package manager run command (e.g., 'npm run', 'pnpm')
 */
function printSuccessMessage(projectName: string, pmRun: string): void {
  console.log();
  console.log(pc.green('  Done.'));
  console.log();
  console.log(pc.dim('  cd'), projectName);
  console.log(pc.dim('  ' + pmRun), 'dev');
  console.log();
}
