import ora, { type Ora } from 'ora';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';
import { getPackageManagerCommands, getTestingDeps } from './utils.js';
import type {
  ProjectConfig,
  PackageManagerCommands,
  MetaFramework,
  Framework,
  Variant,
  Styling,
  UILibrary,
  Database,
  Animation,
  Tooling,
  Testing,
  Extra
} from './types.js';

interface ScaffoldParams {
  metaFramework: MetaFramework;
  pm: string;
  pmx: string;
  pmxArgs: string[];
  projectName: string;
  framework: Framework;
  variant: Variant;
  styling: Styling;
  spinner: Ora;
}

interface StylingParams {
  styling: Styling;
  metaFramework: MetaFramework;
  pm: string;
  pmDev: string[];
  projectPath: string;
  spinner: Ora;
}

interface UIParams {
  ui: UILibrary[];
  metaFramework: MetaFramework;
  styling: Styling;
  pm: string;
  pmx: string;
  pmxArgs: string[];
  pmDev: string[];
  pmInstall: string[];
  projectPath: string;
  spinner: Ora;
}

interface DatabaseParams {
  database: Database;
  pm: string;
  pmInstall: string[];
  pmDev: string[];
  projectPath: string;
  variant: Variant;
  spinner: Ora;
}

interface AnimationParams {
  animation: Animation[];
  pm: string;
  pmInstall: string[];
  spinner: Ora;
}

interface ToolingParams {
  tooling: Tooling[];
  styling: Styling;
  pm: string;
  pmDev: string[];
  projectPath: string;
  spinner: Ora;
}

interface TestingParams {
  testing: Testing[];
  framework: Framework;
  pm: string;
  pmDev: string[];
  spinner: Ora;
}

interface ExtrasParams {
  extras: Extra[];
  pm: string;
  pmx: string;
  pmxArgs: string[];
  pmDev: string[];
  projectPath: string;
  spinner: Ora;
}

/**
 * Create the project based on user configuration
 */
export async function createProject(config: ProjectConfig): Promise<void> {
  const {
    projectName,
    framework,
    variant,
    metaFramework,
    packageManager,
    styling,
    ui,
    database,
    animation,
    tooling,
    testing,
    extras
  } = config;

  const pmCommands: PackageManagerCommands = getPackageManagerCommands(packageManager);
  const { pm, pmx, pmxArgs, pmInstall, pmDev, pmRun } = pmCommands;
  const projectPath = path.resolve(process.cwd(), projectName);

  // Check if directory exists
  if (fs.existsSync(projectPath)) {
    console.log(pc.red(`\n  Directory ${projectName} already exists!`));
    process.exit(1);
  }

  let spinner = ora('Creating project...').start();

  try {
    // Step 1: Create base project
    await scaffoldProject({
      metaFramework,
      pm,
      pmx,
      pmxArgs,
      projectName,
      framework,
      variant,
      styling,
      spinner
    });
    spinner.succeed('Project scaffolded');

    // Change to project directory
    process.chdir(projectPath);

    // Step 2: Install base dependencies
    spinner = ora('Installing dependencies...').start();
    await execa(pm, ['install'], { stdio: 'pipe' });
    spinner.succeed('Dependencies installed');

    // Step 3: Add styling
    await setupStyling({ styling, metaFramework, pm, pmDev, projectPath, spinner });

    // Step 4: Add UI libraries
    await setupUI({
      ui,
      metaFramework,
      styling,
      pm,
      pmx,
      pmxArgs,
      pmDev,
      pmInstall,
      projectPath,
      spinner
    });

    // Step 5: Add database/ORM
    await setupDatabase({ database, pm, pmInstall, pmDev, projectPath, variant, spinner });

    // Step 6: Add animation libraries
    await setupAnimation({ animation, pm, pmInstall, spinner });

    // Step 7: Add tooling
    await setupTooling({ tooling, styling, pm, pmDev, projectPath, spinner });

    // Step 8: Add testing
    await setupTesting({ testing, framework, pm, pmDev, spinner });

    // Step 9: Extras
    await setupExtras({ extras, pm, pmx, pmxArgs, pmDev, projectPath, spinner });

    // Done!
    printSuccessMessage(projectName, pmRun);
  } catch (error) {
    spinner.fail('Something went wrong');
    if (error instanceof Error) {
      console.error(pc.red(error.message));
      if ('stderr' in error && typeof error.stderr === 'string') {
        console.error(pc.dim(error.stderr));
      }
    }
    process.exit(1);
  }
}

