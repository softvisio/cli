import ansi from "#core/ansi";
import Table from "#core/text/table";
import Command from "#lib/command";

export default class extends Command {

    // static
    static cli () {
        return {
            "description": "By default it shows dirty (not commited or not pushed) packages. You can specify additional filters using command line options.",
            "options": {
                "unreleased": {
                    "short": "a",
                    "description": "show dirty and unreleased packages",
                    "default": false,
                    "schema": { "type": "boolean" },
                },
                "private": {
                    "short": "p",
                    "description": "show private packages only",
                    "default": false,
                    "schema": { "type": "boolean" },
                },
                "public": {
                    "short": "P",
                    "description": "show public packages only",
                    "default": false,
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
            "git": true,
            "package": false,
            "patterns": process.cli.arguments?.pattern,
        } );
        if ( !res.ok ) return res;

        const packages = res.data;

        const options = {
            "dirty": !process.cli.arguments?.pattern && !process.cli.options.unreleased
                ? true
                : null,
            "unreleased": process.cli.options.unreleased,
            "private": process.cli.options.private,
            "public": process.cli.options.public,
        };

        const table = new Table( {
            "columns": {
                "packageName": {
                    "title": ansi.hl( "PACKAGE NAME" ),
                    "headerAlign": "center",
                    "headerValign": "end",
                },
                "branchName": {
                    "title": ansi.hl( "BRANCH NAME" ),
                    "width": 15,
                    "headerAlign": "center",
                    "headerValign": "end",
                },
                "previousRelease": {
                    "title": ansi.hl( "PREVIOUS\nRELEASE" ),
                    "width": 23,
                    "align": "end",
                    "headerAlign": "center",
                },
                "dirty": {
                    "title": ansi.hl( "DIRTY\nSTATUS" ),
                    "width": 8,
                    "align": "end",
                    "headerAlign": "center",
                    "format": value => ( value
                        ? ansi.error( " DIRTY " )
                        : "- " ),
                },
                "pushed": {
                    "title": ansi.hl( "PUSH\nSTATUS" ),
                    "width": 8,
                    "align": "end",
                    "headerAlign": "center",
                },
                "unreleasedCommits": {
                    "title": ansi.hl( "UNRELEASED\nCOMMITS" ),
                    "width": 12,
                    "align": "end",
                    "headerAlign": "center",
                },
            },
        } ).pipe( process.stdout );

        for ( const pkg of packages ) {

            // public / private filter
            if ( options.private && !pkg.isPrivate ) continue;
            if ( options.public && pkg.isPrivate ) continue;

            const git = pkg.git;

            res = await git.getStatus( {
                "branchStatus": true,
            } );
            if ( !res.ok ) {

                // repo has no commits
                if ( res.status === 404 ) {
                    continue;
                }

                // git error
                else {
                    return result( res );
                }
            }
            const status = res.data;

            const currentBranchPushStatus = status.branchStatus[ status.head.branch ]?.ahead
                ? `${ status.branchStatus[ status.head.branch ].ahead }`
                : null;

            const isDirty = status.isDirty || currentBranchPushStatus,
                isUnreleased = ( status.previousReleaseDistance || ( !status.head.branch && status.head.abbrev ) ) && pkg.isReleaseEnabled;

            // unreleased filter includes unreleased and dirty packages
            if ( options.unreleased && !( isUnreleased || isDirty ) ) continue;

            // dirty filter
            if ( options.dirty && !isDirty ) continue;

            table.write( {
                "packageName": ( pkg.isPrivate
                    ? "🔒"
                    : "  " ) + " " + this.#prepareName( pkg ),
                "branchName": status.head.branch
                    ? status.head.branch
                    : ansi.error( status.head.abbrev ),
                "previousRelease": this.#formatVersion( status.previousRelease, pkg.isReleaseEnabled ) + ( status.previousRelease && status.releases?.lastRelease.eq( status.previousRelease )
                    ? " 🚩"
                    : "   " ),
                "dirty": status.isDirty,
                "pushed": currentBranchPushStatus
                    ? ansi.error( ` ${ currentBranchPushStatus } ` )
                    : " - ",
                "unreleasedCommits": pkg.isReleaseEnabled
                    ? ( status.previousReleaseDistance
                        ? ansi.error( ` ${ status.previousReleaseDistance } ` )
                        : " - " )
                    : ansi.dim( " DISABLED " ),
            } );
        }

        table.end();
    }

    // private
    #prepareName ( pkg ) {
        const [ owner, name ] = pkg.workspaceSlug.split( "/" );

        return ansi.dim( owner + "/" ) + ansi.hl( name );
    }

    #formatVersion ( version, isReleaseEnabled ) {
        if ( !isReleaseEnabled ) {
            return ansi.dim( " DISABLED " );
        }
        else if ( !version ) {
            return " - ";
        }
        else if ( version.isPreRelease ) {
            return ansi.warn( ` ${ version.versionString } ` );
        }
        else {
            return ` ${ version.versionString } `;
        }
    }
}
