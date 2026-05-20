import passwords from "#core/passwords";
import { copyToClipboard } from "#core/utils";
import Command from "#lib/command";

export default class extends Command {

    // static
    static cli () {
        return {
            "options": {
                "strength": {
                    "short": "s",
                    "description": "Password strength.",
                    "default": "strong",
                    "schema": {
                        "enum": [ "strong", "normal", "weak" ],
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
        const password = passwords.generatePassword( {
            "strength": process.cli.options.strength,
        } );

        console.log( password.password );
        console.log( `Entropy: ${ password.entropy } bits` );

        if ( process.cli.options.copy ) {
            copyToClipboard( password.password );

            console.log();
            console.log( "Password copied to the clipboard" );
        }
    }
}
