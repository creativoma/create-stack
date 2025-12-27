import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupTesting } from './testing.js';
import type { ExecutionContext } from '../core/ExecutionContext.js';
import type { ProjectConfig } from '../types.js';
import type { Ora } from 'ora';

vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis()
  }))
}));

vi.mock('execa', () => ({
  execa: vi.fn()
}));

const { execa } = await import('execa');

describe('setupTesting', () => {
  let context: ExecutionContext;
  let mockSpinner: Ora;

  beforeEach(() => {
    mockSpinner = {
      start: vi.fn().mockReturnThis(),
      succeed: vi.fn().mockReturnThis(),
      fail: vi.fn().mockReturnThis()
    } as unknown as Ora;

    const baseConfig: ProjectConfig = {
      projectName: 'test-project',
      framework: 'react',
      variant: 'ts',
      metaFramework: 'none',
      packageManager: 'npm',
      styling: 'vanilla',
      ui: [],
      database: 'none',
      animation: [],
      tooling: [],
      testing: [],
      extras: [],
      confirm: true
    };

    context = {
      config: baseConfig,
      pmCommands: {
        pm: 'npm',
        pmx: 'npx',
        pmxArgs: [],
        pmInstall: ['install'],
        pmDev: ['install', '-D'],
        pmRun: 'npm run'
      },
      projectPath: '/test/path',
      spinner: mockSpinner
    };
    vi.clearAllMocks();
  });

  it('should do nothing when no testing libraries selected', async () => {
    await setupTesting(context);
    expect(execa).not.toHaveBeenCalled();
  });

  it('should install vitest for react', async () => {
    context.config.testing = ['vitest'];
    await setupTesting(context);
    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', '-D', 'vitest', 'jsdom', '@testing-library/react', '@testing-library/jest-dom'],
      { stdio: 'pipe' }
    );
  });

  it('should install jest', async () => {
    context.config.testing = ['jest'];
    await setupTesting(context);
    expect(execa).toHaveBeenCalledWith(
      'npm',
      expect.arrayContaining(['install', '-D', 'jest', '@types/jest', 'ts-jest']),
      { stdio: 'pipe' }
    );
  });

  it('should install playwright', async () => {
    context.config.testing = ['playwright'];
    await setupTesting(context);
    expect(execa).toHaveBeenCalledWith('npm', ['install', '-D', '@playwright/test'], {
      stdio: 'pipe'
    });
  });

  it('should install cypress', async () => {
    context.config.testing = ['cypress'];
    await setupTesting(context);
    expect(execa).toHaveBeenCalledWith('npm', ['install', '-D', 'cypress'], { stdio: 'pipe' });
  });

  it('should throw InstallationError on failure', async () => {
    context.config.testing = ['vitest'];
    vi.mocked(execa).mockRejectedValueOnce(new Error('Install failed'));

    await expect(setupTesting(context)).rejects.toThrow();
  });
});
