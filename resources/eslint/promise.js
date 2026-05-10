import eslintPromise from "eslint-plugin-promise";

const CONFIG = [

    // recommended
    eslintPromise.configs[ "flat/recommended" ],

    // custom
    {
        "name": "promise custom",
        "rules": {
            "promise/always-return": [
                "error",
                {
                    "ignoreLastCallback": true,
                },
            ],
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
