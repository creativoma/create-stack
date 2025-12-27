import { describe, it, expect } from 'vitest';
import {
  CreateStackError,
  ScaffoldingError,
  InstallationError,
  FileOperationError,
  CommandExecutionError,
  ConfigurationError,
  isCreateStackError,
  formatError
} from './errors.js';

describe('CreateStackError', () => {
  it('should create error with message, code, and details', () => {
    const error = new CreateStackError('Test error', 'TEST_CODE', { foo: 'bar' });
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.details).toEqual({ foo: 'bar' });
    expect(error.name).toBe('CreateStackError');
  });

  it('should create error without details', () => {
    const error = new CreateStackError('Test error', 'TEST_CODE');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.details).toBeUndefined();
  });

  it('should capture stack trace', () => {
    const error = new CreateStackError('Test error', 'TEST_CODE');
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('CreateStackError');
  });
});

describe('ScaffoldingError', () => {
  it('should create scaffolding error', () => {
    const error = new ScaffoldingError('Failed to scaffold', { stderr: 'error output' });
    expect(error.message).toBe('Failed to scaffold');
    expect(error.code).toBe('SCAFFOLDING_ERROR');
    expect(error.name).toBe('ScaffoldingError');
    expect(error.details).toEqual({ stderr: 'error output' });
  });
});

describe('InstallationError', () => {
  it('should create installation error with package name', () => {
    const error = new InstallationError('react', 'Failed to install', { exitCode: 1 });
    expect(error.message).toBe('Failed to install');
    expect(error.code).toBe('INSTALLATION_ERROR');
    expect(error.name).toBe('InstallationError');
    expect(error.packageName).toBe('react');
    expect(error.details).toEqual({ exitCode: 1 });
  });
});

describe('FileOperationError', () => {
  it('should create file operation error with path and operation', () => {
    const error = new FileOperationError('/path/to/file', 'write', 'Failed to write file', {
      errno: -2
    });
    expect(error.message).toBe('Failed to write file');
    expect(error.code).toBe('FILE_OPERATION_ERROR');
    expect(error.name).toBe('FileOperationError');
    expect(error.filePath).toBe('/path/to/file');
    expect(error.operation).toBe('write');
    expect(error.details).toEqual({ errno: -2 });
  });

  it('should handle all operation types', () => {
    const operations: Array<'read' | 'write' | 'delete' | 'copy'> = [
      'read',
      'write',
      'delete',
      'copy'
    ];

    operations.forEach((op) => {
      const error = new FileOperationError('/path', op, 'Failed');
      expect(error.operation).toBe(op);
    });
  });
});

describe('CommandExecutionError', () => {
  it('should create command execution error with stderr', () => {
    const error = new CommandExecutionError('npm install', 1, 'Command failed', 'stderr output');
    expect(error.message).toBe('Command failed');
    expect(error.code).toBe('COMMAND_EXECUTION_ERROR');
    expect(error.name).toBe('CommandExecutionError');
    expect(error.command).toBe('npm install');
    expect(error.exitCode).toBe(1);
    expect(error.stderr).toBe('stderr output');
  });

  it('should handle null exit code', () => {
    const error = new CommandExecutionError('git init', null, 'Command failed');
    expect(error.exitCode).toBeNull();
    expect(error.stderr).toBeUndefined();
  });
});

describe('ConfigurationError', () => {
  it('should create configuration error', () => {
    const error = new ConfigurationError('Invalid config', { field: 'projectName' });
    expect(error.message).toBe('Invalid config');
    expect(error.code).toBe('CONFIGURATION_ERROR');
    expect(error.name).toBe('ConfigurationError');
    expect(error.details).toEqual({ field: 'projectName' });
  });
});

describe('isCreateStackError', () => {
  it('should return true for CreateStackError instances', () => {
    const error = new CreateStackError('test', 'TEST');
    expect(isCreateStackError(error)).toBe(true);
  });

  it('should return true for error subclasses', () => {
    const errors = [
      new ScaffoldingError('test'),
      new InstallationError('pkg', 'test'),
      new FileOperationError('/path', 'read', 'test'),
      new CommandExecutionError('cmd', 1, 'test'),
      new ConfigurationError('test')
    ];

    errors.forEach((error) => {
      expect(isCreateStackError(error)).toBe(true);
    });
  });

  it('should return false for regular errors', () => {
    const error = new Error('regular error');
    expect(isCreateStackError(error)).toBe(false);
  });

  it('should return false for non-error values', () => {
    expect(isCreateStackError(null)).toBe(false);
    expect(isCreateStackError(undefined)).toBe(false);
    expect(isCreateStackError('string')).toBe(false);
    expect(isCreateStackError(123)).toBe(false);
    expect(isCreateStackError({})).toBe(false);
  });
});

describe('formatError', () => {
  it('should format CreateStackError with details', () => {
    const error = new CreateStackError('test error', 'TEST', { foo: 'bar' });
    const formatted = formatError(error);
    expect(formatted.message).toBe('test error');
    expect(formatted.details).toContain('"foo"');
    expect(formatted.details).toContain('"bar"');
  });

  it('should format CreateStackError without details', () => {
    const error = new CreateStackError('test error', 'TEST');
    const formatted = formatError(error);
    expect(formatted.message).toBe('test error');
    expect(formatted.details).toBeUndefined();
  });

  it('should format regular Error with stack', () => {
    const error = new Error('regular error');
    const formatted = formatError(error);
    expect(formatted.message).toBe('regular error');
    expect(formatted.details).toBeDefined();
    expect(formatted.details).toContain('Error: regular error');
  });

  it('should format string errors', () => {
    const formatted = formatError('string error');
    expect(formatted.message).toBe('string error');
    expect(formatted.details).toBeUndefined();
  });

  it('should format unknown error types', () => {
    const formatted = formatError({ custom: 'error' });
    expect(formatted.message).toBe('[object Object]');
  });

  it('should format null and undefined', () => {
    expect(formatError(null).message).toBe('null');
    expect(formatError(undefined).message).toBe('undefined');
  });
});
