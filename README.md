# @creativoma/create-stack

**Interactive CLI to scaffold modern web projects with your preferred technology stack**

```
 ██████╗██████╗ ███████╗ █████╗ ████████╗███████╗
██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝
██║     ██████╔╝█████╗  ███████║   ██║   █████╗
██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══╝
╚██████╗██║  ██║███████╗██║  ██║   ██║   ███████╗
 ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

███████╗████████╗ █████╗  ██████╗██╗  ██╗
██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
███████╗   ██║   ███████║██║     █████╔╝
╚════██║   ██║   ██╔══██║██║     ██╔═██╗
███████║   ██║   ██║  ██║╚██████╗██║  ██╗
╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
```

[![npm version](https://img.shields.io/npm/v/@creativoma/create-stack.svg)](https://www.npmjs.com/package/@creativoma/create-stack)
[![license](https://img.shields.io/npm/l/@creativoma/create-stack.svg)](https://github.com/creativoma/create-stack/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/@creativoma/create-stack.svg)](https://nodejs.org)

## Quick Start

Choose your preferred package manager:

```bash
# npm
npx @creativoma/create-stack

# pnpm
pnpm dlx @creativoma/create-stack

# yarn
yarn dlx @creativoma/create-stack

# bun
bunx @creativoma/create-stack

# deno
deno run -A npm:@creativoma/create-stack
```

> **Requirements:** Node.js 22+

## Why create-stack?

Unlike single-purpose generators (create-react-app, create-next-app), create-stack offers:

- **Complete stack composition:** Framework + styling + database + tooling in one pass
- **Framework agnostic:** React, Vue, Svelte, Solid, or Vanilla - your choice
- **Production-ready configs:** Pre-configured TypeScript, ESLint, testing, and Docker setups
- **Package manager aware:** Detects and uses your preferred manager (npm/pnpm/yarn/bun)
- **Type-safe architecture:** Built with strict TypeScript and custom error handling
- **Well-tested:** 90%+ test coverage ensures reliability

## Supported Technologies

| Category | Options |
|----------|---------|
| **Frameworks** | React, Vue, Svelte, Solid, Vanilla |
| **Meta-frameworks** | Next.js, Nuxt, SvelteKit, Astro, Remix |
| **Styling** | Tailwind CSS, CSS Modules, Styled Components, UnoCSS |
| **UI Components** | shadcn/ui, Radix UI, Headless UI, Ark UI, Naive UI, PrimeVue |
| **Database / ORM** | Prisma, Drizzle, Supabase, Mongoose, Firebase, SQLite |
| **Animation** | Motion, GSAP, Lenis, Auto Animate, Anime.js |
| **Code Quality** | ESLint, Prettier, Biome |
| **Testing** | Vitest, Jest, Playwright, Cypress |
| **Extras** | Git initialization, Husky hooks, Docker, Environment files, VSCode settings |

## Technical Highlights

### Clean Architecture
- **SOLID principles:** Single responsibility modules, dependency inversion via ExecutionContext pattern
- **Custom error hierarchy:** Type-safe error handling with rich context (ScaffoldingError, InstallationError, etc.)
- **Zero parameter drilling:** ExecutionContext eliminates passing 7-10 parameters through function chains
- **Template system:** Configuration generation separated from business logic

### Code Quality
- **Strict TypeScript:** Full type coverage, no implicit any, proper null checks
- **90%+ test coverage:** Comprehensive unit tests with success/error path coverage
- **ESLint + Prettier:** Enforced code style and quality standards
- **Modular design:** No circular dependencies, setup modules are independent

### Developer Experience
- **Interactive prompts:** Validates inputs, provides sensible defaults
- **Package manager detection:** Auto-detects npm/pnpm/yarn/bun from lock files
- **Rich feedback:** Spinner animations and colored output for visual progress
- **Error recovery:** Detailed error messages with context for troubleshooting

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete architectural documentation.

## Usage Examples

### Basic project with React + Tailwind
```bash
npx @creativoma/create-stack
# Select: React → Tailwind CSS → No database → Skip extras
```

### Full-stack Next.js with Prisma
```bash
npx @creativoma/create-stack
# Select: Next.js → Tailwind + shadcn/ui → Prisma → Docker + Git + Husky
```

### Vue 3 with Supabase backend
```bash
npx @creativoma/create-stack
# Select: Vue → UnoCSS → Supabase → Vitest
```

## CLI Options

```bash
create-stack --help     # Display help information
create-stack --version  # Show installed version
```

No configuration file support yet - all options are interactive prompts.

## Development

### Prerequisites
- Node.js 22 or higher
- pnpm (recommended) or npm

### Setup
```bash
git clone https://github.com/creativoma/create-stack.git
cd create-stack
pnpm install
```

### Available Commands
```bash
pnpm dev              # Build and run CLI locally
pnpm build            # Compile TypeScript to dist/
pnpm test             # Run test suite
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Generate coverage report
pnpm lint             # Check code style
pnpm lint:fix         # Auto-fix linting issues
pnpm typecheck        # Verify TypeScript types
```

### Testing Locally
```bash
pnpm dev
# Or after building:
node dist/index.js
```

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code style guidelines
- Testing requirements
- Pull request process
- Development workflow

## Architecture

This project follows SOLID principles with a modular architecture:
- **ExecutionContext pattern** for dependency injection
- **Custom error types** for type-safe error handling
- **Template system** for configuration generation
- **Independent setup modules** for each feature category

For detailed architectural documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
