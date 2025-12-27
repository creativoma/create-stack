import ora from 'ora';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import type { ExecutionContext } from '../core/ExecutionContext.js';
import { InstallationError, FileOperationError, CommandExecutionError } from '../core/errors.js';
import {
  dockerfile,
  dockerignore,
  gitignore,
  envTemplate,
  envLocalTemplate,
  envExampleTemplate
} from '../templates/docker.js';

/**
 * Sets up extra features (Git, Husky, Docker, env files, VSCode settings)
 *
 * @param context - Execution context containing project configuration and state
 * @throws {InstallationError} When package installation fails
 * @throws {FileOperationError} When file operations fail
 * @throws {CommandExecutionError} When command execution fails
 */
export async function setupExtras(context: ExecutionContext): Promise<void> {
  const { config, pmCommands, projectPath } = context;
  const { extras } = config;
  const { pm, pmx, pmxArgs, pmDev } = pmCommands;

  if (!extras || extras.length === 0) return;

  const spinner = ora('Adding extras...').start();

  try {
    if (extras.includes('git')) {
      await setupGit(projectPath);
    }

    if (extras.includes('husky')) {
      await setupHusky(pm, pmx, pmxArgs, pmDev);
    }

    if (extras.includes('env')) {
      await setupEnvFiles(projectPath);
    }

    if (extras.includes('docker')) {
      await setupDocker(projectPath);
    }

    if (extras.includes('vscode')) {
      await setupVSCode(projectPath);
    }

    spinner.succeed('Extras added');
  } catch (error) {
    spinner.fail('Failed to add extras');
    throw error;
  }
}

/**
 * Initializes Git repository and creates .gitignore
 */
async function setupGit(projectPath: string): Promise<void> {
  try {
    await execa('git', ['init'], { stdio: 'pipe' });
    await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);
  } catch (error) {
    throw new CommandExecutionError(
      'git init',
      null,
      'Failed to initialize Git repository',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Sets up Husky for Git hooks
 */
async function setupHusky(
  pm: string,
  pmx: string,
  pmxArgs: string[],
  pmDev: string[]
): Promise<void> {
  try {
    await execa(pm, [...pmDev, 'husky', 'lint-staged'], { stdio: 'pipe' });
    await execa(pmx, [...pmxArgs, 'husky', 'init'], { stdio: 'pipe' });
  } catch (error) {
    throw new InstallationError('husky', 'Failed to setup Husky', error);
  }
}

/**
 * Creates environment variable files
 */
async function setupEnvFiles(projectPath: string): Promise<void> {
  try {
    await fs.writeFile(path.join(projectPath, '.env'), envTemplate);
    await fs.writeFile(path.join(projectPath, '.env.local'), envLocalTemplate);

    const envExamplePath = path.join(projectPath, '.env.example');
    const existing = (await fs.pathExists(envExamplePath))
      ? await fs.readFile(envExamplePath, 'utf-8')
      : '';

    if (!existing.includes('DATABASE_URL')) {
      await fs.writeFile(envExamplePath, envExampleTemplate + existing);
    }
  } catch (error) {
    throw new FileOperationError(projectPath, 'write', 'Failed to create env files', error);
  }
}

/**
 * Creates Docker configuration files
 */
async function setupDocker(projectPath: string): Promise<void> {
  try {
    await fs.writeFile(path.join(projectPath, 'Dockerfile'), dockerfile);
    await fs.writeFile(path.join(projectPath, '.dockerignore'), dockerignore);
  } catch (error) {
    throw new FileOperationError(projectPath, 'write', 'Failed to create Docker files', error);
  }
}

/**
 * Creates VSCode settings and extensions recommendations
 */
async function setupVSCode(projectPath: string): Promise<void> {
  try {
    await fs.ensureDir(path.join(projectPath, '.vscode'));

    const extensionsJson = {
      recommendations: [
        'dbaeumer.vscode-eslint',
        'esbenp.prettier-vscode',
        'bradlc.vscode-tailwindcss',
        'prisma.prisma'
      ]
    };

    const settingsJson = {
      'editor.formatOnSave': true,
      'editor.defaultFormatter': 'esbenp.prettier-vscode',
      'editor.codeActionsOnSave': {
        'source.fixAll.eslint': 'explicit'
      }
    };

    await fs.writeJSON(path.join(projectPath, '.vscode', 'extensions.json'), extensionsJson, {
      spaces: 2
    });

    await fs.writeJSON(path.join(projectPath, '.vscode', 'settings.json'), settingsJson, {
      spaces: 2
    });
  } catch (error) {
    throw new FileOperationError(projectPath, 'write', 'Failed to create VSCode settings', error);
  }
}
