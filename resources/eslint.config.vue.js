import eslintVue from "eslint-plugin-vue";
import Common from "./eslint/common.js";
import EslintConfig from "./eslint/config.js";
import mixins from "#core/mixins";

const CONFIG = [

    // vue:recommended
    ...eslintVue.configs[ "flat/recommended" ],

    // vue:custom
    {
        "name": "vue:custom",
        "rules": {
            // eslint-plugin-vue, https://eslint.vuejs.org/rules/
            "vue/attribute-hyphenation": [ "warn", "never" ], // for ExtJS webcomponents
            "vue/attributes-order": [ "error", { "alphabetical": true } ],
            "vue/component-definition-name-casing": [ "error", "PascalCase" ],
            "vue/component-name-in-template-casing": [ "error", "PascalCase", { "registeredComponentsOnly": true } ],
            "vue/custom-event-name-casing": [ "error", "camelCase" ],
            "vue/html-indent": [
                "warn",
                4,
                {
                    "baseIndent": 1,
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
            "vue/max-attributes-per-line": [ "warn", { "singleline": 100, "multiline": 1 } ],
            "vue/multi-word-component-names": "off",
            "vue/no-reserved-component-names": [ "error", { "disallowVue3BuiltInComponents": true } ],
            "vue/prop-name-casing": [ "error", "camelCase" ],
            "vue/script-indent": "off",
            "vue/v-on-event-hyphenation": [ "error", "never", { "autofix": false } ],
        },
    },
];

export class Config extends mixins( Common, EslintConfig ) {

    // protected
    _wrap ( config ) {
        return [

            //
            ...CONFIG,
            ...super._wrap( config ),
        ];
    }

    _customize ( editorConfig ) {
        const config = {
            "name": "customized vue config",
            "rules": {},
        };

        const indent = editorConfig.indent_style === "tab"
            ? "tab"
            : editorConfig.indent_size;

        config.rules[ "vue/html-indent" ] = [
            "warn",
            indent,
            {
                "baseIndent": 1,
            },
        ];

        return [

            //
            ...super._customize( editorConfig ),
            config,
        ];
    }
}

export default new Config().create();
