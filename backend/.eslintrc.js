module.exports = {
	env: {
		browser: true,
		es2021: true
	},
	extends: ["eslint:recommended", "plugin:react/recommended"],
	overrides: [
		{
			env: {
				node: true
			},
			files: [".eslintrc.{js,cjs}"],
			parserOptions: {
				sourceType: "script"
			}
		}
	],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module"
	},
	plugins: ["react"],
	rules: {
		"no-console": "off",
		indent: ["error", "tab"],
		"linebreak-style": ["error", "unix"],
		quotes: ["error", "double"],
		semi: ["error", "always"],
		"no-mixed-spaces-and-tabs": ["error", "smart-tabs"]
	}
};
