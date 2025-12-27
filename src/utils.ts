import { execa } from 'execa';
import pc from 'picocolors';
import type { Framework, PackageManager, PackageManagerCommands, Testing } from './types.js';

/**
 * Get package manager specific commands
 */
export function getPackageManagerCommands(pm: PackageManager): PackageManagerCommands {
  const commands: Record<PackageManager, Omit<PackageManagerCommands, 'pm'>> = {
    npm: {
      pmx: 'npx',
      pmxArgs: [],
      pmInstall: ['install'],
      pmDev: ['install', '-D'],
      pmRun: 'npm run'
    },
    yarn: {
      pmx: 'yarn',
      pmxArgs: ['dlx'],
      pmInstall: ['add'],
      pmDev: ['add', '-D'],
      pmRun: 'yarn'
    },
    pnpm: {
      pmx: 'pnpm',
      pmxArgs: ['dlx'],
      pmInstall: ['add'],
      pmDev: ['add', '-D'],
      pmRun: 'pnpm'
    },
    bun: {
      pmx: 'bunx',
      pmxArgs: [],
      pmInstall: ['add'],
      pmDev: ['add', '-d'],
      pmRun: 'bun'
    },
    deno: {
      pmx: 'deno',
      pmxArgs: ['run', '-A', 'npm:'],
      pmInstall: ['add'],
      pmDev: ['add', '--dev'],
      pmRun: 'deno task'
    }
  };

  return { pm, ...commands[pm] };
}

/**
 * Check if a command exists
 */
async function commandExists(command: string): Promise<boolean> {
  try {
    await execa('which', [command]);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check prerequisites before running the CLI
 */
export async function checkPrerequisites(packageManager: PackageManager): Promise<string[]> {
  const issues: string[] = [];

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0] ?? '0', 10);
  if (majorVersion < 22) {
    issues.push(`Node.js 22+ required (found ${nodeVersion})`);
  }

  // Check if selected package manager is available
  const pmExists = await commandExists(packageManager);
  if (!pmExists) {
    issues.push(`${packageManager} is not installed`);
  }

  // Check if git is available (for git init)
  const gitExists = await commandExists('git');
  if (!gitExists) {
    issues.push('git is not installed (required for git init)');
  }

  return issues;
}

/**
 * Get testing library dependencies based on framework
 */
export function getTestingDeps(framework: Framework, testingOptions: Testing[]): string[] {
  const deps: string[] = [];

  if (testingOptions.includes('vitest')) {
    deps.push('vitest', 'jsdom');

    // Add framework-specific testing library
    switch (framework) {
      case 'react':
        deps.push('@testing-library/react', '@testing-library/jest-dom');
        break;
      case 'vue':
        deps.push('@testing-library/vue', '@testing-library/jest-dom');
        break;
      case 'svelte':
        deps.push('@testing-library/svelte', '@testing-library/jest-dom');
        break;
      case 'solid':
        deps.push('solid-testing-library');
        break;
    }
  }

  if (testingOptions.includes('jest')) {
    deps.push('jest', '@types/jest', 'ts-jest');
  }

  if (testingOptions.includes('playwright')) {
    deps.push('@playwright/test');
  }

  if (testingOptions.includes('cypress')) {
    deps.push('cypress');
  }

  return deps;
}

/**
 * Print prerequisites warning
 */
export function printPrerequisiteWarnings(issues: string[]): boolean {
  if (issues.length > 0) {
    console.log();
    console.log(pc.yellow('  Prerequisites check:'));
    issues.forEach((issue) => {
      console.log(pc.red(`    ${issue}`));
    });
    console.log();
    return true;
  }
  return false;
}
