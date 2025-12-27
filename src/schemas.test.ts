import { describe, it, expect } from 'vitest';
import {
  FrameworkSchema,
  VariantSchema,
  MetaFrameworkSchema,
  PackageManagerSchema,
  StylingSchema,
  UILibrarySchema,
  DatabaseSchema,
  AnimationSchema,
  ToolingSchema,
  TestingSchema,
  ExtraSchema,
  ProjectConfigSchema,
  PackageManagerCommandsSchema,
  validateProjectConfig,
  safeValidateProjectConfig,
  validatePackageManagerCommands
} from './schemas.js';

describe('Schemas', () => {
  describe('FrameworkSchema', () => {
    it('should accept valid frameworks', () => {
      expect(FrameworkSchema.parse('react')).toBe('react');
      expect(FrameworkSchema.parse('vue')).toBe('vue');
      expect(FrameworkSchema.parse('svelte')).toBe('svelte');
      expect(FrameworkSchema.parse('solid')).toBe('solid');
      expect(FrameworkSchema.parse('vanilla')).toBe('vanilla');
    });

    it('should reject invalid frameworks', () => {
      expect(() => FrameworkSchema.parse('angular')).toThrow();
    });
  });

  describe('VariantSchema', () => {
    it('should accept valid variants', () => {
      expect(VariantSchema.parse('ts')).toBe('ts');
      expect(VariantSchema.parse('js')).toBe('js');
    });

    it('should reject invalid variants', () => {
      expect(() => VariantSchema.parse('tsx')).toThrow();
    });
  });

  describe('MetaFrameworkSchema', () => {
    it('should accept valid meta-frameworks', () => {
      expect(MetaFrameworkSchema.parse('none')).toBe('none');
      expect(MetaFrameworkSchema.parse('nextjs')).toBe('nextjs');
      expect(MetaFrameworkSchema.parse('astro')).toBe('astro');
      expect(MetaFrameworkSchema.parse('remix')).toBe('remix');
      expect(MetaFrameworkSchema.parse('nuxt')).toBe('nuxt');
      expect(MetaFrameworkSchema.parse('sveltekit')).toBe('sveltekit');
    });

    it('should reject invalid meta-frameworks', () => {
      expect(() => MetaFrameworkSchema.parse('gatsby')).toThrow();
    });
  });

  describe('PackageManagerSchema', () => {
    it('should accept valid package managers', () => {
      expect(PackageManagerSchema.parse('npm')).toBe('npm');
      expect(PackageManagerSchema.parse('yarn')).toBe('yarn');
      expect(PackageManagerSchema.parse('pnpm')).toBe('pnpm');
      expect(PackageManagerSchema.parse('bun')).toBe('bun');
      expect(PackageManagerSchema.parse('deno')).toBe('deno');
    });

    it('should reject invalid package managers', () => {
      expect(() => PackageManagerSchema.parse('pip')).toThrow();
    });
  });

  describe('StylingSchema', () => {
    it('should accept valid styling options', () => {
      expect(StylingSchema.parse('tailwind')).toBe('tailwind');
      expect(StylingSchema.parse('cssmodules')).toBe('cssmodules');
      expect(StylingSchema.parse('styled')).toBe('styled');
      expect(StylingSchema.parse('unocss')).toBe('unocss');
      expect(StylingSchema.parse('vanilla')).toBe('vanilla');
    });

    it('should reject invalid styling options', () => {
      expect(() => StylingSchema.parse('sass')).toThrow();
    });
  });

  describe('UILibrarySchema', () => {
    it('should accept valid UI libraries', () => {
      expect(UILibrarySchema.parse('shadcn')).toBe('shadcn');
      expect(UILibrarySchema.parse('radix')).toBe('radix');
      expect(UILibrarySchema.parse('headless')).toBe('headless');
      expect(UILibrarySchema.parse('ark')).toBe('ark');
      expect(UILibrarySchema.parse('naive')).toBe('naive');
      expect(UILibrarySchema.parse('primevue')).toBe('primevue');
      expect(UILibrarySchema.parse('none')).toBe('none');
    });

    it('should reject invalid UI libraries', () => {
      expect(() => UILibrarySchema.parse('material-ui')).toThrow();
    });
  });

  describe('DatabaseSchema', () => {
    it('should accept valid databases', () => {
      expect(DatabaseSchema.parse('none')).toBe('none');
      expect(DatabaseSchema.parse('prisma')).toBe('prisma');
      expect(DatabaseSchema.parse('drizzle')).toBe('drizzle');
      expect(DatabaseSchema.parse('supabase')).toBe('supabase');
      expect(DatabaseSchema.parse('mongoose')).toBe('mongoose');
      expect(DatabaseSchema.parse('firebase')).toBe('firebase');
      expect(DatabaseSchema.parse('sqlite')).toBe('sqlite');
    });

    it('should reject invalid databases', () => {
      expect(() => DatabaseSchema.parse('mongodb')).toThrow();
    });
  });

  describe('AnimationSchema', () => {
    it('should accept valid animation libraries', () => {
      expect(AnimationSchema.parse('motion')).toBe('motion');
      expect(AnimationSchema.parse('gsap')).toBe('gsap');
      expect(AnimationSchema.parse('lenis')).toBe('lenis');
      expect(AnimationSchema.parse('autoAnimate')).toBe('autoAnimate');
      expect(AnimationSchema.parse('animejs')).toBe('animejs');
    });

    it('should reject invalid animation libraries', () => {
      expect(() => AnimationSchema.parse('framer-motion')).toThrow();
    });
  });

  describe('ToolingSchema', () => {
    it('should accept valid tooling options', () => {
      expect(ToolingSchema.parse('eslint')).toBe('eslint');
      expect(ToolingSchema.parse('prettier')).toBe('prettier');
      expect(ToolingSchema.parse('biome')).toBe('biome');
    });

    it('should reject invalid tooling options', () => {
      expect(() => ToolingSchema.parse('tslint')).toThrow();
    });
  });

  describe('TestingSchema', () => {
    it('should accept valid testing frameworks', () => {
      expect(TestingSchema.parse('vitest')).toBe('vitest');
      expect(TestingSchema.parse('jest')).toBe('jest');
      expect(TestingSchema.parse('playwright')).toBe('playwright');
      expect(TestingSchema.parse('cypress')).toBe('cypress');
    });

    it('should reject invalid testing frameworks', () => {
      expect(() => TestingSchema.parse('mocha')).toThrow();
    });
  });

  describe('ExtraSchema', () => {
    it('should accept valid extras', () => {
      expect(ExtraSchema.parse('git')).toBe('git');
      expect(ExtraSchema.parse('husky')).toBe('husky');
      expect(ExtraSchema.parse('docker')).toBe('docker');
      expect(ExtraSchema.parse('env')).toBe('env');
      expect(ExtraSchema.parse('vscode')).toBe('vscode');
    });

    it('should reject invalid extras', () => {
      expect(() => ExtraSchema.parse('ci')).toThrow();
    });
  });

  describe('ProjectConfigSchema', () => {
    const validConfig = {
      projectName: 'test-project',
      framework: 'react',
      variant: 'ts',
      metaFramework: 'none',
      packageManager: 'npm',
      styling: 'tailwind',
      ui: ['shadcn'],
      database: 'none',
      animation: ['motion'],
      tooling: ['eslint'],
      testing: ['vitest'],
      extras: ['git'],
      confirm: true
    };

    it('should accept valid project config', () => {
      expect(ProjectConfigSchema.parse(validConfig)).toEqual(validConfig);
    });

    it('should reject empty project name', () => {
      const config = { ...validConfig, projectName: '' };
      expect(() => ProjectConfigSchema.parse(config)).toThrow('Project name cannot be empty');
    });

    it('should reject invalid project name with special characters', () => {
      const config = { ...validConfig, projectName: 'test@project!' };
      expect(() => ProjectConfigSchema.parse(config)).toThrow(
        'Project name must contain only alphanumeric characters, dashes, and underscores'
      );
    });

    it('should accept project name with dashes and underscores', () => {
      const config = { ...validConfig, projectName: 'test-project_123' };
      expect(ProjectConfigSchema.parse(config).projectName).toBe('test-project_123');
    });

    it('should reject missing required fields', () => {
      const { framework: _framework, ...configWithoutFramework } = validConfig;
      expect(() => ProjectConfigSchema.parse(configWithoutFramework)).toThrow();
    });

    it('should accept empty arrays for optional multi-select fields', () => {
      const config = {
        ...validConfig,
        ui: [],
        animation: [],
        tooling: [],
        testing: [],
        extras: []
      };
      expect(ProjectConfigSchema.parse(config)).toEqual(config);
    });
  });

  describe('PackageManagerCommandsSchema', () => {
    const validCommands = {
      pm: 'npm',
      pmx: 'npx',
      pmxArgs: [],
      pmInstall: ['install'],
      pmDev: ['install', '-D'],
      pmRun: 'npm run'
    };

    it('should accept valid package manager commands', () => {
      expect(PackageManagerCommandsSchema.parse(validCommands)).toEqual(validCommands);
    });

    it('should reject invalid pm value', () => {
      const commands = { ...validCommands, pm: 'invalid' };
      expect(() => PackageManagerCommandsSchema.parse(commands)).toThrow();
    });

    it('should reject missing required fields', () => {
      const { pm: _pm, ...commandsWithoutPm } = validCommands;
      expect(() => PackageManagerCommandsSchema.parse(commandsWithoutPm)).toThrow();
    });
  });

  describe('validateProjectConfig', () => {
    it('should return parsed config on success', () => {
      const config = {
        projectName: 'test-project',
        framework: 'react',
        variant: 'ts',
        metaFramework: 'none',
        packageManager: 'npm',
        styling: 'tailwind',
        ui: [],
        database: 'none',
        animation: [],
        tooling: [],
        testing: [],
        extras: [],
        confirm: true
      };
      expect(validateProjectConfig(config)).toEqual(config);
    });

    it('should throw on invalid config', () => {
      expect(() => validateProjectConfig({})).toThrow();
    });
  });

  describe('safeValidateProjectConfig', () => {
    it('should return success result on valid config', () => {
      const config = {
        projectName: 'test-project',
        framework: 'react',
        variant: 'ts',
        metaFramework: 'none',
        packageManager: 'npm',
        styling: 'tailwind',
        ui: [],
        database: 'none',
        animation: [],
        tooling: [],
        testing: [],
        extras: [],
        confirm: true
      };
      const result = safeValidateProjectConfig(config);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(config);
      }
    });

    it('should return error result on invalid config', () => {
      const result = safeValidateProjectConfig({});
      expect(result.success).toBe(false);
    });
  });

  describe('validatePackageManagerCommands', () => {
    it('should return parsed commands on success', () => {
      const commands = {
        pm: 'npm',
        pmx: 'npx',
        pmxArgs: [],
        pmInstall: ['install'],
        pmDev: ['install', '-D'],
        pmRun: 'npm run'
      };
      expect(validatePackageManagerCommands(commands)).toEqual(commands);
    });

    it('should throw on invalid commands', () => {
      expect(() => validatePackageManagerCommands({})).toThrow();
    });
  });
});