async function scaffoldProject({
  metaFramework,
  pm,
  pmx,
  pmxArgs,
  projectName,
  framework,
  variant,
  styling,
  spinner
}: ScaffoldParams): Promise<void> {
  if (metaFramework !== 'none') {
    spinner.text = `Scaffolding with ${metaFramework}...`;

    switch (metaFramework) {
      case 'nextjs': {
        const nextjsArgs: string[] = [];

        if (pm === 'npm') {
          nextjsArgs.push('create-next-app@latest');
        } else if (pm === 'yarn') {
          nextjsArgs.push('create', 'next-app@latest');
        } else if (pm === 'pnpm') {
          nextjsArgs.push('create', 'next-app@latest');
        } else if (pm === 'bun') {
          nextjsArgs.push('create', 'next-app@latest');
        } else if (pm === 'deno') {
          nextjsArgs.push('run', '-A', 'npm:create-next-app@latest');
        }

        nextjsArgs.push(projectName);
        nextjsArgs.push('--yes');
        nextjsArgs.push('--typescript', '--eslint', '--app', '--src-dir');
        nextjsArgs.push('--turbopack');
        nextjsArgs.push('--disable-git');
        nextjsArgs.push('--skip-install');

        if (styling === 'tailwind') {
          nextjsArgs.push('--tailwind');
        }

        nextjsArgs.push('--import-alias', '@/*');

        const nextjsCmd = pm === 'npm' ? 'npx' : pm === 'deno' ? 'deno' : pm;
        await execa(nextjsCmd, nextjsArgs, { stdio: 'pipe' });
        break;
      }
      case 'astro':
        await execa(
          pm,
          [
            'create',
            'astro@latest',
            projectName,
            '--',
            '--template',
            'minimal',
            '--typescript',
            'strict',
            '--no-git',
            '--no-install'
          ],
          { stdio: 'pipe' }
        );
        break;
      case 'remix':
        await execa(
          pmx,
          [
            ...pmxArgs,
            'create-remix@latest',
            projectName,
            '--typescript',
            '--no-git-init',
            '--no-install'
          ],
          { stdio: 'pipe' }
        );
        break;
      case 'nuxt':
        await execa(pmx, [...pmxArgs, 'nuxi@latest', 'init', projectName, '--no-install'], {
          stdio: 'pipe'
        });
        break;
      case 'sveltekit':
        await execa(
          pm,
          [
            'create',
            'svelte@latest',
            projectName,
            '--',
            '--template',
            'skeleton',
            '--typescript',
            '--no-install'
          ],
          { stdio: 'pipe' }
        );
        break;
    }
  } else {
    spinner.text = `Scaffolding with Vite...`;
    const template = `${framework}${variant === 'ts' ? '-ts' : ''}`;
    if (pm === 'deno') {
      await execa(
        'deno',
        ['run', '-A', 'npm:create-vite@latest', projectName, '--', '--template', template],
        { stdio: 'pipe' }
      );
    } else {
      await execa(pm, ['create', 'vite@latest', projectName, '--', '--template', template], {
        stdio: 'pipe'
      });
    }
  }
}

