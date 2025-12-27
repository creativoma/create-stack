import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupTooling } from './tooling.js';
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

vi.mock('fs-extra', () => ({
  default: {
    writeJSON: vi.fn().mockResolvedValue(undefined)
  }
}));

const { execa } = await import('execa');

describe('setupTooling', () => {
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

  it('should do nothing when no tooling selected', async () => {
    await setupTooling(context);
    expect(execa).not.toHaveBeenCalled();
  });

  it('should install prettier with tailwind plugin', async () => {
    context.config.tooling = ['prettier'];
    context.config.styling = 'tailwind';
    await setupTooling(context);
    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', '-D', 'prettier', 'prettier-plugin-tailwindcss'],
      { stdio: 'pipe' }
    );
  });

  it('should install biome', async () => {
    context.config.tooling = ['biome'];
    await setupTooling(context);
    expect(execa).toHaveBeenCalledWith('npm', ['install', '-D', '@biomejs/biome'], {
      stdio: 'pipe'
    });
  });

  it('should install both prettier and biome', async () => {
    context.config.tooling = ['prettier', 'biome'];
    await setupTooling(context);
    expect(execa).toHaveBeenCalledWith('npm', ['install', '-D', 'prettier', '@biomejs/biome'], {
      stdio: 'pipe'
    });
  });

  it('should throw error on installation failure', async () => {
    context.config.tooling = ['prettier'];
    vi.mocked(execa).mockRejectedValueOnce(new Error('Install failed'));

    await expect(setupTooling(context)).rejects.toThrow();
  });
});
