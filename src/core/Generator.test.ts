import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeneratorRegistry, globalRegistry } from './Generator.js';
import type { Generator } from './Generator.js';
import type { ExecutionContext } from './ExecutionContext.js';
import type { ProjectConfig } from '../types.js';
import type { Ora } from 'ora';

describe('GeneratorRegistry', () => {
  let registry: GeneratorRegistry;
  let mockGenerator: Generator;
  let context: ExecutionContext;

  beforeEach(() => {
    registry = new GeneratorRegistry();

    mockGenerator = {
      name: 'test-generator',
      description: 'Test generator description',
      execute: vi.fn(),
      shouldRun: vi.fn(() => true)
    };

    const config: ProjectConfig = {
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
      config,
      pmCommands: {
        pm: 'npm',
        pmx: 'npx',
        pmxArgs: [],
        pmInstall: ['install'],
        pmDev: ['install', '-D'],
        pmRun: 'npm run'
      },
      projectPath: '/test/path',
      spinner: {
        start: vi.fn().mockReturnThis(),
        succeed: vi.fn().mockReturnThis(),
        fail: vi.fn().mockReturnThis()
      } as unknown as Ora
    };
  });

  describe('register', () => {
    it('should register a new generator', () => {
      registry.register(mockGenerator);
      expect(registry.get('test-generator')).toBe(mockGenerator);
    });

    it('should throw error when registering duplicate generator', () => {
      registry.register(mockGenerator);
      expect(() => registry.register(mockGenerator)).toThrow(
        'Generator "test-generator" is already registered'
      );
    });

    it('should allow registering multiple different generators', () => {
      const generator2 = {
        ...mockGenerator,
        name: 'another-generator'
      };

      registry.register(mockGenerator);
      registry.register(generator2);

      expect(registry.get('test-generator')).toBe(mockGenerator);
      expect(registry.get('another-generator')).toBe(generator2);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no generators registered', () => {
      expect(registry.getAll()).toEqual([]);
    });

    it('should return all registered generators', () => {
      const generator2 = {
        ...mockGenerator,
        name: 'another-generator'
      };

      registry.register(mockGenerator);
      registry.register(generator2);

      const all = registry.getAll();
      expect(all).toHaveLength(2);
      expect(all).toContain(mockGenerator);
      expect(all).toContain(generator2);
    });
  });

  describe('get', () => {
    it('should return generator by name', () => {
      registry.register(mockGenerator);
      expect(registry.get('test-generator')).toBe(mockGenerator);
    });

    it('should return undefined for non-existent generator', () => {
      expect(registry.get('non-existent')).toBeUndefined();
    });
  });

  describe('executeAll', () => {
    it('should execute all generators that should run', async () => {
      const generator2 = {
        name: 'another-generator',
        description: 'Another test generator',
        execute: vi.fn(),
        shouldRun: vi.fn(() => true)
      };

      registry.register(mockGenerator);
      registry.register(generator2);

      await registry.executeAll(context);

      expect(mockGenerator.shouldRun).toHaveBeenCalledWith(context);
      expect(mockGenerator.execute).toHaveBeenCalledWith(context);
      expect(generator2.shouldRun).toHaveBeenCalledWith(context);
      expect(generator2.execute).toHaveBeenCalledWith(context);
    });

    it('should skip generators that should not run', async () => {
      const generator2 = {
        name: 'skip-generator',
        description: 'Generator that should be skipped',
        execute: vi.fn(),
        shouldRun: vi.fn(() => false)
      };

      registry.register(mockGenerator);
      registry.register(generator2);

      await registry.executeAll(context);

      expect(mockGenerator.execute).toHaveBeenCalledWith(context);
      expect(generator2.shouldRun).toHaveBeenCalledWith(context);
      expect(generator2.execute).not.toHaveBeenCalled();
    });

    it('should execute generators in order', async () => {
      const executionOrder: string[] = [];

      const generator1 = {
        name: 'first',
        description: 'First generator',
        execute: vi.fn(async () => {
          executionOrder.push('first');
        }),
        shouldRun: () => true
      };

      const generator2 = {
        name: 'second',
        description: 'Second generator',
        execute: vi.fn(async () => {
          executionOrder.push('second');
        }),
        shouldRun: () => true
      };

      registry.register(generator1);
      registry.register(generator2);

      await registry.executeAll(context);

      expect(executionOrder).toEqual(['first', 'second']);
    });

    it('should handle no generators', async () => {
      await expect(registry.executeAll(context)).resolves.not.toThrow();
    });

    it('should propagate errors from generators', async () => {
      const error = new Error('Generator failed');
      mockGenerator.execute = vi.fn().mockRejectedValue(error);

      registry.register(mockGenerator);

      await expect(registry.executeAll(context)).rejects.toThrow('Generator failed');
    });
  });

  describe('globalRegistry', () => {
    it('should be an instance of GeneratorRegistry', () => {
      expect(globalRegistry).toBeInstanceOf(GeneratorRegistry);
    });
  });
});
