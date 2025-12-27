import ora from 'ora';
import { execa } from 'execa';
import type { ExecutionContext } from '../core/ExecutionContext.js';
import { InstallationError } from '../core/errors.js';
import { getTestingDeps } from '../utils.js';

/**
 * Sets up testing frameworks and libraries
 *
 * @param context - Execution context containing project configuration and state
 * @throws {InstallationError} When package installation fails
 */
export async function setupTesting(context: ExecutionContext): Promise<void> {
  const { config, pmCommands } = context;
  const { testing, framework } = config;
  const { pm, pmDev } = pmCommands;

  if (!testing || testing.length === 0) return;

  const spinner = ora('Setting up testing...').start();
  const testDeps = getTestingDeps(framework, testing);

  if (testDeps.length > 0) {
    try {
      await execa(pm, [...pmDev, ...testDeps], { stdio: 'pipe' });
      spinner.succeed('Testing configured');
    } catch (error) {
      spinner.fail('Failed to setup testing');
      throw new InstallationError(
        testDeps.join(', '),
        'Failed to install testing dependencies',
        error
      );
    }
  } else {
    spinner.succeed('Testing configured');
  }
}
