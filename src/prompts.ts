import pc from 'picocolors';
import type { PromptObject } from 'prompts';
import type { ProjectConfig } from './types.js';

type PromptAnswers = Partial<ProjectConfig>;

/**
 * All prompts configuration for the CLI
 */
export function getPrompts(): PromptObject<keyof ProjectConfig>[] {
  return [
    {
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-project',
      validate: (value: string) => {
        if (!value) return 'Project name is required';
        if (!/^[a-z0-9-_]+$/i.test(value)) return 'Only letters, numbers, - and _ allowed';
        return true;
      }
    },
    {
      type: 'select',
      name: 'framework',
      message: 'Framework:',
      choices: [
        { title: 'React', value: 'react' },
        { title: 'Vue', value: 'vue' },
        { title: 'Svelte', value: 'svelte' },
        { title: 'Solid', value: 'solid' },
        { title: 'Vanilla', value: 'vanilla' }
      ],
      initial: 0
    },
    {
      type: 'select',
      name: 'variant',
      message: 'Language:',
      choices: [
        { title: 'TypeScript', value: 'ts' },
        { title: 'JavaScript', value: 'js' }
      ],
      initial: 0
    },
    {
      type: 'select',
      name: 'metaFramework',
      message: 'Meta-framework:',
      choices: (_: unknown, values: PromptAnswers) => {
        const base = [{ title: pc.dim('None (Vite only)'), value: 'none' }];

        if (values.framework === 'react') {
          return [
            ...base,
            { title: 'Next.js', value: 'nextjs' },
            { title: 'Astro', value: 'astro' },
            { title: 'Remix', value: 'remix' }
          ];
        }
        if (values.framework === 'vue') {
          return [...base, { title: 'Nuxt', value: 'nuxt' }, { title: 'Astro', value: 'astro' }];
        }
        if (values.framework === 'svelte') {
          return [
            ...base,
            { title: 'SvelteKit', value: 'sveltekit' },
            { title: 'Astro', value: 'astro' }
          ];
        }
        return [...base, { title: 'Astro', value: 'astro' }];
      },
      initial: 0
    },
    {
      type: 'select',
      name: 'packageManager',
      message: 'Package manager:',
      choices: [
        { title: 'npm', value: 'npm' },
        { title: 'yarn', value: 'yarn' },
        { title: 'pnpm', value: 'pnpm' },
        { title: 'bun', value: 'bun' },
        { title: 'deno', value: 'deno' }
      ],
      initial: 2
    },
    {
      type: 'select',
      name: 'styling',
      message: 'Styling:',
      choices: [
        { title: 'Tailwind CSS', value: 'tailwind' },
        { title: 'CSS Modules', value: 'cssmodules' },
        { title: 'Styled Components', value: 'styled' },
        { title: 'UnoCSS', value: 'unocss' },
        { title: pc.dim('None'), value: 'vanilla' }
      ],
      initial: 0
    },
    {
      type: 'multiselect',
      name: 'ui',
      message: 'UI Components:',
      choices: (_: unknown, values: PromptAnswers) => {
        if (values.framework === 'react' || values.metaFramework === 'nextjs') {
          return [
            { title: 'shadcn/ui', value: 'shadcn' },
            { title: 'Radix UI', value: 'radix' },
            { title: 'Headless UI', value: 'headless' },
            { title: 'Ark UI', value: 'ark' }
          ];
        }
        if (values.framework === 'vue') {
          return [
            { title: 'Headless UI', value: 'headless' },
            { title: 'Naive UI', value: 'naive' },
            { title: 'PrimeVue', value: 'primevue' }
          ];
        }
        return [{ title: pc.dim('None'), value: 'none' }];
      },
      hint: 'Space to select, Enter to confirm'
    },
    {
      type: 'select',
      name: 'database',
      message: 'Database/ORM:',
      choices: (_: unknown, values: PromptAnswers) => {
        const choices = [
          { title: pc.dim('None'), value: 'none' },
          { title: 'Prisma', value: 'prisma' },
          { title: 'Drizzle', value: 'drizzle' },
          { title: 'Supabase', value: 'supabase' },
          { title: 'Mongoose', value: 'mongoose' },
          { title: 'Firebase', value: 'firebase' }
        ];

        if (values.metaFramework === 'none' || values.metaFramework === 'remix') {
          choices.splice(3, 0, { title: 'SQLite', value: 'sqlite' });
        }

        return choices;
      },
      initial: 0
    },
    {
      type: 'multiselect',
      name: 'animation',
      message: 'Animation:',
      choices: [
        { title: 'Motion', value: 'motion' },
        { title: 'GSAP', value: 'gsap' },
        { title: 'Lenis', value: 'lenis' },
        { title: 'Auto Animate', value: 'autoAnimate' },
        { title: 'Anime.js', value: 'animejs' }
      ],
      hint: 'Space to select, Enter to confirm'
    },
    {
      type: 'multiselect',
      name: 'tooling',
      message: 'Code quality:',
      choices: [
        { title: 'ESLint', value: 'eslint', selected: true },
        { title: 'Prettier', value: 'prettier', selected: true },
        { title: 'Biome', value: 'biome' }
      ],
      hint: 'Space to select, Enter to confirm'
    },
    {
      type: 'multiselect',
      name: 'testing',
      message: 'Testing:',
      choices: [
        { title: 'Vitest', value: 'vitest' },
        { title: 'Jest', value: 'jest' },
        { title: 'Playwright', value: 'playwright' },
        { title: 'Cypress', value: 'cypress' }
      ],
      hint: 'Space to select, Enter to confirm'
    },
    {
      type: 'multiselect',
      name: 'extras',
      message: 'Extras:',
      choices: [
        { title: 'Git', value: 'git', selected: true },
        { title: 'Husky', value: 'husky' },
        { title: 'Docker', value: 'docker' },
        { title: '.env', value: 'env' },
        { title: 'VSCode', value: 'vscode' }
      ],
      hint: 'Space to select, Enter to confirm'
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Create project?',
      initial: true
    }
  ];
}
