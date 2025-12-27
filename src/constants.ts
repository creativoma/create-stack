import gradient from 'gradient-string';
import pc from 'picocolors';

export const VERSION = '1.0.0';

export const coolGradient = gradient(['#4ade80', '#22d3ee', '#a78bfa']);

export const BANNER = `
${coolGradient('  ██████╗██████╗ ███████╗ █████╗ ████████╗███████╗')}
${coolGradient('  ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝')}
${coolGradient('  ██║     ██████╔╝█████╗  ███████║   ██║   █████╗  ')}
${coolGradient('  ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══╝  ')}
${coolGradient('  ╚██████╗██║  ██║███████╗██║  ██║   ██║   ███████╗')}
${coolGradient('   ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝')}
${coolGradient('           ███████╗████████╗ █████╗  ██████╗██╗  ██╗')}
${coolGradient('           ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝')}
${coolGradient('           ███████╗   ██║   ███████║██║     █████╔╝ ')}
${coolGradient('           ╚════██║   ██║   ██╔══██║██║     ██╔═██╗ ')}
${coolGradient('           ███████║   ██║   ██║  ██║╚██████╗██║  ██╗')}
${coolGradient('           ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝')}

${pc.dim('  Build your perfect project stack')}
`;

export const HELP_TEXT = `
${pc.bold('create-stack')} - Interactive CLI to scaffold your perfect project stack

${pc.bold('USAGE')}
  npx create-stack
  pnpm create stack
  yarn create stack
  bun create stack
  deno run -A npm:create-stack

${pc.bold('OPTIONS')}
  -h, --help      Show this help message
  -v, --version   Show version number

${pc.bold('FEATURES')}
  Frameworks       React, Vue, Svelte, Solid, Vanilla
  Meta-frameworks  Next.js, Nuxt, SvelteKit, Astro, Remix
  Styling          Tailwind CSS, CSS Modules, Styled Components, UnoCSS
  UI Libraries     shadcn/ui, Radix, Headless UI, Ark UI
  Database/ORM     Prisma, Drizzle, Supabase, MongoDB, Firebase
  Testing          Vitest, Jest, Playwright, Cypress
  Extras           Git, Husky, Docker, ESLint, Prettier
`;
