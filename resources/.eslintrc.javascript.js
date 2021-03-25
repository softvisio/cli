const config = {
    "env": {
        "node": true,
        "browser": true,
        "es2021": true,
    },

    "extends": [

        //
        "eslint:recommended",
        "plugin:eslint-comments/recommended",
        "plugin:vue/vue3-recommended",
        "plugin:vue/recommended",
        "plugin:@softvisio/recommended",
    ],

    "globals": {
        "Ext": "readonly",
        "result": "readonly",
    },

    "parserOptions": {
        "parser": "@babel/eslint-parser",
        "sourceType": "module",
        "ecmaVersion": 2021,
        "ecmaFeatures": {
            "jsx": true,
        },
        "requireConfigFile": false,
        "babelOptions": {
            "configFile": __dirname + "/babel.config.js",
        },
    },

    "rules": {
        // eslint comments
        "eslint-comments/no-unused-disable": "error",
        "eslint-comments/disable-enable-pair": ["error", { "allowWholeFile": true }],

        // eslint-plugin-vue, https://vuejs.github.io/eslint-plugin-vue/rules
        "vue/max-attributes-per-line": ["warn", { "singleline": 99999 }],
        "vue/html-indent": "off", // ["warn", 4],
        "vue/script-indent": "off",
        "vue/attribute-hyphenation": ["warn", "never"], // for ExtJS webcomponents
        "vue/html-self-closing": [
            "warn",
            {
                "html": {
                    "void": "always",
                    "normal": "always",
                    "component": "always",
                },
                "svg": "always",
                "math": "always",
            },
        ],
        "vue/html-closing-bracket-spacing": [
            "warn",
            {
                "startTag": "never",
                "endTag": "never",
                "selfClosingTag": "never", // set to "always" to make compatible with the prettier <br />
            },
        ],
        "vue/html-quotes": "off", // replaced with the @softvisio/html-quotes

        // eslint:recommended

        "brace-style": ["error", "stroustrup", { "allowSingleLine": true }],
        "comma-spacing": ["error", { "before": false, "after": true }],
        "curly": ["error", "multi-line"],
        "eqeqeq": ["error", "smart"],
        "function-paren-newline": ["error", "never"],
        "grouped-accessor-pairs": ["error", "getBeforeSet"],

        // "indent": [
        //     "error",
        //     4, // XXX need to take from .editorconfig
        //     {
        //         "VariableDeclarator": {
        //             "var": 1,
        //             "let": 1,
        //             "const": 1,
        //         },
        //     },
        // ],
        "lines-around-comment": [
            "error",
            {
                "beforeBlockComment": true,
                "afterBlockComment": false,
                "beforeLineComment": true,
                "afterLineComment": false,
            },
        ],
        "no-constant-condition": ["error", { "checkLoops": false }],
        "no-constructor-return": ["error"],
        "no-empty": ["error", { "allowEmptyCatch": true }],
        "no-global-assign": "error",
        "no-unused-vars": ["error", { "args": "none" }],
        "prefer-const": "error",
        "prefer-exponentiation-operator": "error",
        "quote-props": ["error", "always"],
        "quotes": ["error", "double", { "avoidEscape": true, "allowTemplateLiterals": true }],
        "semi-spacing": ["error", { "before": false, "after": true }],
        "space-before-function-paren": ["error", "always"],
        "space-in-parens": ["error", "always", { "exceptions": ["empty"] }],
        "space-infix-ops": ["error", { "int32Hint": false }],
        "spaced-comment": ["error", "always", { "markers": ["*"] }],
        "yoda": ["error", "never", { "exceptRange": true }],

        // TODO eslint
        // "array-bracket-newline": "error",
        // "array-bracket-spacing": "error",
        // "array-element-newline": "error",
        // "arrow-body-style": "error",
        // "arrow-parens": "error",
        // "arrow-spacing": "error",
        // "block-spacing": "error",
        // "capitalized-comments": "error",
        // "comma-dangle": "error",
        // "comma-style": "error",
        // "computed-property-spacing": "error",
        // "dot-location": "error",
        // "dot-notation": "error",
        // "eol-last": "error",
        // "func-call-spacing": "error",
        // "generator-star-spacing": "error",
        // "implicit-arrow-linebreak": "error",
        // "jsx-quotes": "error",
        // "key-spacing": "error",
        // "keyword-spacing": "error",
        // "linebreak-style": "error",
        // "lines-between-class-members": "error",
        // "multiline-comment-style": ["error", "starred-block"], // Do not convert comments
        // "new-parens": "error",
        // "newline-per-chained-call": "error",
        // "no-confusing-arrow": "error",
        // "no-console": "off",
        // "no-else-return": "error",
        // "no-extra-bind": "error",
        // "no-extra-boolean-cast": "error",
        // "no-extra-label": "error",
        // "no-extra-parens": "error",
        // "no-extra-semi": "error",
        // "no-floating-decimal": "error",
        // "no-implicit-coercion": "error",
        // "no-lonely-if": "error",
        // "no-multi-spaces": "error",
        // "no-multiple-empty-lines": "error",
        // "no-regex-spaces": "error",
        // "no-trailing-spaces": "error",
        // "no-undef-init": "error",
        // "no-unneeded-ternary": "error",
        // "no-unsafe-negation": "error",
        // "no-unused-labels": "error",
        // "no-useless-computed-key": "error",
        // "no-useless-rename": "error",
        // "no-useless-return": "error",
        // "no-var": "error",
        // "no-whitespace-before-property": "error",
        // "nonblock-statement-body-position": "error",
        // "object-curly-newline": "error",
        // "object-curly-spacing": "error",
        // "object-property-newline": "error",
        // "object-shorthand": "error",
        // "one-var": "error",
        // "one-var-declaration-per-line": "error",
        // "operator-assignment": "error",
        // "operator-linebreak": "error",
        // "padded-blocks": "error",
        // "padding-line-between-statements": "error",
        // "prefer-arrow-callback": "error",
        // "prefer-destructuring": "error",
        // "prefer-numeric-literals": "error",
        // "prefer-object-spread": "error",
        // "prefer-template": "error",
        // "rest-spread-spacing": "error",
        // "semi": "error",
        // "semi-style": "error",
        // "sort-imports": "error",
        // "sort-vars": "warn",
        // "space-before-blocks": "error",
        // "space-unary-ops": "error",
        // "strict": "error",
        // "switch-colon-spacing": "error",
        // "template-curly-spacing": "error",
        // "template-tag-spacing": "error",
        // "unicode-bom": "error",
        // "wrap-iife": "error",
        // "wrap-regex": "error",
        // "yield-star-spacing": "error",
    },
};

module.exports = config;
