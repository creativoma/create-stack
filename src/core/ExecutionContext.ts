import type { Ora } from 'ora';
import type { ProjectConfig, PackageManagerCommands } from '../types.js';

/**
 * Centralized execution context containing all shared state and configuration
 * This eliminates the need to pass multiple parameters to every function
 */
export interface ExecutionContext {
  /**
   * User's project configuration from CLI prompts
   */
  readonly config: ProjectConfig;

  /**
   * Package manager commands and configuration
   */
  readonly pmCommands: PackageManagerCommands;

  /**
   * Absolute path to the project directory
   */
  readonly projectPath: string;

  /**
   * Ora spinner instance for user feedback
   */
  spinner: Ora;
}

/**
 * Creates a new execution context
 */
export function createExecutionContext(
  config: ProjectConfig,
  pmCommands: PackageManagerCommands,
  projectPath: string,
  spinner: Ora
): ExecutionContext {
  return {
    config,
    pmCommands,
    projectPath,
    spinner
  };
}
