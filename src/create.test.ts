import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ProjectConfig } from './types.js';

// Mock all external dependencies before importing
vi.mock('ora', () => {
  const createMockSpinner = () => {
    const spinner = {
      start: vi.fn(() => spinner),
      succeed: vi.fn(() => spinner),
      fail: vi.fn(() => spinner),
      text: ''
    };
    return spinner;
  };
  return {
    default: vi.fn(() => createMockSpinner())
  };
});

vi.mock('execa', () => ({
  execa: vi.fn().mockResolvedValue({ stdout: '', stderr: '' })
}));

vi.mock('fs-extra', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(false),
    pathExists: vi.fn().mockResolvedValue(false),
    writeFile: vi.fn().mockResolvedValue(undefined),
    writeJSON: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(''),
    ensureDir: vi.fn().mockResolvedValue(undefined)
  }
}));

vi.mock('picocolors', () => ({
  default: {
    red: (s: string) => s,
    green: (s: string) => s,
    dim: (s: string) => s
  }
}));

describe('createProject', () => {
  let originalChdir: typeof process.chdir;
  let originalExit: typeof process.exit;
  let originalCwd: typeof process.cwd;

  beforeEach(() => {
    vi.resetAllMocks();

    originalChdir = process.chdir;
    originalExit = process.exit;
    originalCwd = process.cwd;

    process.chdir = vi.fn();
    process.exit = vi.fn() as never;
    process.cwd = vi.fn().mockReturnValue('/test');

    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.chdir = originalChdir;
    process.exit = originalExit;
    process.cwd = originalCwd;
    vi.restoreAllMocks();
  });

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

  it('should exit if directory already exists', async () => {
    const fs = await import('fs-extra');
    vi.mocked(fs.default.existsSync).mockReturnValue(true);

    const { createProject } = await import('./create.js');
    await createProject(baseConfig);

    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should scaffold a Vite project when metaFramework is none', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject(baseConfig);

    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['create', 'vite@latest', 'test-project', '--', '--template', 'react-ts'],
      expect.any(Object)
    );
  });

  it('should scaffold a Next.js project', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      metaFramework: 'nextjs'
    });

    expect(execa).toHaveBeenCalledWith(
      'npx',
      expect.arrayContaining(['create-next-app@latest', 'test-project']),
      expect.any(Object)
    );
  });

  it('should setup Tailwind CSS for Vite projects', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      styling: 'tailwind'
    });

    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', '-D', 'tailwindcss', '@tailwindcss/vite'],
      expect.any(Object)
    );
  });

  it('should setup Styled Components', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      styling: 'styled'
    });

    expect(execa).toHaveBeenCalledWith('npm', ['install', 'styled-components'], expect.any(Object));
  });

  it('should setup UnoCSS', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      styling: 'unocss'
    });

    expect(execa).toHaveBeenCalledWith('npm', ['install', '-D', 'unocss'], expect.any(Object));
  });

  it('should add Radix UI dependencies', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      ui: ['radix']
    });

    expect(execa).toHaveBeenCalledWith(
      'npm',
      [
        'install',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-tooltip',
        '@radix-ui/react-slot'
      ],
      expect.any(Object)
    );
  });

  it('should add Headless UI dependencies', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      ui: ['headless']
    });

    expect(execa).toHaveBeenCalledWith('npm', ['install', '@headlessui/react'], expect.any(Object));
  });

  it('should setup Prisma database', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');
    const fs = await import('fs-extra');

    await createProject({
      ...baseConfig,
      database: 'prisma'
    });

    expect(execa).toHaveBeenCalledWith('npm', ['install', '-D', 'prisma'], expect.any(Object));
    expect(execa).toHaveBeenCalledWith('npm', ['install', '@prisma/client'], expect.any(Object));
    expect(fs.default.writeFile).toHaveBeenCalled();
  });

  it('should setup Drizzle database', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      database: 'drizzle'
    });

    expect(execa).toHaveBeenCalledWith('npm', ['install', '-D', 'drizzle-kit'], expect.any(Object));
    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', 'drizzle-orm', 'better-sqlite3'],
      expect.any(Object)
    );
  });

  it('should setup Supabase', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      database: 'supabase'
    });

    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', '@supabase/supabase-js'],
      expect.any(Object)
    );
  });

  it('should setup Mongoose', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      database: 'mongoose'
    });

    expect(execa).toHaveBeenCalledWith('npm', ['install', 'mongoose'], expect.any(Object));
  });

  it('should setup Firebase', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      database: 'firebase'
    });

    expect(execa).toHaveBeenCalledWith('npm', ['install', 'firebase'], expect.any(Object));
  });

  it('should setup SQLite', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      database: 'sqlite'
    });

    expect(execa).toHaveBeenCalledWith('npm', ['install', 'better-sqlite3'], expect.any(Object));
  });

  it('should add animation libraries', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      animation: ['motion', 'gsap', 'lenis']
    });

    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', 'motion', 'gsap', 'lenis'],
      expect.any(Object)
    );
  });

  it('should setup Prettier', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');
    const fs = await import('fs-extra');

    await createProject({
      ...baseConfig,
      tooling: ['prettier']
    });

    expect(execa).toHaveBeenCalledWith('npm', ['install', '-D', 'prettier'], expect.any(Object));
    expect(fs.default.writeJSON).toHaveBeenCalled();
  });

  it('should setup Prettier with Tailwind plugin when Tailwind is used', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      styling: 'tailwind',
      tooling: ['prettier']
    });

    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', '-D', 'prettier', 'prettier-plugin-tailwindcss'],
      expect.any(Object)
    );
  });

  it('should setup Biome', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      tooling: ['biome']
    });

    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', '-D', '@biomejs/biome'],
      expect.any(Object)
    );
  });

  it('should setup testing with Vitest', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      testing: ['vitest']
    });

    expect(execa).toHaveBeenCalledWith(
      'npm',
      expect.arrayContaining(['install', '-D', 'vitest']),
      expect.any(Object)
    );
  });

  it('should setup Git when git extra is selected', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');
    const fs = await import('fs-extra');

    await createProject({
      ...baseConfig,
      extras: ['git']
    });

    expect(execa).toHaveBeenCalledWith('git', ['init'], expect.any(Object));
    expect(fs.default.writeFile).toHaveBeenCalled();
  });

  it('should setup Husky when husky extra is selected', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      extras: ['husky']
    });

    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', '-D', 'husky', 'lint-staged'],
      expect.any(Object)
    );
  });

  it('should setup Docker when docker extra is selected', async () => {
    const { createProject } = await import('./create.js');
    const fs = await import('fs-extra');

    await createProject({
      ...baseConfig,
      extras: ['docker']
    });

    expect(fs.default.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('Dockerfile'),
      expect.stringContaining('FROM node:20-alpine')
    );
    expect(fs.default.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.dockerignore'),
      expect.any(String)
    );
  });

  it('should setup env files when env extra is selected', async () => {
    const { createProject } = await import('./create.js');
    const fs = await import('fs-extra');

    await createProject({
      ...baseConfig,
      extras: ['env']
    });

    expect(fs.default.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.env'),
      expect.any(String)
    );
  });

  it('should setup VSCode settings when vscode extra is selected', async () => {
    const { createProject } = await import('./create.js');
    const fs = await import('fs-extra');

    await createProject({
      ...baseConfig,
      extras: ['vscode']
    });

    expect(fs.default.ensureDir).toHaveBeenCalledWith(expect.stringContaining('.vscode'));
    expect(fs.default.writeJSON).toHaveBeenCalled();
  });

  it('should print success message after project creation', async () => {
    const { createProject } = await import('./create.js');

    await createProject(baseConfig);

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Done'));
  });

  it('should handle errors and exit with code 1', async () => {
    const { execa } = await import('execa');
    vi.mocked(execa).mockRejectedValueOnce(new Error('Command failed'));

    const { createProject } = await import('./create.js');

    await createProject(baseConfig);

    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should scaffold with pnpm package manager', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      packageManager: 'pnpm'
    });

    expect(execa).toHaveBeenCalledWith(
      'pnpm',
      ['create', 'vite@latest', 'test-project', '--', '--template', 'react-ts'],
      expect.any(Object)
    );
  });

  it('should scaffold with yarn package manager', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      packageManager: 'yarn'
    });

    expect(execa).toHaveBeenCalledWith(
      'yarn',
      ['create', 'vite@latest', 'test-project', '--', '--template', 'react-ts'],
      expect.any(Object)
    );
  });

  it('should scaffold with bun package manager', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      packageManager: 'bun'
    });

    expect(execa).toHaveBeenCalledWith(
      'bun',
      ['create', 'vite@latest', 'test-project', '--', '--template', 'react-ts'],
      expect.any(Object)
    );
  });

  it('should scaffold with deno package manager', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      packageManager: 'deno'
    });

    expect(execa).toHaveBeenCalledWith(
      'deno',
      ['run', '-A', 'npm:create-vite@latest', 'test-project', '--', '--template', 'react-ts'],
      expect.any(Object)
    );
  });

  it('should scaffold JavaScript variant', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      variant: 'js'
    });

    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['create', 'vite@latest', 'test-project', '--', '--template', 'react'],
      expect.any(Object)
    );
  });

  it('should scaffold Astro meta-framework', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      metaFramework: 'astro'
    });

    expect(execa).toHaveBeenCalledWith(
      'npm',
      expect.arrayContaining(['create', 'astro@latest', 'test-project']),
      expect.any(Object)
    );
  });

  it('should scaffold Remix meta-framework', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      metaFramework: 'remix'
    });

    expect(execa).toHaveBeenCalledWith(
      'npx',
      expect.arrayContaining(['create-remix@latest', 'test-project']),
      expect.any(Object)
    );
  });

  it('should scaffold Nuxt meta-framework', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      framework: 'vue',
      metaFramework: 'nuxt'
    });

    expect(execa).toHaveBeenCalledWith(
      'npx',
      expect.arrayContaining(['nuxi@latest', 'init', 'test-project']),
      expect.any(Object)
    );
  });

  it('should scaffold SvelteKit meta-framework', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      framework: 'svelte',
      metaFramework: 'sveltekit'
    });

    expect(execa).toHaveBeenCalledWith(
      'npm',
      expect.arrayContaining(['create', 'svelte@latest', 'test-project']),
      expect.any(Object)
    );
  });

  it('should add Ark UI dependencies', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      ui: ['ark']
    });

    expect(execa).toHaveBeenCalledWith('npm', ['install', '@ark-ui/react'], expect.any(Object));
  });

  it('should add auto-animate animation library', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      animation: ['autoAnimate']
    });

    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', '@formkit/auto-animate'],
      expect.any(Object)
    );
  });

  it('should add animejs animation library', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      animation: ['animejs']
    });

    expect(execa).toHaveBeenCalledWith('npm', ['install', 'animejs'], expect.any(Object));
  });

  it('should add Naive UI dependencies for Vue', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      framework: 'vue',
      ui: ['naive']
    });

    expect(execa).toHaveBeenCalledWith('npm', ['install', 'naive-ui'], expect.any(Object));
  });

  it('should add PrimeVue dependencies for Vue', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      framework: 'vue',
      ui: ['primevue']
    });

    expect(execa).toHaveBeenCalledWith('npm', ['install', 'primevue'], expect.any(Object));
  });

  it('should setup shadcn for Vite React projects', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');
    const fs = await import('fs-extra');

    vi.mocked(fs.default.pathExists).mockResolvedValue(true as never);

    await createProject({
      ...baseConfig,
      styling: 'tailwind',
      ui: ['shadcn']
    });

    // Should install shadcn dependencies
    expect(execa).toHaveBeenCalledWith(
      'npm',
      expect.arrayContaining([
        'install',
        '-D',
        'class-variance-authority',
        'clsx',
        'tailwind-merge'
      ]),
      expect.any(Object)
    );

    // Should create components.json
    expect(fs.default.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('components.json'),
      expect.objectContaining({ style: 'new-york' }),
      expect.any(Object)
    );

    // Should create lib/utils.ts
    expect(fs.default.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('utils.ts'),
      expect.stringContaining('cn(')
    );

    // Should create directories for components and hooks
    expect(fs.default.ensureDir).toHaveBeenCalledWith(expect.stringContaining('components/ui'));
    expect(fs.default.ensureDir).toHaveBeenCalledWith(expect.stringContaining('hooks'));
  });

  it('should handle database setup error', async () => {
    const { execa } = await import('execa');

    // Make prisma install fail
    vi.mocked(execa).mockImplementation((async (_cmd: string, args?: readonly string[]) => {
      if (Array.isArray(args) && args.includes('prisma')) {
        throw new Error('Failed to install prisma');
      }
      return { stdout: '', stderr: '' };
    }) as typeof execa);

    const { createProject } = await import('./create.js');

    await createProject({
      ...baseConfig,
      database: 'prisma'
    });

    // Should exit with error code 1
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('should setup Tailwind for meta-frameworks other than Next.js', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');
    const fs = await import('fs-extra');

    await createProject({
      ...baseConfig,
      metaFramework: 'remix',
      styling: 'tailwind'
    });

    // Should install postcss dependencies for non-Vite meta-frameworks
    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', '-D', 'tailwindcss', '@tailwindcss/postcss', 'postcss', 'autoprefixer'],
      expect.any(Object)
    );

    // Should create postcss.config.mjs
    expect(fs.default.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('postcss.config.mjs'),
      expect.stringContaining('@tailwindcss/postcss')
    );
  });

  it('should install types for better-sqlite3 in TypeScript projects with Drizzle', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      variant: 'ts',
      database: 'drizzle'
    });

    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', '-D', '@types/better-sqlite3'],
      expect.any(Object)
    );
  });

  it('should install types for better-sqlite3 in TypeScript projects with SQLite', async () => {
    const { createProject } = await import('./create.js');
    const { execa } = await import('execa');

    await createProject({
      ...baseConfig,
      variant: 'ts',
      database: 'sqlite'
    });

    expect(execa).toHaveBeenCalledWith(
      'npm',
      ['install', '-D', '@types/better-sqlite3'],
      expect.any(Object)
    );
  });
});
