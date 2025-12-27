# Architecture Documentation

## Overview

create-stack is an interactive CLI tool that scaffolds modern web projects with a customizable technology stack. The architecture follows SOLID principles, clean code practices, and emphasizes modularity and maintainability.

## Core Principles

### 1. Single Responsibility Principle (SRP)
Each module has one well-defined responsibility:
- `setup/scaffold.ts` - Project scaffolding
- `setup/styling.ts` - Styling setup
- `setup/database.ts` - Database/ORM configuration
- etc.

### 2. Open/Closed Principle (OCP)
The system is open for extension but closed for modification:
- Adding new databases/frameworks doesn't require modifying existing code
- Template system allows easy addition of new configurations
- Error hierarchy can be extended without changing base classes

### 3. Dependency Inversion Principle (DIP)
- Custom error types abstract error handling
- ExecutionContext pattern provides dependency injection
- Setup modules depend on abstractions, not concrete implementations

## Project Structure

```
src/
├── core/                       # Core infrastructure
│   ├── ExecutionContext.ts     # Centralized execution state
│   └── errors.ts               # Error type hierarchy
│
├── setup/                      # Feature setup modules
│   ├── scaffold.ts             # Base project scaffolding
│   ├── styling.ts              # CSS frameworks
│   ├── ui.ts                   # UI component libraries
│   ├── database.ts             # Databases and ORMs
│   ├── animation.ts            # Animation libraries
│   ├── tooling.ts              # Code quality tools
│   ├── testing.ts              # Testing frameworks
│   └── extras.ts               # Git, Docker, VSCode, etc.
│
├── templates/                  # Configuration templates
│   ├── configs.ts              # Vite, TSConfig, etc.
│   ├── database.ts             # DB schemas and clients
│   └── docker.ts               # Docker and env files
│
├── create.ts                   # Main orchestrator
├── prompts.ts                  # CLI prompts
├── utils.ts                    # Utility functions
├── types.ts                    # TypeScript types
└── constants.ts                # Constants and mappings
```

## Key Patterns

### ExecutionContext Pattern

Eliminates parameter drilling by providing centralized access to:
- User configuration
- Package manager commands
- Project path
- Spinner instance

```typescript
interface ExecutionContext {
  config: ProjectConfig;
  pmCommands: PackageManagerCommands;
  projectPath: string;
  spinner: Ora;
}
```

**Benefits:**
- Single parameter instead of 7-10
- Easy to extend with new context
- Improves function signatures

### Error Hierarchy

Custom error types for better error handling:

```
CreateStackError (base)
├── ScaffoldingError
├── InstallationError
├── FileOperationError
├── CommandExecutionError
└── ConfigurationError
```

**Benefits:**
- Type-safe error handling
- Rich error context
- Better user messaging

### Template System

Separates configuration templates from logic:

```typescript
// Instead of inline strings
const config = `export default { ... }`;

// Use template functions
const config = getViteConfig(hasTailwind);
```

**Benefits:**
- Easier to maintain
- Version control friendly
- Can add validation

## Data Flow

```
CLI Start
    ↓
Parse Arguments (index.ts)
    ↓
Display Banner
    ↓
Gather User Preferences (prompts.ts)
    ↓
Check Prerequisites (utils.ts)
    ↓
Create ExecutionContext
    ↓
Orchestrate Setup (create.ts)
    ├→ scaffoldProject()
    ├→ Install dependencies
    ├→ setupStyling()
    ├→ setupUI()
    ├→ setupDatabase()
    ├→ setupAnimation()
    ├→ setupTooling()
    ├→ setupTesting()
    └→ setupExtras()
    ↓
Success Message
```

## Module Dependencies

```
index.ts
  └→ prompts.ts
  └→ utils.ts
  └→ create.ts
       └→ core/ExecutionContext.ts
       └→ core/errors.ts
       └→ setup/*
             └→ templates/*
```

**Dependency Rules:**
- No circular dependencies
- setup/ modules don't depend on each other
- templates/ are pure functions with no dependencies
- core/ has zero dependencies on feature modules

## Testing Strategy

### Unit Tests
- Each module has corresponding `.test.ts` file
- Mocks external dependencies (execa, fs-extra, ora)
- Tests both success and error paths
- **Current Coverage:** 92.87%

### Test Organization
```
src/module.ts          # Implementation
src/module.test.ts     # Unit tests
```

### Mocking Strategy
```typescript
vi.mock('execa', () => ({ execa: vi.fn() }));
vi.mock('fs-extra', () => ({ default: {...} }));
vi.mock('ora', () => ({ default: vi.fn() }));
```

## Error Handling

### Strategy
1. **Throw early:** Validate at module boundaries
2. **Type-safe errors:** Use custom error classes
3. **Rich context:** Include relevant details
4. **User-friendly:** Format errors for display

### Example
```typescript
try {
  await execa(pm, [...pmDev, 'prisma']);
} catch (error) {
  throw new InstallationError(
    'prisma',
    'Failed to install Prisma',
    error
  );
}
```

## Performance Considerations

### Sequential Execution
Setup steps run sequentially to ensure dependencies are met:
1. Scaffold project
2. Install base dependencies
3. Configure features (could be parallel in future)

### Future Optimization Opportunities
- Parallelize independent setup steps
- Cache package manager operations
- Progressive installation feedback

## Extension Points

### Adding New Features

1. **New Database:**
   - Add case to `setup/database.ts`
   - Create template in `templates/database.ts`
   - Add type to `types.ts`
   - Add tests

2. **New Framework:**
   - Add case to `setup/scaffold.ts`
   - Update type definitions
   - Add tests

3. **New Setup Module:**
   - Create `src/setup/newfeature.ts`
   - Import in `create.ts`
   - Call in orchestration flow
   - Add tests

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No implicit any
- Full type coverage
- Proper null checks

### ESLint
- typescript-eslint rules
- No unused variables
- Consistent code style

### Testing
- Vitest framework
- 90%+ coverage target
- Both success/error paths
- No type assertions in tests

## Security Considerations

1. **Command Injection:** Package manager names from typed enums
2. **File Operations:** Validated project paths
3. **Dependencies:** No version pinning (user's choice)
4. **Environment Variables:** Example files, not real secrets

## Build & Distribution

### Build Process
```bash
pnpm build  # TypeScript compilation
```

### Output
- `dist/` - Compiled JavaScript
- Type declarations included
- Source maps for debugging

### Distribution
- Published to npm as `@creativoma/create-stack`
- ESM module format
- Node.js 22+ requirement

## Future Architecture Improvements

1. **Plugin System:** Allow third-party generators
2. **Configuration Files:** Support `.create-stackrc`
3. **Parallel Execution:** Independent setup steps
4. **Incremental Updates:** Add features to existing projects
5. **Validation Layer:** Zod schemas for runtime validation

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- Code style
- Testing requirements
- Pull request process
- Development workflow
