import { describe, it, expect } from 'vitest';
import { getPrompts } from './prompts.js';

describe('getPrompts', () => {
  const prompts = getPrompts();

  it('should return an array of prompts', () => {
    expect(Array.isArray(prompts)).toBe(true);
    expect(prompts.length).toBeGreaterThan(0);
  });

  describe('projectName prompt', () => {
    const projectNamePrompt = prompts.find((p) => p.name === 'projectName');

    it('should exist', () => {
      expect(projectNamePrompt).toBeDefined();
    });

    it('should be a text type', () => {
      expect(projectNamePrompt?.type).toBe('text');
    });

    it('should have a default value', () => {
      expect(projectNamePrompt?.initial).toBe('my-project');
    });

    it('should validate empty values', () => {
      const validate = projectNamePrompt?.validate as (value: string) => string | boolean;
      expect(validate('')).toBe('Project name is required');
    });

    it('should validate invalid characters', () => {
      const validate = projectNamePrompt?.validate as (value: string) => string | boolean;
      expect(validate('my project')).toBe('Only letters, numbers, - and _ allowed');
      expect(validate('my@project')).toBe('Only letters, numbers, - and _ allowed');
    });

    it('should accept valid names', () => {
      const validate = projectNamePrompt?.validate as (value: string) => string | boolean;
      expect(validate('my-project')).toBe(true);
      expect(validate('my_project')).toBe(true);
      expect(validate('MyProject123')).toBe(true);
    });
  });

  describe('framework prompt', () => {
    const frameworkPrompt = prompts.find((p) => p.name === 'framework');

    it('should exist', () => {
      expect(frameworkPrompt).toBeDefined();
    });

    it('should be a select type', () => {
      expect(frameworkPrompt?.type).toBe('select');
    });

    it('should have all framework options', () => {
      const choices = frameworkPrompt?.choices as Array<{ value: string }>;
      const values = choices.map((c) => c.value);
      expect(values).toContain('react');
      expect(values).toContain('vue');
      expect(values).toContain('svelte');
      expect(values).toContain('solid');
      expect(values).toContain('vanilla');
    });
  });

  describe('variant prompt', () => {
    const variantPrompt = prompts.find((p) => p.name === 'variant');

    it('should exist', () => {
      expect(variantPrompt).toBeDefined();
    });

    it('should have TypeScript and JavaScript options', () => {
      const choices = variantPrompt?.choices as Array<{ value: string }>;
      const values = choices.map((c) => c.value);
      expect(values).toContain('ts');
      expect(values).toContain('js');
    });

    it('should default to TypeScript', () => {
      expect(variantPrompt?.initial).toBe(0);
    });
  });

  describe('packageManager prompt', () => {
    const pmPrompt = prompts.find((p) => p.name === 'packageManager');

    it('should exist', () => {
      expect(pmPrompt).toBeDefined();
    });

    it('should have all package manager options', () => {
      const choices = pmPrompt?.choices as Array<{ value: string }>;
      const values = choices.map((c) => c.value);
      expect(values).toContain('npm');
      expect(values).toContain('yarn');
      expect(values).toContain('pnpm');
      expect(values).toContain('bun');
      expect(values).toContain('deno');
    });

    it('should default to pnpm', () => {
      expect(pmPrompt?.initial).toBe(2);
    });
  });

  describe('database prompt', () => {
    const dbPrompt = prompts.find((p) => p.name === 'database');

    it('should exist', () => {
      expect(dbPrompt).toBeDefined();
    });

    it('should be a select type', () => {
      expect(dbPrompt?.type).toBe('select');
    });

    it('should have choices as a function', () => {
      expect(typeof dbPrompt?.choices).toBe('function');
    });

    it('should return database options', () => {
      const choicesFn = dbPrompt?.choices as unknown as (
        prev: unknown,
        values: { metaFramework?: string }
      ) => Array<{ value: string }>;
      const choices = choicesFn(null, { metaFramework: 'nextjs' });
      const values = choices.map((c) => c.value);
      expect(values).toContain('none');
      expect(values).toContain('prisma');
      expect(values).toContain('drizzle');
      expect(values).toContain('supabase');
      expect(values).toContain('mongoose');
      expect(values).toContain('firebase');
    });

    it('should include sqlite for non-serverless frameworks', () => {
      const choicesFn = dbPrompt?.choices as unknown as (
        prev: unknown,
        values: { metaFramework?: string }
      ) => Array<{ value: string }>;
      const choices = choicesFn(null, { metaFramework: 'none' });
      const values = choices.map((c) => c.value);
      expect(values).toContain('sqlite');
    });

    it('should not include sqlite for serverless frameworks', () => {
      const choicesFn = dbPrompt?.choices as unknown as (
        prev: unknown,
        values: { metaFramework?: string }
      ) => Array<{ value: string }>;
      const choices = choicesFn(null, { metaFramework: 'nextjs' });
      const values = choices.map((c) => c.value);
      expect(values).not.toContain('sqlite');
    });
  });

  describe('styling prompt', () => {
    const stylingPrompt = prompts.find((p) => p.name === 'styling');

    it('should exist', () => {
      expect(stylingPrompt).toBeDefined();
    });

    it('should have all styling options', () => {
      const choices = stylingPrompt?.choices as Array<{ value: string }>;
      const values = choices.map((c) => c.value);
      expect(values).toContain('tailwind');
      expect(values).toContain('cssmodules');
      expect(values).toContain('styled');
      expect(values).toContain('unocss');
      expect(values).toContain('vanilla');
    });

    it('should default to Tailwind', () => {
      expect(stylingPrompt?.initial).toBe(0);
    });
  });

  describe('testing prompt', () => {
    const testingPrompt = prompts.find((p) => p.name === 'testing');

    it('should exist', () => {
      expect(testingPrompt).toBeDefined();
    });

    it('should be a multiselect type', () => {
      expect(testingPrompt?.type).toBe('multiselect');
    });

    it('should have all testing options', () => {
      const choices = testingPrompt?.choices as Array<{ value: string }>;
      const values = choices.map((c) => c.value);
      expect(values).toContain('vitest');
      expect(values).toContain('jest');
      expect(values).toContain('playwright');
      expect(values).toContain('cypress');
    });
  });

  describe('confirm prompt', () => {
    const confirmPrompt = prompts.find((p) => p.name === 'confirm');

    it('should exist', () => {
      expect(confirmPrompt).toBeDefined();
    });

    it('should be a confirm type', () => {
      expect(confirmPrompt?.type).toBe('confirm');
    });

    it('should default to true', () => {
      expect(confirmPrompt?.initial).toBe(true);
    });
  });

  describe('metaFramework prompt', () => {
    const metaPrompt = prompts.find((p) => p.name === 'metaFramework');

    it('should exist', () => {
      expect(metaPrompt).toBeDefined();
    });

    it('should be a select type', () => {
      expect(metaPrompt?.type).toBe('select');
    });

    it('should have choices as a function', () => {
      expect(typeof metaPrompt?.choices).toBe('function');
    });

    it('should return React meta-frameworks for React', () => {
      const choicesFn = metaPrompt?.choices as unknown as (
        prev: unknown,
        values: { framework?: string }
      ) => Array<{ value: string }>;
      const choices = choicesFn(null, { framework: 'react' });
      const values = choices.map((c) => c.value);
      expect(values).toContain('none');
      expect(values).toContain('nextjs');
      expect(values).toContain('astro');
      expect(values).toContain('remix');
    });

    it('should return Vue meta-frameworks for Vue', () => {
      const choicesFn = metaPrompt?.choices as unknown as (
        prev: unknown,
        values: { framework?: string }
      ) => Array<{ value: string }>;
      const choices = choicesFn(null, { framework: 'vue' });
      const values = choices.map((c) => c.value);
      expect(values).toContain('none');
      expect(values).toContain('nuxt');
      expect(values).toContain('astro');
      expect(values).not.toContain('nextjs');
    });

    it('should return Svelte meta-frameworks for Svelte', () => {
      const choicesFn = metaPrompt?.choices as unknown as (
        prev: unknown,
        values: { framework?: string }
      ) => Array<{ value: string }>;
      const choices = choicesFn(null, { framework: 'svelte' });
      const values = choices.map((c) => c.value);
      expect(values).toContain('none');
      expect(values).toContain('sveltekit');
      expect(values).toContain('astro');
      expect(values).not.toContain('nextjs');
    });

    it('should return only Astro for other frameworks', () => {
      const choicesFn = metaPrompt?.choices as unknown as (
        prev: unknown,
        values: { framework?: string }
      ) => Array<{ value: string }>;
      const choices = choicesFn(null, { framework: 'solid' });
      const values = choices.map((c) => c.value);
      expect(values).toContain('none');
      expect(values).toContain('astro');
      expect(values).not.toContain('nextjs');
      expect(values).not.toContain('nuxt');
    });
  });

  describe('ui prompt', () => {
    const uiPrompt = prompts.find((p) => p.name === 'ui');

    it('should exist', () => {
      expect(uiPrompt).toBeDefined();
    });

    it('should be a multiselect type', () => {
      expect(uiPrompt?.type).toBe('multiselect');
    });

    it('should have choices as a function', () => {
      expect(typeof uiPrompt?.choices).toBe('function');
    });

    it('should return React UI libraries for React framework', () => {
      const choicesFn = uiPrompt?.choices as unknown as (
        prev: unknown,
        values: { framework?: string; metaFramework?: string }
      ) => Array<{ value: string }>;
      const choices = choicesFn(null, { framework: 'react' });
      const values = choices.map((c) => c.value);
      expect(values).toContain('shadcn');
      expect(values).toContain('radix');
      expect(values).toContain('headless');
      expect(values).toContain('ark');
    });

    it('should return React UI libraries for Next.js meta-framework', () => {
      const choicesFn = uiPrompt?.choices as unknown as (
        prev: unknown,
        values: { framework?: string; metaFramework?: string }
      ) => Array<{ value: string }>;
      const choices = choicesFn(null, { framework: 'vue', metaFramework: 'nextjs' });
      const values = choices.map((c) => c.value);
      expect(values).toContain('shadcn');
      expect(values).toContain('radix');
    });

    it('should return Vue UI libraries for Vue framework', () => {
      const choicesFn = uiPrompt?.choices as unknown as (
        prev: unknown,
        values: { framework?: string; metaFramework?: string }
      ) => Array<{ value: string }>;
      const choices = choicesFn(null, { framework: 'vue' });
      const values = choices.map((c) => c.value);
      expect(values).toContain('headless');
      expect(values).toContain('naive');
      expect(values).toContain('primevue');
      expect(values).not.toContain('shadcn');
    });

    it('should return none option for other frameworks', () => {
      const choicesFn = uiPrompt?.choices as unknown as (
        prev: unknown,
        values: { framework?: string; metaFramework?: string }
      ) => Array<{ value: string }>;
      const choices = choicesFn(null, { framework: 'solid' });
      const values = choices.map((c) => c.value);
      expect(values).toEqual(['none']);
    });
  });
});
