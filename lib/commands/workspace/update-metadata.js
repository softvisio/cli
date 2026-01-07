import ansi from "#core/ansi";
import Logger from "#core/logger";
import ThreadsPoolQueue from "#core/threads/pool/queue";
import Command from "#lib/command";

export default class extends Command {

    // static
    static cli () {
        return {
            "options": {
                "update-dependabot": {
                    "negatedShort": "D",
                    "description": "do not update dependabot config",
                    "default": true,
                    "schema": { "type": "boolean" },
                },
                "update-repository": {
                    "short": "r",
                    "description": "configure upstream repository",
                    "default": false,
                    "schema": { "type": "boolean" },
                },
                "update-tags": {
                    "short": "t",
                    "description": "update release tags",
                    "default": false,
                    "schema": { "type": "boolean" },
                },
                "commit": {
                    "negatedShort": "C",
                    "description": "do not commit and push changes",
                    "default": true,
                    "schema": { "type": "boolean" },
                },
            },
            "arguments": {
                "pattern": {
                    "description": "Filter packages using glob patterns.",
                    "schema": { "type": "array", "items": { "type": "string" } },
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

        const packages = res.data;

        var length = 0,
            hasErrors;

        // find max. length
        for ( const pkg of packages ) {
            if ( pkg.workspaceSlug.length > length ) {
                length = pkg.workspaceSlug.length;
            }
        }

        const threads = new ThreadsPoolQueue( {
            "maxRunningThreads": 4,
        } );

        for ( const pkg of packages ) {
            threads.pushThread( async () => {
                const logger = new Logger( {
                        "stdout": "pipe",
                        "stderr": "stdout",
                    } ),
                    res = await pkg.updateMetadata( {
                        "updateDependabot": process.cli.options[ "update-dependabot" ],
                        "updateRepository": process.cli.options[ "update-repository" ],
                        "updateTags": process.cli.options[ "update-tags" ],
                        "commit": process.cli.options.commit,
                        logger,
                    } );

                res.data = {
                    pkg,
                    "log": logger.flush(),
                };

                return res;
            } );
        }

        while ( ( res = await threads.getResult() ) ) {
            const pkg = res.data.pkg;

            if ( !res.ok ) hasErrors = true;

            console.log( "Package:", ansi.hl( pkg.workspaceSlug ) );
            console.log( res.data.log );
        }

        if ( hasErrors ) {
            return result( 500 );
        }
        else {
            return result( 200 );
        }
    }
}
