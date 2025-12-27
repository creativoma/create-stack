# Contributing to create-stack

Thank you for your interest in contributing! This document provides guidelines for contributing to create-stack.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a welcoming environment
- Follow professional communication standards

## Getting Started

### Prerequisites

- Node.js 22 or higher
- pnpm (recommended) or npm
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/creativoma/create-stack.git
cd create-stack

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build the project
pnpm build

# Test the CLI locally
pnpm dev
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch Naming:**
- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code improvements
- `docs/` - Documentation updates
- `test/` - Test additions/improvements

### 2. Make Changes

Follow the code standards below and ensure:
- Code compiles without errors
- All tests pass
- Linting passes
- Coverage doesn't decrease

### 3. Test Your Changes

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run linting
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Type checking
pnpm typecheck

# Format code
pnpm format
```

### 4. Commit Your Changes

Follow conventional commits format:

```bash
git commit -m "feat: add support for Webpack build tool"
git commit -m "fix: resolve Tailwind CSS setup issue"
git commit -m "docs: update architecture documentation"
git commit -m "test: add tests for database setup module"
git commit -m "refactor: extract template strings to separate module"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Test additions/changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Build process or auxiliary tool changes

## Code Standards

### TypeScript

```typescript
// Good: Explicit types, no any
function setupDatabase(context: ExecutionContext): Promise<void> {
  const { config, pmCommands } = context;
  // ...
}

// Bad: Implicit any, type assertions
function setupDatabase(context: any) {
  const config = context.config as Config;
  // ...
}
```

**Rules:**
- Enable strict mode
- No `any` types (use `unknown` if needed)
- No type assertions (use type guards)
- Explicit return types for public functions
- Proper null/undefined handling

### Code Organization

```typescript
// Good: Single responsibility
export async function setupStyling(context: ExecutionContext): Promise<void> {
  // Only handles styling setup
}

// Bad: Multiple responsibilities
export async function setupEverything(context: ExecutionContext): Promise<void> {
  await setupStyling();
  await setupDatabase();
  await setupTesting();
  // ...
}
```

### Error Handling

```typescript
// Good: Specific error types
try {
  await execa(pm, [...pmDev, 'tailwindcss']);
} catch (error) {
  throw new InstallationError(
    'tailwindcss',
    'Failed to install Tailwind CSS',
    error
  );
}

// Bad: Generic errors
try {
  await execa(pm, [...pmDev, 'tailwindcss']);
} catch (error) {
  throw new Error('Something went wrong');
}
```

### Documentation

```typescript
/**
 * Sets up styling solution (Tailwind CSS, Styled Components, UnoCSS)
 *
 * @param context - Execution context containing project configuration and state
 * @throws {InstallationError} When package installation fails
 * @throws {FileOperationError} When file operations fail
 */
export async function setupStyling(context: ExecutionContext): Promise<void> {
  // Implementation
}
```

**JSDoc Requirements:**
- All exported functions
- Complex internal functions
- Parameters with descriptions
- Return values
- Thrown errors

## Testing Requirements

### Coverage Standards

- **Minimum:** 90% statement coverage
- **Target:** 95% statement coverage
- **No decrease:** PRs must not decrease coverage

### Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('setupStyling', () => {
  let context: ExecutionContext;
  let mockSpinner: Ora;

  beforeEach(() => {
    // Setup test context
    mockSpinner = {
      start: vi.fn().mockReturnThis(),
      succeed: vi.fn().mockReturnThis(),
      fail: vi.fn().mockReturnThis()
    } as unknown as Ora;

    const baseConfig: ProjectConfig = {
      // Complete config object
    };

    context = {
      config: baseConfig,
      pmCommands: { /* ... */ },
      projectPath: '/test/path',
      spinner: mockSpinner
    };
  });

  it('should handle success case', async () => {
    // Test implementation
  });

  it('should handle error case', async () => {
    // Test error path
  });
});
```

### Testing Guidelines

1. **Test both paths:** Success and error cases
2. **Mock externals:** execa, fs-extra, ora
3. **No anys:** Use proper types in tests
4. **No casteos:** Use proper test setup
5. **Descriptive names:** Clear test descriptions
6. **Independent tests:** No test interdependencies

## Pull Request Process

### Before Submitting

- [ ] All tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Coverage maintained/improved
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] Commits follow conventional format

### PR Title Format

```
feat: add support for Webpack configuration
fix: resolve Prisma schema generation issue
docs: update contributing guidelines
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Coverage: XX%

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests pass locally
- [ ] Documentation updated
```

### Review Process

1. **Automated checks:** CI must pass
2. **Code review:** At least one approval
3. **No merge conflicts:** Rebase if needed
4. **Squash commits:** For clean history

## Project Structure

### Adding a New Feature Module

1. **Create setup module:**
```typescript
// src/setup/newfeature.ts
import type { ExecutionContext } from '../core/ExecutionContext.js';
import { InstallationError } from '../core/errors.js';

export async function setupNewFeature(context: ExecutionContext): Promise<void> {
  // Implementation
}
```

2. **Add templates (if needed):**
```typescript
// src/templates/newfeature.ts
export const newFeatureTemplate = `...`;
```

3. **Create tests:**
```typescript
// src/setup/newfeature.test.ts
describe('setupNewFeature', () => {
  // Tests
});
```

4. **Update main orchestrator:**
```typescript
// src/create.ts
import { setupNewFeature } from './setup/newfeature.js';

// In createProject function:
await setupNewFeature(context);
```

5. **Update types:**
```typescript
// src/types.ts
export type NewFeature = 'option1' | 'option2';

export interface ProjectConfig {
  // ...
  newFeature: NewFeature;
}
```

### Adding a New Database

1. Add case in `src/setup/database.ts`
2. Create template in `src/templates/database.ts`
3. Add type to `src/types.ts`
4. Update prompts in `src/prompts.ts`
5. Add tests
6. Update documentation

## Common Tasks

### Running Locally

```bash
# Test CLI with your changes
pnpm dev

# Example: Create project with current code
pnpm dev my-test-project
```

### Debugging

```typescript
// Add debug logging
console.log('[DEBUG]', variable);

// Use debugger
debugger;

// Check spinner state
spinner.text = 'Debug message';
```

### Updating Dependencies

```bash
# Check for updates
pnpm outdated

# Update specific package
pnpm add package-name@latest

# Update all
pnpm update
```

## Style Guide Summary

### File Naming
- `kebab-case.ts` for files
- `PascalCase` for types/interfaces
- `camelCase` for functions/variables

### Code Formatting
- 2 spaces indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in multiline

### Import Order
1. External packages
2. Internal core modules
3. Internal setup modules
4. Internal templates
5. Types (imported separately)

### Example
```typescript
import ora from 'ora';
import { execa } from 'execa';
import fs from 'fs-extra';

import { InstallationError } from '../core/errors.js';
import { setupHelper } from '../setup/helper.js';
import { template } from '../templates/config.js';

import type { ExecutionContext } from '../core/ExecutionContext.js';
import type { ProjectConfig } from '../types.js';
```

## Getting Help

- **Issues:** Check existing issues or create new one
- **Discussions:** Ask questions in GitHub Discussions
- **Documentation:** Read [ARCHITECTURE.md](./ARCHITECTURE.md)

## Recognition

Contributors will be:
- Listed in the GitHub contributors page
- Mentioned in release notes for significant contributions
- Credited in the repository

Thank you for contributing to create-stack!