async function setupStyling({
  styling,
  metaFramework,
  pm,
  pmDev,
  projectPath,
  spinner: _spinner
}: StylingParams): Promise<void> {
  let spinner = _spinner;

  if (styling === 'tailwind' && metaFramework !== 'nextjs') {
    spinner = ora('Setting up Tailwind CSS...').start();

    if (metaFramework === 'none') {
      await execa(pm, [...pmDev, 'tailwindcss', '@tailwindcss/vite'], { stdio: 'pipe' });
    } else {
      await execa(
        pm,
        [...pmDev, 'tailwindcss', '@tailwindcss/postcss', 'postcss', 'autoprefixer'],
        { stdio: 'pipe' }
      );

      await fs.writeFile(
        path.join(projectPath, 'postcss.config.mjs'),
        `export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
`
      );
    }

    // Find and update CSS file
    const cssDir = path.join(projectPath, 'src');
    const possibleCssFiles = ['index.css', 'app.css', 'styles.css', 'global.css'];
    let cssFile: string | null = null;

    for (const filename of possibleCssFiles) {
      const filePath = path.join(cssDir, filename);
      if (await fs.pathExists(filePath)) {
        cssFile = filePath;
        break;
      }
    }

    const tailwindCSS = `@import "tailwindcss";\n`;

    if (cssFile) {
      const existingCSS = await fs.readFile(cssFile, 'utf-8');
      await fs.writeFile(cssFile, tailwindCSS + existingCSS);
    } else {
      await fs.writeFile(path.join(cssDir, 'index.css'), tailwindCSS);
    }

    spinner.succeed('Tailwind CSS configured');
  } else if (styling === 'styled') {
    spinner = ora('Adding Styled Components...').start();
    await execa(pm, [...pmDev.slice(0, -1), 'styled-components'], { stdio: 'pipe' });
    spinner.succeed('Styled Components added');
  } else if (styling === 'unocss') {
    spinner = ora('Adding UnoCSS...').start();
    await execa(pm, [...pmDev, 'unocss'], { stdio: 'pipe' });
    spinner.succeed('UnoCSS added');
  }
}

