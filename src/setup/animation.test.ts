import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupAnimation } from './animation.js';
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

describe('setupAnimation', () => {
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

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should do nothing when no animation libraries selected', async () => {
    await setupAnimation(context);
    expect(execa).not.toHaveBeenCalled();
  });

  it('should install motion library', async () => {
    context.config.animation = ['motion'];
    await setupAnimation(context);
    expect(execa).toHaveBeenCalledWith('npm', ['install', 'motion'], { stdio: 'pipe' });
  });

  it('should install gsap library', async () => {
    context.config.animation = ['gsap'];
    await setupAnimation(context);
    expect(execa).toHaveBeenCalledWith('npm', ['install', 'gsap'], { stdio: 'pipe' });
  });

  it('should install lenis library', async () => {
    context.config.animation = ['lenis'];
    await setupAnimation(context);
    expect(execa).toHaveBeenCalledWith('npm', ['install', 'lenis'], { stdio: 'pipe' });
  });

  it('should install autoAnimate library', async () => {
    context.config.animation = ['autoAnimate'];
    await setupAnimation(context);
    expect(execa).toHaveBeenCalledWith('npm', ['install', '@formkit/auto-animate'], {
      stdio: 'pipe'
    });
  });

  it('should install animejs library', async () => {
    context.config.animation = ['animejs'];
    await setupAnimation(context);
    expect(execa).toHaveBeenCalledWith('npm', ['install', 'animejs'], { stdio: 'pipe' });
  });

  it('should install multiple animation libraries', async () => {
    context.config.animation = ['motion', 'gsap', 'lenis'];
    await setupAnimation(context);
    expect(execa).toHaveBeenCalledWith('npm', ['install', 'motion', 'gsap', 'lenis'], {
      stdio: 'pipe'
    });
  });

  it('should throw InstallationError on failure', async () => {
    context.config.animation = ['motion'];
    vi.mocked(execa).mockRejectedValueOnce(new Error('Install failed'));

    await expect(setupAnimation(context)).rejects.toThrow();
  });
});
