import passwords from "#core/passwords";
import { copyToClipboard } from "#core/utils";
import Command from "#lib/command";

export default class extends Command {

    // static
    static cli () {
        return {
            "options": {
                "copy": {
                    "description": "copy password to the clipboard",
                    "default": false,
                    "schema": { "type": "boolean" },
                },
            },
        };
    }

    // public
    async run () {
        const password = passwords.generatePassword();

        console.log( password.password );

        if ( process.cli.options.copy ) {
            copyToClipboard( password.password );

            console.log( "\nPassword copied to the clipboard" );
        }
    }
}
