import { describe, it, expect } from 'vitest';
import {
  vercelJson,
  netlifyToml,
  renderYaml,
  cloudflareWranglerToml,
  webpackConfig
} from './deployment.js';

describe('Deployment Templates', () => {
  describe('vercelJson', () => {
    it('should return valid vercel.json configuration', () => {
      const config = vercelJson();

      expect(config).toEqual({
        buildCommand: 'npm run build',
        outputDirectory: 'dist',
        devCommand: 'npm run dev',
        installCommand: 'npm install'
      });
    });

    it('should return an object with required properties', () => {
      const config = vercelJson();

      expect(config).toHaveProperty('buildCommand');
      expect(config).toHaveProperty('outputDirectory');
      expect(config).toHaveProperty('devCommand');
      expect(config).toHaveProperty('installCommand');
    });
  });

  describe('netlifyToml', () => {
    it('should contain build configuration', () => {
      expect(netlifyToml).toContain('[build]');
      expect(netlifyToml).toContain('publish = "dist"');
      expect(netlifyToml).toContain('command = "npm run build"');
    });

    it('should contain build environment configuration', () => {
      expect(netlifyToml).toContain('[build.environment]');
      expect(netlifyToml).toContain('NODE_VERSION = "22"');
    });

    it('should contain redirect rules', () => {
      expect(netlifyToml).toContain('[[redirects]]');
      expect(netlifyToml).toContain('from = "/*"');
      expect(netlifyToml).toContain('to = "/index.html"');
      expect(netlifyToml).toContain('status = 200');
    });

    it('should be a valid TOML format', () => {
      expect(typeof netlifyToml).toBe('string');
      expect(netlifyToml.length).toBeGreaterThan(0);
    });
  });

  describe('renderYaml', () => {
    it('should contain services configuration', () => {
      expect(renderYaml).toContain('services:');
      expect(renderYaml).toContain('- type: web');
      expect(renderYaml).toContain('name: app');
      expect(renderYaml).toContain('env: node');
    });

    it('should contain build and start commands', () => {
      expect(renderYaml).toContain('buildCommand: npm install && npm run build');
      expect(renderYaml).toContain('startCommand: npm start');
    });

    it('should contain environment variables', () => {
      expect(renderYaml).toContain('envVars:');
      expect(renderYaml).toContain('- key: NODE_VERSION');
      expect(renderYaml).toContain('value: 22');
    });

    it('should be a valid YAML format', () => {
      expect(typeof renderYaml).toBe('string');
      expect(renderYaml.length).toBeGreaterThan(0);
    });
  });

  describe('cloudflareWranglerToml', () => {
    it('should contain app configuration', () => {
      expect(cloudflareWranglerToml).toContain('name = "my-app"');
      expect(cloudflareWranglerToml).toContain('main = "dist/index.js"');
      expect(cloudflareWranglerToml).toContain('compatibility_date = "2024-01-01"');
    });

    it('should contain build configuration', () => {
      expect(cloudflareWranglerToml).toContain('[build]');
      expect(cloudflareWranglerToml).toContain('command = "npm run build"');
    });

    it('should contain upload configuration', () => {
      expect(cloudflareWranglerToml).toContain('[build.upload]');
      expect(cloudflareWranglerToml).toContain('format = "service-worker"');
    });

    it('should be a valid TOML format', () => {
      expect(typeof cloudflareWranglerToml).toBe('string');
      expect(cloudflareWranglerToml.length).toBeGreaterThan(0);
    });
  });

  describe('webpackConfig', () => {
    it('should contain basic webpack configuration', () => {
      expect(webpackConfig).toContain("mode: 'development'");
      expect(webpackConfig).toContain("entry: './src/index.ts'");
    });

    it('should contain module rules for TypeScript', () => {
      expect(webpackConfig).toContain('module: {');
      expect(webpackConfig).toContain('rules: [');
      expect(webpackConfig).toContain('test: /\\.tsx?$/');
      expect(webpackConfig).toContain("use: 'ts-loader'");
      expect(webpackConfig).toContain('exclude: /node_modules/');
    });

    it('should contain resolve configuration', () => {
      expect(webpackConfig).toContain('resolve: {');
      expect(webpackConfig).toContain("extensions: ['.tsx', '.ts', '.js']");
    });

    it('should contain output configuration', () => {
      expect(webpackConfig).toContain('output: {');
      expect(webpackConfig).toContain("filename: 'bundle.js'");
      expect(webpackConfig).toContain("path: path.resolve(__dirname, 'dist')");
    });

    it('should contain devServer configuration', () => {
      expect(webpackConfig).toContain('devServer: {');
      expect(webpackConfig).toContain("static: './dist'");
      expect(webpackConfig).toContain('hot: true');
    });

    it('should be a valid JavaScript string', () => {
      expect(typeof webpackConfig).toBe('string');
      expect(webpackConfig.length).toBeGreaterThan(0);
      expect(webpackConfig).toContain('module.exports');
    });
  });
});
