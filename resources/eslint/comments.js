import eslintComments from "@eslint-community/eslint-plugin-eslint-comments";

const CONFIG = [
    // eslint-comments:recommended
    {
        "name": "eslint-comments",
        "plugins": {
            "@eslint-community/eslint-comments": eslintComments,
        },
        "rules": {
            ...eslintComments.configs.recommended.rules,
            "@eslint-community/eslint-comments/disable-enable-pair": [
                "error",
                {
                    "allowWholeFile": true,
                },
            ],

            // XXX deprecated
            "@eslint-community/eslint-comments/no-unused-disable": "error",
        },
    },
];

export default Super =>
    class extends Super {

        // protected
        _createConfig () {
            return [

                //
                ...super._createConfig(),
                ...CONFIG,
            ];
        }
    };
