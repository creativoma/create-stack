import { z } from 'zod';

/**
 * Zod schemas for runtime validation of project configuration
 */

export const FrameworkSchema = z.enum(['react', 'vue', 'svelte', 'solid', 'vanilla']);

export const VariantSchema = z.enum(['ts', 'js']);

export const MetaFrameworkSchema = z.enum([
  'none',
  'nextjs',
  'astro',
  'remix',
  'nuxt',
  'sveltekit'
]);

export const PackageManagerSchema = z.enum(['npm', 'yarn', 'pnpm', 'bun', 'deno']);

export const StylingSchema = z.enum(['tailwind', 'cssmodules', 'styled', 'unocss', 'vanilla']);

export const UILibrarySchema = z.enum([
  'shadcn',
  'radix',
  'headless',
  'ark',
  'naive',
  'primevue',
  'none'
]);

export const DatabaseSchema = z.enum([
  'none',
  'prisma',
  'drizzle',
  'supabase',
  'mongoose',
  'firebase',
  'sqlite'
]);

export const AnimationSchema = z.enum(['motion', 'gsap', 'lenis', 'autoAnimate', 'animejs']);

export const ToolingSchema = z.enum(['eslint', 'prettier', 'biome']);

export const TestingSchema = z.enum(['vitest', 'jest', 'playwright', 'cypress']);

export const ExtraSchema = z.enum(['git', 'husky', 'docker', 'env', 'vscode']);

/**
 * Complete project configuration schema
 */
export const ProjectConfigSchema = z.object({
  projectName: z
    .string()
    .min(1, 'Project name cannot be empty')
    .regex(
      /^[a-z0-9-_]+$/i,
      'Project name must contain only alphanumeric characters, dashes, and underscores'
    ),
  framework: FrameworkSchema,
  variant: VariantSchema,
  metaFramework: MetaFrameworkSchema,
  packageManager: PackageManagerSchema,
  styling: StylingSchema,
  ui: z.array(UILibrarySchema),
  database: DatabaseSchema,
  animation: z.array(AnimationSchema),
  tooling: z.array(ToolingSchema),
  testing: z.array(TestingSchema),
  extras: z.array(ExtraSchema),
  confirm: z.boolean()
});

/**
 * Package manager commands schema
 */
export const PackageManagerCommandsSchema = z.object({
  pm: PackageManagerSchema,
  pmx: z.string(),
  pmxArgs: z.array(z.string()),
  pmInstall: z.array(z.string()),
  pmDev: z.array(z.string()),
  pmRun: z.string()
});

/**
 * Validates project configuration
 * @throws {z.ZodError} When validation fails with detailed error information
 */
export function validateProjectConfig(config: unknown) {
  return ProjectConfigSchema.parse(config);
}

/**
 * Safe validation that returns result object
 */
export function safeValidateProjectConfig(config: unknown) {
  return ProjectConfigSchema.safeParse(config);
}

/**
 * Validates package manager commands
 */
export function validatePackageManagerCommands(commands: unknown) {
  return PackageManagerCommandsSchema.parse(commands);
}
