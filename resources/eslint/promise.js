import eslintPromise from "eslint-plugin-promise";

const CONFIG = [

    // recommended
    eslintPromise.configs[ "flat/recommended" ],

    // custom
    {
        "name": "promise custom",
        "rules": {

            // XXX investigate
            "promise/always-return": [
                "off", // "error",
                {
                    "ignoreLastCallback": true,
                },
            ],

            // XXX investigate
            "promise/catch-or-return": "off",

            "promise/no-callback-in-promise": "error",
            "promise/no-nesting": "error",
            "promise/no-promise-in-callback": "error",
            "promise/no-return-in-finally": "error",
            "promise/valid-params": "error",
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
