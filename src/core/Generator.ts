import type { ExecutionContext } from './ExecutionContext.js';

/**
 * Base interface for all generators
 * Implements Strategy Pattern for extensibility
 */
export interface Generator {
  /**
   * Unique identifier for this generator
   */
  readonly name: string;

  /**
   * Human-readable description
   */
  readonly description: string;

  /**
   * Execute the generator with given context
   * @param context - Execution context
   */
  execute(context: ExecutionContext): Promise<void>;

  /**
   * Check if this generator should run based on config
   * @param context - Execution context
   */
  shouldRun(context: ExecutionContext): boolean;
}

/**
 * Registry for managing generators
 */
export class GeneratorRegistry {
  private generators: Map<string, Generator> = new Map();

  /**
   * Register a new generator
   */
  register(generator: Generator): void {
    if (this.generators.has(generator.name)) {
      throw new Error(`Generator "${generator.name}" is already registered`);
    }
    this.generators.set(generator.name, generator);
  }

  /**
   * Get all registered generators
   */
  getAll(): Generator[] {
    return Array.from(this.generators.values());
  }

  /**
   * Get generator by name
   */
  get(name: string): Generator | undefined {
    return this.generators.get(name);
  }

  /**
   * Execute all generators that should run
   */
  async executeAll(context: ExecutionContext): Promise<void> {
    const generators = this.getAll().filter((gen) => gen.shouldRun(context));

    for (const generator of generators) {
      await generator.execute(context);
    }
  }
}

/**
 * Create a global registry instance
 */
export const globalRegistry = new GeneratorRegistry();
