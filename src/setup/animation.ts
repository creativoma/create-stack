import ora from 'ora';
import { execa } from 'execa';
import type { ExecutionContext } from '../core/ExecutionContext.js';
import { InstallationError } from '../core/errors.js';

/**
 * Sets up animation libraries based on user configuration
 *
 * @param context - Execution context containing project configuration and state
 * @throws {InstallationError} When package installation fails
 */
export async function setupAnimation(context: ExecutionContext): Promise<void> {
  const { config, pmCommands } = context;
  const { animation } = config;
  const { pm, pmInstall } = pmCommands;

  if (!animation || animation.length === 0) return;

  const spinner = ora('Adding animation libraries...').start();
  const animDeps: string[] = [];

  if (animation.includes('motion')) animDeps.push('motion');
  if (animation.includes('gsap')) animDeps.push('gsap');
  if (animation.includes('lenis')) animDeps.push('lenis');
  if (animation.includes('autoAnimate')) animDeps.push('@formkit/auto-animate');
  if (animation.includes('animejs')) animDeps.push('animejs');

  if (animDeps.length > 0) {
    try {
      await execa(pm, [...pmInstall, ...animDeps], { stdio: 'pipe' });
      spinner.succeed('Animation libraries added');
    } catch (error) {
      spinner.fail('Failed to install animation libraries');
      throw new InstallationError(
        animDeps.join(', '),
        'Failed to install animation libraries',
        error
      );
    }
  } else {
    spinner.succeed('Animation libraries added');
  }
}
