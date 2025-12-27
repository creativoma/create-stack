/**
 * Deployment configuration templates for various platforms
 */

export const vercelJson = () => ({
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  devCommand: 'npm run dev',
  installCommand: 'npm install'
});

export const netlifyToml = `[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "22"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

export const renderYaml = `services:
  - type: web
    name: app
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 22
`;

export const cloudflareWranglerToml = `name = "my-app"
main = "dist/index.js"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"

[build.upload]
format = "service-worker"
`;

/**
 * Webpack basic configuration
 */
export const webpackConfig = `const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: './dist',
    hot: true,
  },
};
`;
