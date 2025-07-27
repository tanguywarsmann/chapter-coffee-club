
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // Règles pour interdire les classes typographiques obsolètes
      "no-restricted-syntax": [
        "error",
        {
          "selector": "Literal[value=/text-[0-9]xl/]",
          "message": "Utilisez les nouvelles classes typographiques (text-hero, text-h1, text-h2, text-h3, text-h4, text-body, text-body-sm, text-caption)"
        },
        {
          "selector": "TemplateElement[value.raw=/text-[0-9]xl/]",
          "message": "Utilisez les nouvelles classes typographiques (text-hero, text-h1, text-h2, text-h3, text-h4, text-body, text-body-sm, text-caption)"
        },
        {
          "selector": "Literal[value=/tracking-(wide|wider|widest)/]",
          "message": "Les classes tracking-* sont interdites en dehors du système UI"
        },
        {
          "selector": "TemplateElement[value.raw=/tracking-(wide|wider|widest)/]",
          "message": "Les classes tracking-* sont interdites en dehors du système UI"
        }
      ]
    },
  }
);
