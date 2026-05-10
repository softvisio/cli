import eslintPromise from "eslint-plugin-promise";

const CONFIG = [

    // recommended
    eslintPromise.configs[ "flat/recommended" ],

    // custom
    {
        "name": "promise custom",
        "rules": {

            // XXX
            "promise/always-return": [
                "off", // "error",
                {
                    "ignoreLastCallback": true,
                },
            ],

            // XXX investigate
            "promise/catch-or-return": "off",

            // XXX investigate
            "promise/no-callback-in-promise": "off", // "error"

            // XXX investigate
            "promise/no-promise-in-callback": "off", // "error"

            "promise/no-return-in-finally": "error",
            "promise/valid-params": [
                "error",
                {

                    // XXX add exclusion for "result.catch"
                    "exclude": [ "catch" ],
                },
            ],
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
