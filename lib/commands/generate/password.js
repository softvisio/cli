import Passwords from "#core/crypto/passwords";
import Locale from "#core/locale";
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
                    "default": Passwords.default.bitStrengthThreshold,
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
                    "default": Passwords.default.defaultAlphabet,
                    "schema": {
                        "enum": Passwords.alphabets
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
        const password = Passwords.default.generateRandomPassword( {
            "alphabet": process.cli.options[ "alphabet" ],
            "bitStrength": process.cli.options[ "bit-strength" ],
            "length": process.cli.options[ "length" ],
        } );

        console.log( password.password );
        console.log();
        console.log( `
Length: ${ password.length } characters
Bit strength: ${ Math.floor( password.bitStrength ) } bits
Online systems (${ Locale.default.formatNumber( password.crackTime.online.rate ) }  attempts / second): ${ Locale.default.formatRelativeDate( password.crackTime.online.interval ) }
Offline systems (${ Locale.default.formatNumber( password.crackTime.offline.rate ) }  attempts / second): ${ Locale.default.formatRelativeDate( password.crackTime.offline.interval ) }
Password is ${ password.strong
    ? "strong"
    : "weak" }
`.trim() );

        if ( process.cli.options.copy ) {
            copyToClipboard( password.password );

            console.log();
            console.log( "Password copied to the clipboard" );
        }
    }
}
