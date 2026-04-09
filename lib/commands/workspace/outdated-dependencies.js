import ansi from "#core/ansi";
import ThreadsPoolQueue from "#core/threads/pool/queue";
import Command from "#lib/command";

export default class extends Command {

    // static
    static cli () {
        return {
            "options": {
                "sub-packages": {
                    "negatedShort": "S",
                    "description": "ignore sub-packages",
                    "default": true,
                    "schema": { "type": "boolean" },
                },
            },
            "arguments": {
                "pattern": {
                    "description": "Filter packages using glob patterns.",
                    "schema": { "type": "array", "items": { "type": "string", "format": "glob-pattern" } },
                },
            },
        };
    }

    // public
    async run () {
        var res = this._findWorkspacePackages( {
            "patterns": process.cli.arguments?.pattern,
        } );
        if ( !res.ok ) return res;

        const packages = res.data,
            threads = new ThreadsPoolQueue( {
                "maxRunningThreads": 5,
            } ),
            cache = {};

        for ( const pkg of packages ) {

            // main package
            threads.pushThread( async () => {
                const res = await pkg.getOutdatedDependencies( {
                    cache,
                } );

                res.data ??= {};
                res.data.package = pkg;

                return res;
            } );

            // sub-packages
            if ( process.cli.options[ "sub-packages" ] ) {
                for ( const subPkg of pkg.subPackages ) {
                    threads.pushThread( async () => {
                        const res = await subPkg.getOutdatedDependencies( {
                            cache,
                        } );

                        res.data ??= {};
                        res.data.package = subPkg;

                        return res;
                    } );
                }
            }
        }

        var hasErrors, printNewLine;

        while ( ( res = await threads.getResult() ) ) {
            if ( !res.data?.log ) continue;

            const pkg = res.data.package;

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
            return result( [ 500, "Some dependencies wasn't checked" ] );
        }
    }
}
