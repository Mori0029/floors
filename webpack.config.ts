import { resolve } from "path";
import assert from "assert";

import { CleanWebpackPlugin } from "clean-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";

import { HotModuleReplacementPlugin, EnvironmentPlugin } from "webpack";

import { colors } from "./lib/styles/colors";

const appName = "floors";

// assert(process.env.PORT, "env.PORT is missing");
assert(process.env.SERVER_URL, "env.SERVER_URL is missing");

module.exports = {
  mode: "development",
  context: resolve(__dirname, "client"),
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-typescript", "@babel/preset-react"],
            plugins: [
              "@babel/plugin-transform-runtime",
              "@babel/plugin-proposal-class-properties",
              "@babel/plugin-proposal-optional-chaining",
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.svg$/,
        use: [
          { loader: "file-loader", options: { name: "[name].[ext]" } },
          { loader: "svgo-loader", options: { plugins: [] } },
        ],
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".jsx", ".ts", ".tsx"],
  },
  output: {
    path: resolve(__dirname, "dist"),
    filename: "[name].js",
    globalObject: "this",
    publicPath: `/${appName}/`,
  },
  plugins: [
    new CleanWebpackPlugin({ verbose: true }),
    new HtmlWebpackPlugin({
      title: appName,
      filename: "index.html",
      favicon: "icon.svg",
      meta: {
        viewport: {
          width: "device-width",
          "initial-scale": 1,
          "shrink-to-fit": "no",
        },
        "application-name": appName,
        "theme-color": colors.lightblue,
      },
      template: "./index.ejs",
    }),
    new HtmlWebpackPlugin({
      title: appName,
      filename: "error.html",
      favicon: "icon.svg",
      chunks: [],
      template: "./error.ejs",
    }),
    new HotModuleReplacementPlugin(),
    new EnvironmentPlugin(["SERVER_URL"]),
  ],
  devServer: {
    historyApiFallback: {
      rewrites: [{ from: /./, to: "/floors/index.html" }],
    },
    contentBase: "./dist",
    compress: true,
    hot: true,
    port: process.env.PORT,
  },
  entry: {
    app: "./index.tsx",
    react: ["react", "react-dom", "react-dropzone"],
    material: ["@material-ui/core", "@material-ui/icons", "@material-ui/lab"],
  },
  target: "web",
};
