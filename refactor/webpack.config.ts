/* eslint-disable */

import path from "path";

import merge from "webpack-merge";

// plugins
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";


module.exports = (env: { mode: "development" | "production" }) => {
    const config = {
		entry: "./src/entry.ts",

		resolve: {
			extensions: [".ts", ".tsx", ".js", ".json"],
		},

		module: {
			rules: [
				{
					test: /\.css$/i,
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
						},
						"css-loader",
					],
				},
			],
		},
		optimization: {
			splitChunks: {
				chunks: "all",
			},
		},

		plugins: [
			new HtmlWebpackPlugin(),
		],
	};
    const isDev = env.mode === "development";
    const webpackConfigFile = isDev ? "webpack.dev.ts" : "webpack.prod.ts";
    const envConfig = require(path.resolve(__dirname, webpackConfigFile))();

    const mergedConfig = merge(config, envConfig);

    return mergedConfig;
};
