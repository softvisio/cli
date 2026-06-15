import passwords from "#core/crypto/passwords";
import { copyToClipboard } from "#core/utils";
import Command from "#lib/command";

export default class extends Command {

    // static
    static cli () {
        return {
            "options": {
                "bit-strength": {
                    "short": "s",
                    "description": "Password bit strength.",
                    "default": passwords.strongBitStrength,
                    "schema": {
                        "type": "integer",
                        "minimum": 1,
                    },
                },
                "length": {
                    "short": "l",
                    "description": "Password length.",
                    "schema": {
                        "type": "integer",
                        "minimum": 1,
                    },
                },
                "alphabet": {
                    "short": "a",
                    "description": "Password alphabet.",
                    "default": passwords.defaultAlphabet,
                    "schema": {
                        "enum": passwords.alphabets
                            .filter( alphabet => alphabet.tags.has( "ascii" ) )
                            .map( alphabet => alphabet.name )
                            .sort(),
                    },
                },
                "copy": {
                    "short": "c",
                    "description": "copy password to the clipboard",
                    "default": false,
                    "schema": { "type": "boolean" },
                },
            },
        };
    }

    // public
    async run () {
        const password = passwords.generateRandomPassword( {
            "alphabet": process.cli.options[ "alphabet" ],
            "bitStrength": process.cli.options[ "bit-strength" ],
            "length": process.cli.options[ "length" ],
        } );

        console.log( password.password );
        console.log();
        console.log( `Bit strength: ${ Math.floor( password.bitStrength ) } bits` );
        console.log( `Password is ${ password.strong
            ? "strong"
            : "weak" }` );

        if ( process.cli.options.copy ) {
            copyToClipboard( password.password );

            console.log();
            console.log( "Password copied to the clipboard" );
        }
    }
}
