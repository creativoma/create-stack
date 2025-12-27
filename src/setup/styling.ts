import ora from 'ora';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import type { ExecutionContext } from '../core/ExecutionContext.js';
import { InstallationError, FileOperationError } from '../core/errors.js';
import { postcssConfig, tailwindCSS } from '../templates/configs.js';

/**
 * Sets up styling solution (Tailwind CSS, Styled Components, UnoCSS)
 *
 * @param context - Execution context containing project configuration and state
 * @throws {InstallationError} When package installation fails
 * @throws {FileOperationError} When file operations fail
 */
export async function setupStyling(context: ExecutionContext): Promise<void> {
  const { config, pmCommands, projectPath } = context;
  const { styling, metaFramework } = config;
  const { pm, pmDev } = pmCommands;

  if (styling === 'tailwind' && metaFramework !== 'nextjs') {
    const spinner = ora('Setting up Tailwind CSS...').start();

    try {
      if (metaFramework === 'none') {
        await execa(pm, [...pmDev, 'tailwindcss', '@tailwindcss/vite'], { stdio: 'pipe' });
      } else {
        await execa(
          pm,
          [...pmDev, 'tailwindcss', '@tailwindcss/postcss', 'postcss', 'autoprefixer'],
          { stdio: 'pipe' }
        );

        await fs.writeFile(path.join(projectPath, 'postcss.config.mjs'), postcssConfig);
      }

      await updateCssFile(projectPath);
      spinner.succeed('Tailwind CSS configured');
    } catch (error) {
      spinner.fail('Failed to setup Tailwind CSS');
      if (error instanceof Error && 'code' in error) {
        throw new FileOperationError(
          projectPath,
          'write',
          'Failed to configure Tailwind CSS',
          error
        );
      }
      throw new InstallationError('tailwindcss', 'Failed to install Tailwind CSS', error);
    }
  } else if (styling === 'styled') {
    const spinner = ora('Adding Styled Components...').start();
    try {
      await execa(pm, [...pmDev.slice(0, -1), 'styled-components'], { stdio: 'pipe' });
      spinner.succeed('Styled Components added');
    } catch (error) {
      spinner.fail('Failed to add Styled Components');
      throw new InstallationError(
        'styled-components',
        'Failed to install Styled Components',
        error
      );
    }
  } else if (styling === 'unocss') {
    const spinner = ora('Adding UnoCSS...').start();
    try {
      await execa(pm, [...pmDev, 'unocss'], { stdio: 'pipe' });
      spinner.succeed('UnoCSS added');
    } catch (error) {
      spinner.fail('Failed to add UnoCSS');
      throw new InstallationError('unocss', 'Failed to install UnoCSS', error);
    }
  }
}

/**
 * Updates CSS file with Tailwind directives
 */
async function updateCssFile(projectPath: string): Promise<void> {
  const cssDir = path.join(projectPath, 'src');
  const possibleCssFiles = ['index.css', 'app.css', 'styles.css', 'global.css'];
  let cssFile: string | null = null;

  for (const filename of possibleCssFiles) {
    const filePath = path.join(cssDir, filename);
    if (await fs.pathExists(filePath)) {
      cssFile = filePath;
      break;
    }
  }

  if (cssFile) {
    const existingCSS = await fs.readFile(cssFile, 'utf-8');
    await fs.writeFile(cssFile, tailwindCSS + existingCSS);
  } else {
    await fs.writeFile(path.join(cssDir, 'index.css'), tailwindCSS);
  }
}
