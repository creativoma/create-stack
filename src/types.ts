export type Framework = 'react' | 'vue' | 'svelte' | 'solid' | 'vanilla';
export type Variant = 'ts' | 'js';
export type MetaFramework = 'none' | 'nextjs' | 'astro' | 'remix' | 'nuxt' | 'sveltekit';
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun' | 'deno';
export type Styling = 'tailwind' | 'cssmodules' | 'styled' | 'unocss' | 'vanilla';
export type UILibrary = 'shadcn' | 'radix' | 'headless' | 'ark' | 'naive' | 'primevue' | 'none';
export type Database =
  | 'none'
  | 'prisma'
  | 'drizzle'
  | 'supabase'
  | 'mongoose'
  | 'firebase'
  | 'sqlite';
export type Animation = 'motion' | 'gsap' | 'lenis' | 'autoAnimate' | 'animejs';
export type Tooling = 'eslint' | 'prettier' | 'biome';
export type Testing = 'vitest' | 'jest' | 'playwright' | 'cypress';
export type Extra = 'git' | 'husky' | 'docker' | 'env' | 'vscode';

export interface ProjectConfig {
  projectName: string;
  framework: Framework;
  variant: Variant;
  metaFramework: MetaFramework;
  packageManager: PackageManager;
  styling: Styling;
  ui: UILibrary[];
  database: Database;
  animation: Animation[];
  tooling: Tooling[];
  testing: Testing[];
  extras: Extra[];
  confirm: boolean;
}

export interface PackageManagerCommands {
  pm: PackageManager;
  pmx: string;
  pmxArgs: string[];
  pmInstall: string[];
  pmDev: string[];
  pmRun: string;
}
