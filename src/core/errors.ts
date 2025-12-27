/**
 * Custom error types for better error handling and debugging
 */

/**
 * Base error class for all create-stack errors
 */
export class CreateStackError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'CreateStackError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error thrown when project scaffolding fails
 */
export class ScaffoldingError extends CreateStackError {
  constructor(message: string, details?: unknown) {
    super(message, 'SCAFFOLDING_ERROR', details);
    this.name = 'ScaffoldingError';
  }
}

/**
 * Error thrown when package installation fails
 */
export class InstallationError extends CreateStackError {
  constructor(
    public readonly packageName: string,
    message: string,
    details?: unknown
  ) {
    super(message, 'INSTALLATION_ERROR', details);
    this.name = 'InstallationError';
  }
}

/**
 * Error thrown when file operations fail
 */
export class FileOperationError extends CreateStackError {
  constructor(
    public readonly filePath: string,
    public readonly operation: 'read' | 'write' | 'delete' | 'copy',
    message: string,
    details?: unknown
  ) {
    super(message, 'FILE_OPERATION_ERROR', details);
    this.name = 'FileOperationError';
  }
}

/**
 * Error thrown when command execution fails
 */
export class CommandExecutionError extends CreateStackError {
  constructor(
    public readonly command: string,
    public readonly exitCode: number | null,
    message: string,
    public readonly stderr?: string
  ) {
    super(message, 'COMMAND_EXECUTION_ERROR', { exitCode, stderr });
    this.name = 'CommandExecutionError';
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigurationError extends CreateStackError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFIGURATION_ERROR', details);
    this.name = 'ConfigurationError';
  }
}

/**
 * Type guard to check if an error is a CreateStackError
 */
export function isCreateStackError(error: unknown): error is CreateStackError {
  return error instanceof CreateStackError;
}

/**
 * Format error for user-friendly display
 */
export function formatError(error: unknown): { message: string; details?: string } {
  if (isCreateStackError(error)) {
    return {
      message: error.message,
      details: error.details ? JSON.stringify(error.details, null, 2) : undefined
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack
    };
  }

  return {
    message: String(error)
  };
}
