import ora from 'ora';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import type { ExecutionContext } from '../core/ExecutionContext.js';
import { InstallationError } from '../core/errors.js';
import {
  prismaSchema,
  getPrismaClient,
  drizzleConfig,
  drizzleSchema,
  drizzleIndex,
  getSupabaseClient,
  supabaseEnv,
  getMongooseConnection,
  getFirebaseConfig,
  firebaseEnv,
  getSqliteClient
} from '../templates/database.js';

/**
 * Sets up database and ORM based on user configuration
 *
 * @param context - Execution context containing project configuration and state
 * @throws {InstallationError} When package installation fails
 * @throws {FileOperationError} When file operations fail
 */
export async function setupDatabase(context: ExecutionContext): Promise<void> {
  const { config, pmCommands, projectPath } = context;
  const { database, variant } = config;
  const { pm, pmInstall, pmDev } = pmCommands;

  if (!database || database === 'none') return;

  const spinner = ora('Setting up database/ORM...').start();
  const isTs = variant === 'ts';

  try {
    switch (database) {
      case 'prisma':
        await setupPrisma(pm, pmInstall, pmDev, projectPath, isTs);
        break;
      case 'drizzle':
        await setupDrizzle(pm, pmInstall, pmDev, projectPath, isTs);
        break;
      case 'supabase':
        await setupSupabase(pm, pmInstall, projectPath, isTs);
        break;
      case 'mongoose':
        await setupMongoose(pm, pmInstall, projectPath, isTs);
        break;
      case 'firebase':
        await setupFirebase(pm, pmInstall, projectPath, isTs);
        break;
      case 'sqlite':
        await setupSqlite(pm, pmInstall, pmDev, projectPath, isTs);
        break;
    }

    spinner.succeed(`${database} configured`);
  } catch (error) {
    spinner.fail(`Failed to setup ${database}`);
    throw error;
  }
}

/**
 * Sets up Prisma ORM
 */
async function setupPrisma(
  pm: string,
  pmInstall: string[],
  pmDev: string[],
  projectPath: string,
  isTs: boolean
): Promise<void> {
  try {
    await execa(pm, [...pmDev, 'prisma'], { stdio: 'pipe' });
    await execa(pm, [...pmInstall, '@prisma/client'], { stdio: 'pipe' });

    await execa('npx', ['prisma', 'init', '--datasource-provider', 'sqlite'], {
      stdio: 'pipe'
    });

    const schemaPath = path.join(projectPath, 'prisma', 'schema.prisma');
    await fs.writeFile(schemaPath, prismaSchema);

    const libDir = path.join(projectPath, 'src', 'lib');
    await fs.ensureDir(libDir);
    const ext = isTs ? 'ts' : 'js';
    await fs.writeFile(path.join(libDir, `db.${ext}`), getPrismaClient(isTs));
  } catch (error) {
    throw new InstallationError('prisma', 'Failed to setup Prisma', error);
  }
}

/**
 * Sets up Drizzle ORM
 */
async function setupDrizzle(
  pm: string,
  pmInstall: string[],
  pmDev: string[],
  projectPath: string,
  isTs: boolean
): Promise<void> {
  try {
    await execa(pm, [...pmDev, 'drizzle-kit'], { stdio: 'pipe' });
    await execa(pm, [...pmInstall, 'drizzle-orm', 'better-sqlite3'], { stdio: 'pipe' });

    if (isTs) {
      await execa(pm, [...pmDev, '@types/better-sqlite3'], { stdio: 'pipe' });
    }

    await fs.writeFile(path.join(projectPath, 'drizzle.config.ts'), drizzleConfig);

    const dbDir = path.join(projectPath, 'src', 'db');
    await fs.ensureDir(dbDir);

    await fs.writeFile(path.join(dbDir, 'schema.ts'), drizzleSchema);
    await fs.writeFile(path.join(dbDir, 'index.ts'), drizzleIndex);
  } catch (error) {
    throw new InstallationError('drizzle', 'Failed to setup Drizzle', error);
  }
}

/**
 * Sets up Supabase client
 */
async function setupSupabase(
  pm: string,
  pmInstall: string[],
  projectPath: string,
  isTs: boolean
): Promise<void> {
  try {
    await execa(pm, [...pmInstall, '@supabase/supabase-js'], { stdio: 'pipe' });

    const libDir = path.join(projectPath, 'src', 'lib');
    await fs.ensureDir(libDir);
    const ext = isTs ? 'ts' : 'js';

    await fs.writeFile(path.join(libDir, `supabase.${ext}`), getSupabaseClient(isTs));

    await appendToEnvExample(projectPath, supabaseEnv);
  } catch (error) {
    throw new InstallationError('supabase', 'Failed to setup Supabase', error);
  }
}

/**
 * Sets up Mongoose for MongoDB
 */
async function setupMongoose(
  pm: string,
  pmInstall: string[],
  projectPath: string,
  isTs: boolean
): Promise<void> {
  try {
    await execa(pm, [...pmInstall, 'mongoose'], { stdio: 'pipe' });

    const libDir = path.join(projectPath, 'src', 'lib');
    await fs.ensureDir(libDir);
    const ext = isTs ? 'ts' : 'js';

    await fs.writeFile(path.join(libDir, `mongodb.${ext}`), getMongooseConnection(isTs));
  } catch (error) {
    throw new InstallationError('mongoose', 'Failed to setup Mongoose', error);
  }
}

/**
 * Sets up Firebase
 */
async function setupFirebase(
  pm: string,
  pmInstall: string[],
  projectPath: string,
  isTs: boolean
): Promise<void> {
  try {
    await execa(pm, [...pmInstall, 'firebase'], { stdio: 'pipe' });

    const libDir = path.join(projectPath, 'src', 'lib');
    await fs.ensureDir(libDir);
    const ext = isTs ? 'ts' : 'js';

    await fs.writeFile(path.join(libDir, `firebase.${ext}`), getFirebaseConfig(isTs));

    await appendToEnvExample(projectPath, firebaseEnv);
  } catch (error) {
    throw new InstallationError('firebase', 'Failed to setup Firebase', error);
  }
}

/**
 * Sets up SQLite with better-sqlite3
 */
async function setupSqlite(
  pm: string,
  pmInstall: string[],
  pmDev: string[],
  projectPath: string,
  isTs: boolean
): Promise<void> {
  try {
    await execa(pm, [...pmInstall, 'better-sqlite3'], { stdio: 'pipe' });

    if (isTs) {
      await execa(pm, [...pmDev, '@types/better-sqlite3'], { stdio: 'pipe' });
    }

    const libDir = path.join(projectPath, 'src', 'lib');
    await fs.ensureDir(libDir);
    const ext = isTs ? 'ts' : 'js';

    await fs.writeFile(path.join(libDir, `db.${ext}`), getSqliteClient(isTs));
  } catch (error) {
    throw new InstallationError('sqlite', 'Failed to setup SQLite', error);
  }
}

/**
 * Appends content to .env.example file
 */
async function appendToEnvExample(projectPath: string, content: string): Promise<void> {
  const envPath = path.join(projectPath, '.env.example');
  const envContent = (await fs.pathExists(envPath)) ? await fs.readFile(envPath, 'utf-8') : '';
  await fs.writeFile(envPath, envContent + content);
}
