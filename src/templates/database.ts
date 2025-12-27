/**
 * Database and ORM template files
 */

export const prismaSchema = `// Prisma Schema
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
`;

export function getPrismaClient(isTs: boolean): string {
  return `import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis${isTs ? ' as unknown as { prisma: PrismaClient }' : ''}

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
`;
}

export const drizzleConfig = `import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: './sqlite.db',
  },
} satisfies Config
`;

export const drizzleSchema = `import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
`;

export const drizzleIndex = `import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'

const sqlite = new Database('sqlite.db')
export const db = drizzle(sqlite, { schema })
`;

export function getSupabaseClient(isTs: boolean): string {
  const typeAnnotation = isTs ? ' as string' : '';
  return `import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL${typeAnnotation}
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY${typeAnnotation}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
`;
}

export const supabaseEnv = `
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
`;

export function getMongooseConnection(isTs: boolean): string {
  return `import mongoose from 'mongoose'

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
`;
}

export function getFirebaseConfig(_isTs: boolean): string {
  return `import { initializeApp } from 'firebase/app'
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
`;
}

export const firebaseEnv = `
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
`;

export function getSqliteClient(_isTs: boolean): string {
  return `import Database from 'better-sqlite3'

export const db = new Database('sqlite.db')

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')
`;
}
