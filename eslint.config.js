import eslint from "@eslint/js";
import comments from "eslint-plugin-eslint-comments";
import * as importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        plugins: {
            ["@typescript-eslint"]: tseslint.plugin,
            ["eslint-comments"]: comments,
            ["import"]: importPlugin,
        },
    },
    // extends ...
    eslint.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,

    {
        // config with just ignores is the replacement for `.eslintignore`
        ignores: ["node_modules", "build", "app/coverage"],
    },

    // base config
    {
        languageOptions: {
            globals: {},
            parserOptions: {
                project: ["tsconfig.json"],
            },
        },
        rules: {
            "@typescript-eslint/no-confusing-void-expression": [
                "error",
                { ignoreArrowShorthand: true },
            ],
            "@typescript-eslint/no-shadow": ["error"],
            "@typescript-eslint/switch-exhaustiveness-check": [
                "error",
                {
                    allowDefaultCaseForExhaustiveSwitch: false,
                    requireDefaultForNonUnion: true,
                },
            ],
            "@typescript-eslint/no-dynamic-delete": "off",
            "@typescript-eslint/ban-ts-comment": [
                "error",
                {
                    "ts-expect-error": "allow-with-description",
                    "ts-ignore": true,
                    "ts-nocheck": true,
                    "ts-check": false,
                    minimumDescriptionLength: 5,
                },
            ],
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports", disallowTypeAnnotations: true },
            ],
            "@typescript-eslint/explicit-function-return-type": ["off", { allowIIFEs: true }],
            "@typescript-eslint/no-explicit-any": "error",
            "no-constant-condition": "error",
            "@typescript-eslint/no-unnecessary-condition": [
                "error",
                { allowConstantLoopConditions: true },
            ],
            "@typescript-eslint/no-var-requires": "off",
            "@typescript-eslint/prefer-literal-enum-member": [
                "error",
                {
                    allowBitwiseExpressions: true,
                },
            ],
            "@typescript-eslint/unbound-method": "error",
            "@typescript-eslint/restrict-template-expressions": [
                "error",
                {
                    allowNumber: true,
                    allowBoolean: true,
                    allowAny: true,
                    allowNullish: true,
                    allowRegExp: true,
                },
            ],
            "@typescript-eslint/no-unused-expressions": ["error"],
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    caughtErrors: "all",
                    varsIgnorePattern: "^_",
                    argsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/prefer-nullish-coalescing": [
                "error",
                {
                    ignoreConditionalTests: true,
                    ignorePrimitives: true,
                },
            ],

            "object-shorthand": ["error", "always"],

            //
            // eslint-base
            //

            curly: ["error", "all"],
            eqeqeq: ["error", "always"],
            "logical-assignment-operators": "error",
            "no-else-return": "error",
            // "no-mixed-operators": "error",
            "no-console": "error",
            "no-process-exit": "error",
            "no-fallthrough": ["error", { commentPattern: ".*intentional fallthrough.*" }],
            "one-var": ["error", "never"],

            //
            // eslint-plugin-eslint-comments
            //

            // require a eslint-enable comment for every eslint-disable comment
            "eslint-comments/disable-enable-pair": [
                "error",
                {
                    allowWholeFile: true,
                },
            ],
            // disallow a eslint-enable comment for multiple eslint-disable comments
            "eslint-comments/no-aggregating-enable": "error",
            // disallow duplicate eslint-disable comments
            "eslint-comments/no-duplicate-disable": "error",
            // disallow eslint-disable comments without rule names
            "eslint-comments/no-unlimited-disable": "error",
            // disallow unused eslint-disable comments
            "eslint-comments/no-unused-disable": "error",
            // disallow unused eslint-enable comments
            "eslint-comments/no-unused-enable": "error",
            // disallow ESLint directive-comments
            "eslint-comments/no-use": [
                "error",
                {
                    allow: [
                        "eslint-disable",
                        "eslint-disable-line",
                        "eslint-disable-next-line",
                        "eslint-enable",
                        "global",
                    ],
                },
            ],

            //
            // eslint-plugin-import
            //
            // enforces consistent type specifier style for named imports
            "import/consistent-type-specifier-style": "error",
            // disallow non-import statements appearing before import statements
            "import/first": "error",
            // Require a newline after the last import/require in a group
            "import/newline-after-import": "error",
            // Forbid import of modules using absolute paths
            "import/no-absolute-path": "error",
            // disallow AMD require/define
            "import/no-amd": "error",
            // forbid default exports - we want to standardize on named exports so that imported names are consistent
            "import/no-default-export": "error",
            // disallow imports from duplicate paths
            "import/no-duplicates": "error",
            // Forbid the use of extraneous packages
            "import/no-extraneous-dependencies": [
                "error",
                {
                    devDependencies: true,
                    peerDependencies: true,
                    optionalDependencies: false,
                },
            ],
            // Forbid mutable exports
            "import/no-mutable-exports": "error",
            // Prevent importing the default as if it were named
            "import/no-named-default": "error",
            // Prohibit named exports
            "import/no-named-export": "off", // we want everything to be a named export
            // Forbid a module from importing itself
            "import/no-self-import": "error",
            // Require modules with a single export to use a default export
            "import/prefer-default-export": "off", // we want everything to be named
        },
    },
    {
        files: ["**/*.js"],
        extends: [tseslint.configs.disableTypeChecked],
        rules: {
            // turn off other type-aware rules
            "deprecation/deprecation": "off",
            "@typescript-eslint/internal/no-poorly-typed-ts-props": "off",

            // turn off rules that don't apply to JS code
            "@typescript-eslint/explicit-function-return-type": "off",
        },
    },
);
