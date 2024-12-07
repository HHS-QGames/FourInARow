const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './dist/tsc/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'style', to: 'style' },
        { from: 'images', to: 'images' },
        { from: 'index.html', to: 'index.html' },
        { from: '404.html', to: '404.html' },
      ],
    }),
  ],
};