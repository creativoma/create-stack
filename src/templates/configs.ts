/**
 * Configuration file templates for various tools and frameworks
 */

export const postcssConfig = `export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
`;

export function getViteConfig(hasTailwind: boolean): string {
  return hasTailwind
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
}

export const getTsConfig = () => ({
  compilerOptions: {
    target: 'ES2022',
    useDefineForClassFields: true,
    module: 'ESNext',
    lib: ['ES2022', 'DOM', 'DOM.Iterable'],
    types: ['vite/client'],
    skipLibCheck: true,
    moduleResolution: 'bundler' as const,
    allowImportingTsExtensions: true,
    verbatimModuleSyntax: true,
    moduleDetection: 'force' as const,
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
});

export const getShadcnComponentsJson = () => ({
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
});

export const shadcnUtilsTs = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`;

export const tailwindCSS = `@import "tailwindcss";\n`;
