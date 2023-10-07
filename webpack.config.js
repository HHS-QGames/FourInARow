const path = require('path');

module.exports = {
  entry: './built/tsc/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'built'),
  },
  watch: true,
};