async function setupUI({
  ui,
  metaFramework,
  styling,
  pm,
  pmx,
  pmxArgs,
  pmDev,
  pmInstall,
  projectPath,
  spinner: _spinner
}: UIParams): Promise<void> {
  if (!ui || ui.length === 0) return;

  const spinner = ora('Adding UI components...').start();
  const uiDeps: string[] = [];

  if (ui.includes('shadcn')) {
    // For Vite projects, configure path aliases BEFORE running shadcn init
    if (metaFramework === 'none') {
      await execa(pm, [...pmDev, '@types/node'], { stdio: 'pipe' });

      const viteConfigPath = path.join(projectPath, 'vite.config.ts');
      if (await fs.pathExists(viteConfigPath)) {
        const hasTailwind = styling === 'tailwind';
        const viteConfig = hasTailwind
          ? `import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
`
          : `import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
`;
        await fs.writeFile(viteConfigPath, viteConfig);
      }

      // Write complete tsconfig.json
      const tsconfigPath = path.join(projectPath, 'tsconfig.json');
      const tsconfig = {
        compilerOptions: {
          target: 'ES2022',
          useDefineForClassFields: true,
          module: 'ESNext',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          types: ['vite/client'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          verbatimModuleSyntax: true,
          moduleDetection: 'force',
          noEmit: true,
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
          baseUrl: '.',
          paths: {
            '@/*': ['./src/*']
          }
        },
        include: ['src']
      };
      await fs.writeJSON(tsconfigPath, tsconfig, { spaces: 2 });

      const tsconfigAppPath = path.join(projectPath, 'tsconfig.app.json');
      if (await fs.pathExists(tsconfigAppPath)) {
        await fs.writeJSON(tsconfigAppPath, tsconfig, { spaces: 2 });
      }
    }

    if (metaFramework === 'nextjs') {
      const shadcnArgs = [
        ...pmxArgs,
        'shadcn@latest',
        'init',
        '--yes',
        '--defaults',
        '--force',
        '--template',
        'next'
      ];
      await execa(pmx, shadcnArgs, { stdio: 'pipe' });
    } else {
      // Manually setup shadcn for Vite/other frameworks
      await execa(
        pm,
        [
          ...pmDev,
          'class-variance-authority',
          'clsx',
          'tailwind-merge',
          'tailwindcss-animate',
          'lucide-react'
        ],
        { stdio: 'pipe' }
      );

      const componentsJson = {
        $schema: 'https://ui.shadcn.com/schema.json',
        style: 'new-york',
        rsc: false,
        tsx: true,
        tailwind: {
          config: '',
          css: 'src/index.css',
          baseColor: 'neutral',
          cssVariables: true,
          prefix: ''
        },
        aliases: {
          components: '@/components',
          utils: '@/lib/utils',
          ui: '@/components/ui',
          lib: '@/lib',
          hooks: '@/hooks'
        },
        iconLibrary: 'lucide'
      };
      await fs.writeJSON(path.join(projectPath, 'components.json'), componentsJson, { spaces: 2 });

      // Create lib/utils.ts
      const libDir = path.join(projectPath, 'src', 'lib');
      await fs.ensureDir(libDir);
      await fs.writeFile(
        path.join(libDir, 'utils.ts'),
        `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`
      );

      await fs.ensureDir(path.join(projectPath, 'src', 'components', 'ui'));
      await fs.ensureDir(path.join(projectPath, 'src', 'hooks'));
    }
  }

  if (ui.includes('radix')) {
    uiDeps.push(
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-slot'
    );
  }
  if (ui.includes('headless')) {
    uiDeps.push('@headlessui/react');
  }
  if (ui.includes('ark')) {
    uiDeps.push('@ark-ui/react');
  }
  if (ui.includes('naive')) {
    uiDeps.push('naive-ui');
  }
  if (ui.includes('primevue')) {
    uiDeps.push('primevue');
  }

  if (uiDeps.length > 0) {
    await execa(pm, [...pmInstall, ...uiDeps], { stdio: 'pipe' });
  }
  spinner.succeed('UI components added');
}

async function setupDatabase({
  database,
  pm,
  pmInstall,
  pmDev,
  projectPath,
  variant,
  spinner: _spinner
}: DatabaseParams): Promise<void> {
  if (!database || database === 'none') return;

  const spinner = ora('Setting up database/ORM...').start();
  const isTs = variant === 'ts';

  try {
    switch (database) {
      case 'prisma': {
        await execa(pm, [...pmDev, 'prisma'], { stdio: 'pipe' });
        await execa(pm, [...pmInstall, '@prisma/client'], { stdio: 'pipe' });

        // Initialize Prisma
        await execa('npx', ['prisma', 'init', '--datasource-provider', 'sqlite'], {
          stdio: 'pipe'
        });

        // Create a basic schema
        const schemaPath = path.join(projectPath, 'prisma', 'schema.prisma');
        await fs.writeFile(
          schemaPath,
          `// Prisma Schema
// https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`
        );

        // Create db helper
        const libDir = path.join(projectPath, 'src', 'lib');
        await fs.ensureDir(libDir);
        const ext = isTs ? 'ts' : 'js';
        await fs.writeFile(
          path.join(libDir, `db.${ext}`),
          `import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis${isTs ? ' as unknown as { prisma: PrismaClient }' : ''}

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
`
        );
        break;
      }

      case 'drizzle': {
        await execa(pm, [...pmDev, 'drizzle-kit'], { stdio: 'pipe' });
        await execa(pm, [...pmInstall, 'drizzle-orm', 'better-sqlite3'], { stdio: 'pipe' });
        if (isTs) {
          await execa(pm, [...pmDev, '@types/better-sqlite3'], { stdio: 'pipe' });
        }

        // Create drizzle config
        await fs.writeFile(
          path.join(projectPath, 'drizzle.config.ts'),
          `import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './sqlite.db',
  },
} satisfies Config
`
        );

        // Create schema and db files
        const dbDir = path.join(projectPath, 'src', 'db');
        await fs.ensureDir(dbDir);

        await fs.writeFile(
          path.join(dbDir, 'schema.ts'),
          `import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
`
        );

        await fs.writeFile(
          path.join(dbDir, 'index.ts'),
          `import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'

const sqlite = new Database('sqlite.db')
export const db = drizzle(sqlite, { schema })
`
        );
        break;
      }

      case 'supabase': {
        await execa(pm, [...pmInstall, '@supabase/supabase-js'], { stdio: 'pipe' });

        const libDir = path.join(projectPath, 'src', 'lib');
        await fs.ensureDir(libDir);
        const ext = isTs ? 'ts' : 'js';

        await fs.writeFile(
          path.join(libDir, `supabase.${ext}`),
          `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL${isTs ? ' as string' : ''}
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY${isTs ? ' as string' : ''}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
`
        );

        // Add env example
        const envPath = path.join(projectPath, '.env.example');
        const envContent = (await fs.pathExists(envPath))
          ? await fs.readFile(envPath, 'utf-8')
          : '';
        await fs.writeFile(
          envPath,
          envContent +
            `
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
`
        );
        break;
      }

      case 'mongoose': {
        await execa(pm, [...pmInstall, 'mongoose'], { stdio: 'pipe' });

        const libDir = path.join(projectPath, 'src', 'lib');
        await fs.ensureDir(libDir);
        const ext = isTs ? 'ts' : 'js';

        await fs.writeFile(
          path.join(libDir, `mongodb.${ext}`),
          `import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp'

${
  isTs
    ? `declare global {
  var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
}

`
    : ''
}let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI)
  }

  cached.conn = await cached.promise
  return cached.conn
}
`
        );
        break;
      }

      case 'firebase': {
        await execa(pm, [...pmInstall, 'firebase'], { stdio: 'pipe' });

        const libDir = path.join(projectPath, 'src', 'lib');
        await fs.ensureDir(libDir);
        const ext = isTs ? 'ts' : 'js';

        await fs.writeFile(
          path.join(libDir, `firebase.${ext}`),
          `import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
`
        );

        // Add env example
        const envPath = path.join(projectPath, '.env.example');
        const envContent = (await fs.pathExists(envPath))
          ? await fs.readFile(envPath, 'utf-8')
          : '';
        await fs.writeFile(
          envPath,
          envContent +
            `
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
`
        );
        break;
      }

      case 'sqlite': {
        await execa(pm, [...pmInstall, 'better-sqlite3'], { stdio: 'pipe' });
        if (isTs) {
          await execa(pm, [...pmDev, '@types/better-sqlite3'], { stdio: 'pipe' });
        }

        const libDir = path.join(projectPath, 'src', 'lib');
        await fs.ensureDir(libDir);
        const ext = isTs ? 'ts' : 'js';

        await fs.writeFile(
          path.join(libDir, `db.${ext}`),
          `import Database from 'better-sqlite3'

export const db = new Database('sqlite.db')

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')
`
        );
        break;
      }
    }

    spinner.succeed(`${database} configured`);
  } catch (error) {
    spinner.fail(`Failed to setup ${database}`);
    throw error;
  }
}

async function setupAnimation({
  animation,
  pm,
  pmInstall,
  spinner: _spinner
}: AnimationParams): Promise<void> {
  if (!animation || animation.length === 0) return;

  const spinner = ora('Adding animation libraries...').start();
  const animDeps: string[] = [];

  if (animation.includes('motion')) animDeps.push('motion');
  if (animation.includes('gsap')) animDeps.push('gsap');
  if (animation.includes('lenis')) animDeps.push('lenis');
  if (animation.includes('autoAnimate')) animDeps.push('@formkit/auto-animate');
  if (animation.includes('animejs')) animDeps.push('animejs');

  if (animDeps.length > 0) {
    await execa(pm, [...pmInstall, ...animDeps], { stdio: 'pipe' });
  }
  spinner.succeed('Animation libraries added');
}

async function setupTooling({
  tooling,
  styling,
  pm,
  pmDev,
  projectPath,
  spinner: _spinner
}: ToolingParams): Promise<void> {
  if (!tooling || tooling.length === 0) return;

  const spinner = ora('Setting up code quality tools...').start();
  const toolDeps: string[] = [];

  if (tooling.includes('prettier')) {
    toolDeps.push('prettier');
    if (styling === 'tailwind') {
      toolDeps.push('prettier-plugin-tailwindcss');
    }
    await fs.writeJSON(
      path.join(projectPath, '.prettierrc'),
      {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
        plugins: styling === 'tailwind' ? ['prettier-plugin-tailwindcss'] : []
      },
      { spaces: 2 }
    );
  }

  if (tooling.includes('biome')) {
    toolDeps.push('@biomejs/biome');
  }

  if (toolDeps.length > 0) {
    await execa(pm, [...pmDev, ...toolDeps], { stdio: 'pipe' });
  }
  spinner.succeed('Code quality tools configured');
}

async function setupTesting({
  testing,
  framework,
  pm,
  pmDev,
  spinner: _spinner
}: TestingParams): Promise<void> {
  if (!testing || testing.length === 0) return;

  const spinner = ora('Setting up testing...').start();
  const testDeps = getTestingDeps(framework, testing);

  if (testDeps.length > 0) {
    await execa(pm, [...pmDev, ...testDeps], { stdio: 'pipe' });
  }
  spinner.succeed('Testing configured');
}

async function setupExtras({
  extras,
  pm,
  pmx,
  pmxArgs,
  pmDev,
  projectPath,
  spinner: _spinner
}: ExtrasParams): Promise<void> {
  if (!extras || extras.length === 0) return;

  const spinner = ora('Adding extras...').start();

  if (extras.includes('git')) {
    await execa('git', ['init'], { stdio: 'pipe' });
    await fs.writeFile(
      path.join(projectPath, '.gitignore'),
      `node_modules
dist
.env
.env.local
.DS_Store
*.log
.vscode/*
!.vscode/extensions.json
*.db
`
    );
  }

  if (extras.includes('husky')) {
    await execa(pm, [...pmDev, 'husky', 'lint-staged'], { stdio: 'pipe' });
    await execa(pmx, [...pmxArgs, 'husky', 'init'], { stdio: 'pipe' });
  }

  if (extras.includes('env')) {
    await fs.writeFile(
      path.join(projectPath, '.env'),
      '# Environment Variables\nDATABASE_URL="file:./dev.db"\n'
    );
    await fs.writeFile(path.join(projectPath, '.env.local'), '# Local Environment Variables\n');

    const envExamplePath = path.join(projectPath, '.env.example');
    const existing = (await fs.pathExists(envExamplePath))
      ? await fs.readFile(envExamplePath, 'utf-8')
      : '';
    if (!existing.includes('DATABASE_URL')) {
      await fs.writeFile(
        envExamplePath,
        '# Example Environment Variables\n# Copy this to .env.local\nDATABASE_URL="file:./dev.db"\n' +
          existing
      );
    }
  }

  if (extras.includes('docker')) {
    await fs.writeFile(
      path.join(projectPath, 'Dockerfile'),
      `FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
`
    );
    await fs.writeFile(
      path.join(projectPath, '.dockerignore'),
      `node_modules
.git
.env*
Dockerfile
.dockerignore
*.db
`
    );
  }

  if (extras.includes('vscode')) {
    await fs.ensureDir(path.join(projectPath, '.vscode'));
    await fs.writeJSON(
      path.join(projectPath, '.vscode', 'extensions.json'),
      {
        recommendations: [
          'dbaeumer.vscode-eslint',
          'esbenp.prettier-vscode',
          'bradlc.vscode-tailwindcss',
          'prisma.prisma'
        ]
      },
      { spaces: 2 }
    );
    await fs.writeJSON(
      path.join(projectPath, '.vscode', 'settings.json'),
      {
        'editor.formatOnSave': true,
        'editor.defaultFormatter': 'esbenp.prettier-vscode',
        'editor.codeActionsOnSave': {
          'source.fixAll.eslint': 'explicit'
        }
      },
      { spaces: 2 }
    );
  }

  spinner.succeed('Extras added');
}

function printSuccessMessage(projectName: string, pmRun: string): void {
  console.log();
  console.log(pc.green('  Done.'));
  console.log();
  console.log(pc.dim('  cd'), projectName);
  console.log(pc.dim('  ' + pmRun), 'dev');
  console.log();
}
