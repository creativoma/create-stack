import { execa } from 'execa';
import type { ExecutionContext } from '../core/ExecutionContext.js';
import { ScaffoldingError } from '../core/errors.js';

/**
 * Scaffolds the base project using either a meta-framework CLI or Vite
 *
 * @param context - Execution context containing project configuration and state
 * @throws {ScaffoldingError} When project scaffolding fails
 */
export async function scaffoldProject(context: ExecutionContext): Promise<void> {
  const { config, pmCommands, spinner } = context;
  const { projectName, framework, variant, metaFramework, styling } = config;
  const { pm, pmx, pmxArgs } = pmCommands;

  try {
    if (metaFramework !== 'none') {
      spinner.text = `Scaffolding with ${metaFramework}...`;
      await scaffoldWithMetaFramework(metaFramework, projectName, styling, pm, pmx, pmxArgs);
    } else {
      spinner.text = 'Scaffolding with Vite...';
      await scaffoldWithVite(projectName, framework, variant, pm);
    }
  } catch (error) {
    throw new ScaffoldingError(
      `Failed to scaffold project with ${metaFramework === 'none' ? 'Vite' : metaFramework}`,
      error
    );
  }
}

/**
 * Scaffolds project using a meta-framework's official CLI
 */
async function scaffoldWithMetaFramework(
  metaFramework: string,
  projectName: string,
  styling: string,
  pm: string,
  pmx: string,
  pmxArgs: string[]
): Promise<void> {
  switch (metaFramework) {
    case 'nextjs': {
      const nextjsArgs = buildNextjsArgs(pm, projectName, styling);
      const nextjsCmd = pm === 'npm' ? 'npx' : pm === 'deno' ? 'deno' : pm;
      await execa(nextjsCmd, nextjsArgs, { stdio: 'pipe' });
      break;
    }
    case 'astro':
      await execa(
        pm,
        [
          'create',
          'astro@latest',
          projectName,
          '--',
          '--template',
          'minimal',
          '--typescript',
          'strict',
          '--no-git',
          '--no-install'
        ],
        { stdio: 'pipe' }
      );
      break;
    case 'remix':
      await execa(
        pmx,
        [
          ...pmxArgs,
          'create-remix@latest',
          projectName,
          '--typescript',
          '--no-git-init',
          '--no-install'
        ],
        { stdio: 'pipe' }
      );
      break;
    case 'nuxt':
      await execa(pmx, [...pmxArgs, 'nuxi@latest', 'init', projectName, '--no-install'], {
        stdio: 'pipe'
      });
      break;
    case 'sveltekit':
      await execa(
        pm,
        [
          'create',
          'svelte@latest',
          projectName,
          '--',
          '--template',
          'skeleton',
          '--typescript',
          '--no-install'
        ],
        { stdio: 'pipe' }
      );
      break;
  }
}

/**
 * Builds Next.js CLI arguments based on package manager
 */
function buildNextjsArgs(pm: string, projectName: string, styling: string): string[] {
  const args: string[] = [];

  if (pm === 'npm') {
    args.push('create-next-app@latest');
  } else if (pm === 'yarn' || pm === 'pnpm' || pm === 'bun') {
    args.push('create', 'next-app@latest');
  } else if (pm === 'deno') {
    args.push('run', '-A', 'npm:create-next-app@latest');
  }

  args.push(projectName);
  args.push('--yes');
  args.push('--typescript', '--eslint', '--app', '--src-dir');
  args.push('--turbopack');
  args.push('--disable-git');
  args.push('--skip-install');

  if (styling === 'tailwind') {
    args.push('--tailwind');
  }

  args.push('--import-alias', '@/*');

  return args;
}

/**
 * Scaffolds project using Vite
 */
async function scaffoldWithVite(
  projectName: string,
  framework: string,
  variant: string,
  pm: string
): Promise<void> {
  const template = `${framework}${variant === 'ts' ? '-ts' : ''}`;

  if (pm === 'deno') {
    await execa(
      'deno',
      ['run', '-A', 'npm:create-vite@latest', projectName, '--', '--template', template],
      { stdio: 'pipe' }
    );
  } else {
    await execa(pm, ['create', 'vite@latest', projectName, '--', '--template', template], {
      stdio: 'pipe'
    });
  }
}
