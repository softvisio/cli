import ansi from "#core/ansi";
import ThreadsPoolQueue from "#core/threads/pool/queue";
import Command from "#lib/command";

export default class extends Command {

    // static
    static cli () {
        return {
            "options": {
                "reinstall": {
                    "short": "r",
                    "description": "reinstall dependencies",
                    "default": false,
                    "schema": {
                        "type": "boolean",
                    },
                },
                "commit": {
                    "negatedShort": "C",
                    "description": "do not commit and push changes",
                    "default": true,
                    "schema": {
                        "type": "boolean",
                    },
                },
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

        var hasErrors;

        const packages = res.data,
            threads = new ThreadsPoolQueue( {
                "maxRunningThreads": 5,
            } );

        for ( const pkg of packages ) {
            threads.pushThread( async () => {
                const res = await pkg.updateDependencies( {
                    "reinstall": process.cli.options.reinstall,
                    "commit": process.cli.options.commit,
                    "repeatOnError": false,
                } );

                res.data.package = pkg;

                return res;
            } );

            if ( process.cli.options[ "sub-packages" ] ) {
                for ( const subPkg of pkg.subPackages ) {
                    threads.pushThread( async () => {
                        const res = await subPkg.updateDependencies( {
                            "reinstall": process.cli.options.reinstall,
                            "commit": process.cli.options.commit,
                            "repeatOnError": false,
                        } );

                        res.data.package = pkg;

                        return res;
                    } );
                }
            }
        }

        while ( ( res = await threads.getResult() ) ) {
            if ( res.ok ) {
                const pkg = res.data.package;

                if ( res.ok ) {
                    if ( res.data.updates ) {
                        console.log( "Package:", ansi.hl( pkg.workspaceSlug ) );
                        console.log( res.data.log );
                    }
                }
                else {
                    console.log( "Package:", ansi.hl( pkg.workspaceSlug ) );
                    console.log( res.data.log );

                    hasErrors = true;
                }
            }
        }

        if ( hasErrors ) {
            return result( [ 500, "Some dependencies wasn't updated" ] );
        }
    }
}
