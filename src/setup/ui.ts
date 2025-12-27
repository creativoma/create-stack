import ora from 'ora';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import type { ExecutionContext } from '../core/ExecutionContext.js';
import { InstallationError, FileOperationError } from '../core/errors.js';
import {
  getViteConfig,
  getTsConfig,
  getShadcnComponentsJson,
  shadcnUtilsTs
} from '../templates/configs.js';

/**
 * Sets up UI component libraries (shadcn/ui, Radix UI, Headless UI, etc.)
 *
 * @param context - Execution context containing project configuration and state
 * @throws {InstallationError} When package installation fails
 * @throws {FileOperationError} When file operations fail
 */
export async function setupUI(context: ExecutionContext): Promise<void> {
  const { config, pmCommands, projectPath } = context;
  const { ui, metaFramework, styling } = config;
  const { pm, pmx, pmxArgs, pmDev, pmInstall } = pmCommands;

  if (!ui || ui.length === 0) return;

  const spinner = ora('Adding UI components...').start();
  const uiDeps: string[] = [];

  try {
    if (ui.includes('shadcn')) {
      await setupShadcn({
        metaFramework,
        styling,
        pm,
        pmx,
        pmxArgs,
        pmDev,
        projectPath
      });
    }

    if (ui.includes('radix')) {
      uiDeps.push(
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-tooltip',
        '@radix-ui/react-slot'
      );
    }
    if (ui.includes('headless')) {
      uiDeps.push('@headlessui/react');
    }
    if (ui.includes('ark')) {
      uiDeps.push('@ark-ui/react');
    }
    if (ui.includes('naive')) {
      uiDeps.push('naive-ui');
    }
    if (ui.includes('primevue')) {
      uiDeps.push('primevue');
    }

    if (uiDeps.length > 0) {
      await execa(pm, [...pmInstall, ...uiDeps], { stdio: 'pipe' });
    }

    spinner.succeed('UI components added');
  } catch (error) {
    spinner.fail('Failed to setup UI components');
    if (error instanceof Error && 'code' in error) {
      throw new FileOperationError(
        projectPath,
        'write',
        'Failed to configure UI components',
        error
      );
    }
    throw new InstallationError(uiDeps.join(', '), 'Failed to install UI components', error);
  }
}

/**
 * Sets up shadcn/ui with proper configuration
 */
async function setupShadcn(params: {
  metaFramework: string;
  styling: string;
  pm: string;
  pmx: string;
  pmxArgs: string[];
  pmDev: string[];
  projectPath: string;
}): Promise<void> {
  const { metaFramework, styling, pm, pmx, pmxArgs, pmDev, projectPath } = params;

  if (metaFramework === 'none') {
    await execa(pm, [...pmDev, '@types/node'], { stdio: 'pipe' });

    const viteConfigPath = path.join(projectPath, 'vite.config.ts');
    if (await fs.pathExists(viteConfigPath)) {
      const hasTailwind = styling === 'tailwind';
      const viteConfig = getViteConfig(hasTailwind);
      await fs.writeFile(viteConfigPath, viteConfig);
    }

    const tsconfigPath = path.join(projectPath, 'tsconfig.json');
    const tsconfig = getTsConfig();
    await fs.writeJSON(tsconfigPath, tsconfig, { spaces: 2 });

    const tsconfigAppPath = path.join(projectPath, 'tsconfig.app.json');
    if (await fs.pathExists(tsconfigAppPath)) {
      await fs.writeJSON(tsconfigAppPath, tsconfig, { spaces: 2 });
    }
  }

  if (metaFramework === 'nextjs') {
    const shadcnArgs = [
      ...pmxArgs,
      'shadcn@latest',
      'init',
      '--yes',
      '--defaults',
      '--force',
      '--template',
      'next'
    ];
    await execa(pmx, shadcnArgs, { stdio: 'pipe' });
  } else {
    await execa(
      pm,
      [
        ...pmDev,
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
        'tailwindcss-animate',
        'lucide-react'
      ],
      { stdio: 'pipe' }
    );

    const componentsJson = getShadcnComponentsJson();
    await fs.writeJSON(path.join(projectPath, 'components.json'), componentsJson, { spaces: 2 });

    const libDir = path.join(projectPath, 'src', 'lib');
    await fs.ensureDir(libDir);
    await fs.writeFile(path.join(libDir, 'utils.ts'), shadcnUtilsTs);

    await fs.ensureDir(path.join(projectPath, 'src', 'components', 'ui'));
    await fs.ensureDir(path.join(projectPath, 'src', 'hooks'));
  }
}
