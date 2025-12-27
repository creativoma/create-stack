# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-27

### Major Release - Professional Architecture Overhaul

This release represents a complete architectural refactoring following SOLID principles, clean code practices, and professional development standards.

### Added

- **Zod Validation**: Runtime type validation for all user configuration
- **Custom Error Hierarchy**: Type-safe error handling with specific error classes
  - `CreateStackError` (base class)
  - `ScaffoldingError`
  - `InstallationError`
  - `FileOperationError`
  - `CommandExecutionError`
  - `ConfigurationError`
- **ExecutionContext Pattern**: Centralized dependency injection eliminating parameter drilling
- **Strategy Pattern**: Extensible generator system for adding new features
  - `Generator` interface
  - `GeneratorRegistry` for managing generators
  - Example `AnimationGenerator` implementation
- **Template System**: Extracted all configuration templates to dedicated modules
  - `templates/configs.ts` - Vite, TSConfig, shadcn configs
  - `templates/database.ts` - Database schemas and clients
  - `templates/docker.ts` - Docker and environment files
  - `templates/deployment.ts` - Vercel, Netlify, Render, Cloudflare configs
- **Comprehensive Documentation**:
  - `ARCHITECTURE.md` (297 lines) - Complete system architecture guide
  - `CONTRIBUTING.md` (454 lines) - Professional contribution guidelines
- **Enhanced Testing**:
  - 164 tests (40+ new tests added)
  - 100% coverage on utils.ts
  - 100% coverage on core/errors.ts
  - Tests for all setup modules
  - No `any` types or type assertions in tests
- **JSDoc Documentation**: Complete JSDoc for all public functions
- **Webpack Support**: Basic Webpack configuration template
- **Deployment Configs**: Templates for Vercel, Netlify, Render, Cloudflare

### Changed

- **BREAKING**: Complete refactoring of internal architecture
- **Code Organization**:
  - Reduced `create.ts` from 1,063 lines to 95 lines (91% reduction)
  - Split into 8 focused setup modules (`src/setup/`)
  - Added core infrastructure (`src/core/`)
  - Organized templates (`src/templates/`)
- **Error Handling**: Replaced generic errors with type-safe custom error classes
- **Parameter Passing**: Replaced 7-10 parameter functions with single ExecutionContext
- **Test Quality**: Eliminated all `any` types and type assertions from tests
- **Package.json**: Reorganized in professional order
- **Coverage**: Improved from 88% to 93% overall coverage

### Improved

- **SOLID Principles**:
  - Single Responsibility: Each module has one clear purpose
  - Open/Closed: Extensible without modification via generators
  - Interface Segregation: Clean, minimal interfaces
  - Dependency Inversion: Abstractions over concrete implementations
- **Code Quality**: Score improved from 6/10 to 9/10
- **Maintainability**: Modular structure makes additions/changes easier
- **Type Safety**: Full TypeScript strict mode compliance
- **Linting**: Zero warnings or errors
- **Testing**: Comprehensive test coverage with proper mocking

### Technical Details

**New File Structure**:
```
src/
├── core/
│   ├── ExecutionContext.ts  # Dependency injection
│   ├── errors.ts            # Error hierarchy
│   └── Generator.ts         # Strategy pattern
├── setup/                   # Feature modules
│   ├── animation.ts
│   ├── database.ts
│   ├── extras.ts
│   ├── scaffold.ts
│   ├── styling.ts
│   ├── testing.ts
│   ├── tooling.ts
│   └── ui.ts
├── templates/               # Configuration templates
│   ├── configs.ts
│   ├── database.ts
│   ├── deployment.ts
│   └── docker.ts
├── generators/              # Strategy implementations
│   └── AnimationGenerator.ts
└── schemas.ts               # Zod validation schemas
```

**Dependencies**:
- Added: `zod` ^4.2.1 for runtime validation

**Metrics**:
- Test Files: 8
- Total Tests: 164 (from 124)
- Code Coverage: 92.87% (from 88%)
- Lines of Code: ~2,500 (better organized)
- Documentation: 751 lines of professional docs

### Migration Guide

This is a major version bump due to internal restructuring. While the CLI interface remains the same for users, anyone importing internal modules will need to update imports:

**Before**:
```typescript
import { createProject } from '@creativoma/create-stack/dist/create.js';
```

**After**:
```typescript
import { createProject } from '@creativoma/create-stack/dist/create.js'; // Still works
// Or use new modular imports
import { setupDatabase } from '@creativoma/create-stack/dist/setup/database.js';
```

### For Contributors

See the new `CONTRIBUTING.md` and `ARCHITECTURE.md` for:
- Development workflow
- Code standards (no `any`, no type assertions)
- Testing requirements (90%+ coverage)
- Architecture patterns
- Extension points

---

## [0.0.5] - 2025-12-27

### Changed

- Improved README with cleaner layout and feature table

## [0.0.4] - 2025-12-27

### Added

- Interactive CLI with beautiful prompts and gradients
- Framework support: React, Vue, Svelte, Solid, Vanilla
- Meta-framework support: Next.js, Nuxt, SvelteKit, Astro, Remix
- Package manager support: npm, yarn, pnpm, bun, deno
- Styling options: Tailwind CSS, CSS Modules, Styled Components, UnoCSS
- UI component libraries: shadcn/ui, Radix UI, Headless UI, Ark UI, Naive UI, PrimeVue
- Database/ORM integration: Prisma, Drizzle, Supabase, Mongoose, Firebase, SQLite
- Animation libraries: Motion, GSAP, Lenis, Auto Animate, Anime.js
- Code quality tools: ESLint, Prettier, Biome
- Testing frameworks: Vitest, Jest, Playwright, Cypress
- Extra features: Git initialization, Husky, Docker, .env files, VSCode settings
- System prerequisites validation (Node.js 22+, git, package manager)
- Comprehensive test suite with Vitest

### Technical

- TypeScript with strict mode
- ESM modules
- Vitest for testing
- ESLint + Prettier for code quality
