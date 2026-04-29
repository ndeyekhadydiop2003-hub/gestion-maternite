import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { 
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      // On transforme l'erreur en simple avertissement (jaune)
      "no-unused-vars": "warn", 
    },
  },
  pluginReact.configs.flat.recommended,
  // Règle optionnelle pour les versions récentes de React
  {
    rules: {
      "react/react-in-jsx-scope": "off",
    }
  }
];
