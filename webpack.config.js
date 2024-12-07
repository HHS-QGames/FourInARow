const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    publicPath: "/FourInARow/",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"], // CSS loaders
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: "asset/resource", // Asset loader for images
        generator: {
          filename: "images/[name][ext]", // Output path for images
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      base: "/FourInARow/",
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "style", to: "style" },
        { from: "images", to: "images" },
      ],
    }),
  ],
  devServer: {
    static: "./dist",
    compress: true,
    port: 9876,
    historyApiFallback: {
      index: "/FourInARow/",
    },
    open: {
      target: "http://localhost:9876/FourInARow", // Open the browser at this path
    },
  },
  mode: "development",
};
