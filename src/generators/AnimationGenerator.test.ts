import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnimationGenerator } from './AnimationGenerator.js';
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

describe('AnimationGenerator', () => {
  let generator: AnimationGenerator;
  let context: ExecutionContext;
  let mockSpinner: Ora;

  beforeEach(() => {
    generator = new AnimationGenerator();

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

  describe('properties', () => {
    it('should have correct name and description', () => {
      expect(generator.name).toBe('animation');
      expect(generator.description).toBe('Animation libraries (Motion, GSAP, Lenis, etc.)');
    });
  });

  describe('shouldRun', () => {
    it('should return false when animation array is empty', () => {
      expect(generator.shouldRun(context)).toBe(false);
    });

    it('should return false when animation is undefined', () => {
      (context.config as { animation?: string[] }).animation = undefined;
      expect(generator.shouldRun(context)).toBeFalsy();
    });

    it('should return true when animation array has items', () => {
      context.config.animation = ['motion'];
      expect(generator.shouldRun(context)).toBe(true);
    });

    it('should return true when animation array has multiple items', () => {
      context.config.animation = ['motion', 'gsap'];
      expect(generator.shouldRun(context)).toBe(true);
    });
  });

  describe('execute', () => {
    it('should return early when animation array is empty', async () => {
      await generator.execute(context);
      expect(execa).not.toHaveBeenCalled();
    });

    it('should return early when animation is undefined', async () => {
      (context.config as { animation?: string[] }).animation = undefined;
      await generator.execute(context);
      expect(execa).not.toHaveBeenCalled();
    });

    it('should install motion library', async () => {
      context.config.animation = ['motion'];
      await generator.execute(context);
      expect(execa).toHaveBeenCalledWith('npm', ['install', 'motion'], { stdio: 'pipe' });
    });

    it('should install gsap library', async () => {
      context.config.animation = ['gsap'];
      await generator.execute(context);
      expect(execa).toHaveBeenCalledWith('npm', ['install', 'gsap'], { stdio: 'pipe' });
    });

    it('should install lenis library', async () => {
      context.config.animation = ['lenis'];
      await generator.execute(context);
      expect(execa).toHaveBeenCalledWith('npm', ['install', 'lenis'], { stdio: 'pipe' });
    });

    it('should install autoAnimate library', async () => {
      context.config.animation = ['autoAnimate'];
      await generator.execute(context);
      expect(execa).toHaveBeenCalledWith('npm', ['install', '@formkit/auto-animate'], {
        stdio: 'pipe'
      });
    });

    it('should install animejs library', async () => {
      context.config.animation = ['animejs'];
      await generator.execute(context);
      expect(execa).toHaveBeenCalledWith('npm', ['install', 'animejs'], { stdio: 'pipe' });
    });

    it('should install multiple animation libraries', async () => {
      context.config.animation = ['motion', 'gsap', 'lenis'];
      await generator.execute(context);
      expect(execa).toHaveBeenCalledWith('npm', ['install', 'motion', 'gsap', 'lenis'], {
        stdio: 'pipe'
      });
    });

    it('should install all animation libraries when all selected', async () => {
      context.config.animation = ['motion', 'gsap', 'lenis', 'autoAnimate', 'animejs'];
      await generator.execute(context);
      expect(execa).toHaveBeenCalledWith(
        'npm',
        ['install', 'motion', 'gsap', 'lenis', '@formkit/auto-animate', 'animejs'],
        { stdio: 'pipe' }
      );
    });

    it('should handle empty deps array gracefully', async () => {
      context.config.animation = [];
      await generator.execute(context);
      expect(execa).not.toHaveBeenCalled();
    });

    it('should throw InstallationError on failure', async () => {
      context.config.animation = ['motion'];
      vi.mocked(execa).mockRejectedValueOnce(new Error('Install failed'));

      await expect(generator.execute(context)).rejects.toThrow();
    });

    it('should use correct package manager from context', async () => {
      context.pmCommands.pm = 'pnpm';
      context.pmCommands.pmInstall = ['add'];
      context.config.animation = ['motion'];

      await generator.execute(context);

      expect(execa).toHaveBeenCalledWith('pnpm', ['add', 'motion'], { stdio: 'pipe' });
    });
  });
});
