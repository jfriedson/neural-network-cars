//.eslintrc.js
module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: "module",
	},
	plugins: ["@typescript-eslint"],
	env: {
		browser: true,
	},
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: "module",
	},
	plugins: ["@typescript-eslint"],
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
	rules: {
		//...
	},
};
