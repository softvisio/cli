import ansi from "#core/ansi";
import Command from "#lib/command";

export default class extends Command {

    // static
    static cli () {
        return {
            "options": {
                "pre-release": {
                    "short": "p",
                    "description": "including pre-release versions",
                    "default": false,
                    "schema": { "type": "boolean" },
                },
                "sub-packages": {
                    "negatedShort": "S",
                    "description": "ignore sub-packages",
                    "default": true,
                    "schema": { "type": "boolean" },
                },
            },
        };
    }

    // public
    async run () {
        const pkg = this._findGitPackage();
        if ( !pkg ) return result( [ 500, "Unable to find package" ] );

        var printNewLine,
            hasErrors,
            cache = {};

        for ( const pack of [ pkg, ...( process.cli.options[ "sub-packages" ]
            ? pkg.subPackages
            : [] ) ] ) {
            const res = await pack.getOutdatedDependencies( {
                "preRelease": process.cli.options[ "pre-release" ],
                cache,
            } );

            if ( res.ok && !res.data.updates ) continue;

            if ( printNewLine ) {
                console.log();
            }
            else {
                printNewLine = true;
            }

            console.log( "Package:", ansi.hl( pkg.workspaceSlug ) );
            console.log( res.data.log );

            if ( !res.ok ) {
                hasErrors = true;
            }
        }

        if ( hasErrors ) {
            return result( [ 500, "Some dependencies wasn't updated" ] );
        }
        else {
            return result( 200 );
        }
    }
}
