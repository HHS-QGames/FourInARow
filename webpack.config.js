const path = require('path');

module.exports = {
  entry: './dist/tsc/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  watch: true,
};