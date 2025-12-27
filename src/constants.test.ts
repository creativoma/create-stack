import { describe, it, expect } from 'vitest';
import { VERSION, BANNER, HELP_TEXT, coolGradient } from './constants.js';

describe('constants', () => {
  describe('VERSION', () => {
    it('should be a valid semver string', () => {
      expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('should be 1.0.0', () => {
      expect(VERSION).toBe('1.0.0');
    });
  });

  describe('coolGradient', () => {
    it('should be a function', () => {
      expect(typeof coolGradient).toBe('function');
    });

    it('should apply gradient to text', () => {
      const result = coolGradient('test');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('BANNER', () => {
    it('should be a non-empty string', () => {
      expect(typeof BANNER).toBe('string');
      expect(BANNER.length).toBeGreaterThan(0);
    });

    it('should contain ASCII art', () => {
      expect(BANNER).toContain('██');
    });

    it('should contain the tagline', () => {
      expect(BANNER).toContain('Build your perfect project stack');
    });
  });

  describe('HELP_TEXT', () => {
    it('should be a non-empty string', () => {
      expect(typeof HELP_TEXT).toBe('string');
      expect(HELP_TEXT.length).toBeGreaterThan(0);
    });

    it('should contain usage section', () => {
      expect(HELP_TEXT).toContain('USAGE');
    });

    it('should contain options section', () => {
      expect(HELP_TEXT).toContain('OPTIONS');
    });

    it('should contain features section', () => {
      expect(HELP_TEXT).toContain('FEATURES');
    });

    it('should contain help and version options', () => {
      expect(HELP_TEXT).toContain('--help');
      expect(HELP_TEXT).toContain('--version');
    });

    it('should list package manager commands', () => {
      expect(HELP_TEXT).toContain('npx create-stack');
      expect(HELP_TEXT).toContain('pnpm create stack');
      expect(HELP_TEXT).toContain('yarn create stack');
      expect(HELP_TEXT).toContain('bun create stack');
    });
  });
});
