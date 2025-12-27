import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getPackageManagerCommands,
  getTestingDeps,
  checkPrerequisites,
  printPrerequisiteWarnings
} from './utils.js';

describe('getPackageManagerCommands', () => {
  it('should return correct commands for npm', () => {
    const result = getPackageManagerCommands('npm');
    expect(result).toEqual({
      pm: 'npm',
      pmx: 'npx',
      pmxArgs: [],
      pmInstall: ['install'],
      pmDev: ['install', '-D'],
      pmRun: 'npm run'
    });
  });

  it('should return correct commands for yarn', () => {
    const result = getPackageManagerCommands('yarn');
    expect(result).toEqual({
      pm: 'yarn',
      pmx: 'yarn',
      pmxArgs: ['dlx'],
      pmInstall: ['add'],
      pmDev: ['add', '-D'],
      pmRun: 'yarn'
    });
  });

  it('should return correct commands for pnpm', () => {
    const result = getPackageManagerCommands('pnpm');
    expect(result).toEqual({
      pm: 'pnpm',
      pmx: 'pnpm',
      pmxArgs: ['dlx'],
      pmInstall: ['add'],
      pmDev: ['add', '-D'],
      pmRun: 'pnpm'
    });
  });

  it('should return correct commands for bun', () => {
    const result = getPackageManagerCommands('bun');
    expect(result).toEqual({
      pm: 'bun',
      pmx: 'bunx',
      pmxArgs: [],
      pmInstall: ['add'],
      pmDev: ['add', '-d'],
      pmRun: 'bun'
    });
  });

  it('should return correct commands for deno', () => {
    const result = getPackageManagerCommands('deno');
    expect(result).toEqual({
      pm: 'deno',
      pmx: 'deno',
      pmxArgs: ['run', '-A', 'npm:'],
      pmInstall: ['add'],
      pmDev: ['add', '--dev'],
      pmRun: 'deno task'
    });
  });
});

describe('getTestingDeps', () => {
  describe('vitest', () => {
    it('should return React testing deps for React framework', () => {
      const result = getTestingDeps('react', ['vitest']);
      expect(result).toContain('vitest');
      expect(result).toContain('jsdom');
      expect(result).toContain('@testing-library/react');
      expect(result).toContain('@testing-library/jest-dom');
    });

    it('should return Vue testing deps for Vue framework', () => {
      const result = getTestingDeps('vue', ['vitest']);
      expect(result).toContain('vitest');
      expect(result).toContain('jsdom');
      expect(result).toContain('@testing-library/vue');
      expect(result).toContain('@testing-library/jest-dom');
      expect(result).not.toContain('@testing-library/react');
    });

    it('should return Svelte testing deps for Svelte framework', () => {
      const result = getTestingDeps('svelte', ['vitest']);
      expect(result).toContain('vitest');
      expect(result).toContain('@testing-library/svelte');
      expect(result).not.toContain('@testing-library/react');
    });

    it('should return Solid testing deps for Solid framework', () => {
      const result = getTestingDeps('solid', ['vitest']);
      expect(result).toContain('vitest');
      expect(result).toContain('solid-testing-library');
      expect(result).not.toContain('@testing-library/react');
    });

    it('should return base vitest deps for Vanilla framework', () => {
      const result = getTestingDeps('vanilla', ['vitest']);
      expect(result).toContain('vitest');
      expect(result).toContain('jsdom');
      expect(result).not.toContain('@testing-library/react');
    });
  });

  describe('jest', () => {
    it('should return Jest deps', () => {
      const result = getTestingDeps('react', ['jest']);
      expect(result).toContain('jest');
      expect(result).toContain('@types/jest');
      expect(result).toContain('ts-jest');
    });
  });

  describe('playwright', () => {
    it('should return Playwright deps', () => {
      const result = getTestingDeps('react', ['playwright']);
      expect(result).toContain('@playwright/test');
    });
  });

  describe('cypress', () => {
    it('should return Cypress deps', () => {
      const result = getTestingDeps('react', ['cypress']);
      expect(result).toContain('cypress');
    });
  });

  describe('multiple testing options', () => {
    it('should return combined deps for multiple options', () => {
      const result = getTestingDeps('react', ['vitest', 'playwright', 'cypress']);
      expect(result).toContain('vitest');
      expect(result).toContain('@testing-library/react');
      expect(result).toContain('@playwright/test');
      expect(result).toContain('cypress');
    });
  });

  describe('empty options', () => {
    it('should return empty array for no testing options', () => {
      const result = getTestingDeps('react', []);
      expect(result).toEqual([]);
    });
  });
});

// Mock execa for checkPrerequisites tests
vi.mock('execa', () => ({
  execa: vi.fn()
}));

describe('checkPrerequisites', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return empty array when all prerequisites are met', async () => {
    const { execa } = await import('execa');
    vi.mocked(execa).mockResolvedValue({} as never);

    const issues = await checkPrerequisites('npm');
    expect(issues).toEqual([]);
  });

  it('should report when package manager is not installed', async () => {
    const { execa } = await import('execa');
    vi.mocked(execa).mockImplementation((async (_cmd: string, args?: readonly string[]) => {
      if (Array.isArray(args) && args[0] === 'pnpm') {
        throw new Error('not found');
      }
      return {};
    }) as typeof execa);

    const issues = await checkPrerequisites('pnpm');
    expect(issues).toContain('pnpm is not installed');
  });

  it('should report when git is not installed', async () => {
    const { execa } = await import('execa');
    vi.mocked(execa).mockImplementation((async (_cmd: string, args?: readonly string[]) => {
      if (Array.isArray(args) && args[0] === 'git') {
        throw new Error('not found');
      }
      return {};
    }) as typeof execa);

    const issues = await checkPrerequisites('npm');
    expect(issues).toContain('git is not installed (required for git init)');
  });
});

describe('printPrerequisiteWarnings', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return false when no issues', () => {
    const result = printPrerequisiteWarnings([]);
    expect(result).toBe(false);
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should return true and log when there are issues', () => {
    const result = printPrerequisiteWarnings(['npm is not installed', 'git is not installed']);
    expect(result).toBe(true);
    expect(console.log).toHaveBeenCalled();
  });

  it('should log each issue', () => {
    const issues = ['Issue 1', 'Issue 2'];
    printPrerequisiteWarnings(issues);
    // console.log is called multiple times: empty line, header, each issue, empty line
    expect(console.log).toHaveBeenCalledTimes(5);
  });
});
