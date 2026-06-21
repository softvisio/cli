import eslintRegexp from "eslint-plugin-regexp";

const CONFIG = [

        // recommended
        eslintRegexp.configs.recommended,

        // custom
        {
            "name": "regexp custom",
            "rules": {
                "regexp/require-unicode-regexp": "error",
                "regexp/require-unicode-sets-regexp": "error",
            },
        },
    ],
    OVERRIDES = [
        {
            "name": "regexp overrides",
            "rules": {
                "no-control-regex": "off",
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

        _createOverrides () {
            return [

                //
                ...super._createOverrides(),
                ...OVERRIDES,
            ];
        }
    };
