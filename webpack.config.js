const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const mainConfig = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/main/main.ts',
  target: 'electron-main',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: {
    'better-sqlite3': 'commonjs better-sqlite3',
  },
};

const preloadConfig = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/main/preload.ts',
  target: 'electron-preload',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'preload.js',
    path: path.resolve(__dirname, 'dist'),
  },
};

const rendererConfig = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/renderer/index.tsx',
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'renderer.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      filename: 'index.html',
    }),
  ],
};

module.exports = [mainConfig, preloadConfig, rendererConfig];

