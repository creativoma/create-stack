import ora from 'ora';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import type { ExecutionContext } from '../core/ExecutionContext.js';
import { InstallationError, FileOperationError } from '../core/errors.js';

/**
 * Sets up code quality tools (Prettier, Biome, etc.)
 *
 * @param context - Execution context containing project configuration and state
 * @throws {InstallationError} When package installation fails
 * @throws {FileOperationError} When config file creation fails
 */
export async function setupTooling(context: ExecutionContext): Promise<void> {
  const { config, pmCommands, projectPath } = context;
  const { tooling, styling } = config;
  const { pm, pmDev } = pmCommands;

  if (!tooling || tooling.length === 0) return;

  const spinner = ora('Setting up code quality tools...').start();
  const toolDeps: string[] = [];

  try {
    if (tooling.includes('prettier')) {
      toolDeps.push('prettier');
      if (styling === 'tailwind') {
        toolDeps.push('prettier-plugin-tailwindcss');
      }

      const prettierConfig = {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5' as const,
        plugins: styling === 'tailwind' ? ['prettier-plugin-tailwindcss'] : []
      };

      const prettierPath = path.join(projectPath, '.prettierrc');
      await fs.writeJSON(prettierPath, prettierConfig, { spaces: 2 });
    }

    if (tooling.includes('biome')) {
      toolDeps.push('@biomejs/biome');
    }

    if (toolDeps.length > 0) {
      await execa(pm, [...pmDev, ...toolDeps], { stdio: 'pipe' });
    }

    spinner.succeed('Code quality tools configured');
  } catch (error) {
    spinner.fail('Failed to setup tooling');
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new FileOperationError(
        projectPath,
        'write',
        'Failed to write tooling configuration',
        error
      );
    }
    throw new InstallationError(toolDeps.join(', '), 'Failed to install code quality tools', error);
  }
}
