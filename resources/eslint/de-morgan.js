import eslintDeMorgan from "eslint-plugin-de-morgan";

const CONFIG = [

    // recommended
    eslintDeMorgan.configs.recommended,
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
