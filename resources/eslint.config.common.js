import globals from "globals";
import eslintComments from "eslint-plugin-eslint-comments";
import eslintStylistic from "@stylistic/eslint-plugin";
import eslintSoftvisio from "@softvisio/eslint-plugin";

export default [
    // eslint-comments:recommended
    {
        "name": "eslint-comments",
        "plugins": {
            "eslint-comments": eslintComments,
        },
        "rules": {
            ...eslintComments.configs.recommended.rules,
        },
    },

    // @stylistic:recommended
    eslintStylistic.configs[ "recommended-flat" ],

    // @softvisio:recommended
    eslintSoftvisio.configs.recommended,

    // common config
    {
        "name": "common config",

        "languageOptions": {
            "globals": {
                ...globals.node,
                ...globals.browser,
                "Ext": "readonly",
                "Temporal": "readonly",
                "l10n": "readonly",
                "l10nt": "readonly",
                "msgid": "readonly",
                "result": "readonly",
            },
        },

        "rules": {

            // @softvisio:recommended
            "@softvisio/camelcase": [
                "error",
                {
                    "properties": "never",
                    "ignoreImports": true,
                    "allowConsecutiveCapitalLetters": false,
                    "allowedPrefixes": [ "API_", "CALLBACK_", "COMMAND_" ],
                },
            ],

            // eslint comments
            "eslint-comments/disable-enable-pair": [ "error", { "allowWholeFile": true } ],
            "eslint-comments/no-unused-disable": "error",

            // eslint core rules
            "curly": [ "error", "multi-line" ],
            "eqeqeq": [ "error", "smart" ],
            "grouped-accessor-pairs": [ "error", "getBeforeSet" ],
            "no-constructor-return": [ "error" ],
            "prefer-const": "error",
            "prefer-exponentiation-operator": "error",
            "yoda": [ "error", "never", { "exceptRange": true } ],

            // eslint:recommended
            "no-constant-condition": [ "error", { "checkLoops": false } ],
            "no-control-regex": "off",
            "no-empty": [ "error", { "allowEmptyCatch": true } ],
            "no-global-assign": "error",
            "no-regex-spaces": "error",
            "no-unused-vars": [ "error", { "args": "none", "caughtErrors": "none" } ],

            // @stylistic:recommended
            "@stylistic/array-bracket-spacing": [ "error", "always" ],
            "@stylistic/arrow-parens": [ "error", "as-needed" ],
            "@stylistic/brace-style": [ "error", "stroustrup", { "allowSingleLine": true } ],
            "@stylistic/comma-dangle": [ "error", "only-multiline" ],
            "@stylistic/comma-spacing": [ "error", { "before": false, "after": true } ],
            "@stylistic/computed-property-spacing": [ "error", "always" ],
            "@stylistic/function-paren-newline": [ "error", "multiline" ],
            "@stylistic/indent": [
                "error",
                4,
                {
                    "VariableDeclarator": {
                        "var": 1,
                        "let": 1,
                        "const": 1,
                    },
                },
            ],
            "@stylistic/lines-around-comment": [
                "error",
                {
                    "beforeBlockComment": true,
                    "afterBlockComment": false,
                    "beforeLineComment": true,
                    "afterLineComment": false,
                },
            ],
            "@stylistic/operator-linebreak": [
                "error",
                "after",
                {
                    "overrides": {
                        "?": "before",
                        ":": "before",
                    },
                },
            ],
            "@stylistic/padded-blocks": "off", // NOTE conflicts with @stylistic/lines-around-comment
            "@stylistic/quote-props": [ "error", "always" ],
            "@stylistic/quotes": [ "error", "double", { "avoidEscape": true, "allowTemplateLiterals": true } ],
            "@stylistic/semi": [ "error", "always" ],
            "@stylistic/semi-spacing": [ "error", { "before": false, "after": true } ],
            "@stylistic/space-before-function-paren": [ "error", "always" ],
            "@stylistic/space-in-parens": [ "error", "always", { "exceptions": [ "empty" ] } ],
            "@stylistic/space-infix-ops": [ "error", { "int32Hint": false } ],
            "@stylistic/spaced-comment": [ "error", "always", { "markers": [ "*" ] } ],
            "@stylistic/template-curly-spacing": [ "error", "always" ],
        },
    },
];
