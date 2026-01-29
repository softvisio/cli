import ansi from "#core/ansi";
import Table from "#core/text/table";
import Command from "#lib/command";

export default class extends Command {

    // static
    static cli () {
        return {};
    }

    // public
    async run () {
        const pkg = this._findGitRoot();
        if ( !pkg ) return result( [ 500, "Unable to find git root" ] );

        const git = pkg.git;

        var res;

        res = await git.getStatus( {
            "branchStatus": true,
        } );
        if ( !res.ok ) return res;
        const status = res.data;

        const upstream = git.upstream;

        const config = pkg.config;

        console.log( `
Name:                    ${ ansi.hl( config?.name || "-" ) }
Releasable:              ${ pkg.isReleaseEnabled
    ? ansi.ok( " RELEASABLE " )
    : ansi.error( " NOT RELEASABLE " ) }
Private:                 ${ pkg.isPrivate
    ? ansi.error( " PRIVATE " )
    : ansi.ok( " PUBLIC " ) }
Branch:                  ${ ansi.hl( status.head.branch ) }
Current release:         ${ ansi.hl( status.currentRelease || "-" ) }
Stable release (latest): ${ ansi.hl( status.releases.lastStableRelease || "-" ) }
Last release (next):     ${ ansi.hl( status.releases.lastRelease || "-" ) }
Is dirty:                ${ status.isDirty
    ? ansi.error( " DIRTY " )
    : ansi.ok( " COMMITED " ) }
Unreleased commits:      ${ pkg.isReleaseEnabled
    ? ( status.currentReleaseDistance
        ? ansi.error( " " + status.currentReleaseDistance + " " )
        : ansi.ok( " RELEASED " ) )
    : "-" }

Branch status:
${ await this.#createBranchStatus( pkg, status.branchStatus ) }
        `.trim() );

        if ( upstream ) {
            console.log();

            console.log( `
Home:                    ${ ansi.hl( upstream.homeUrl ) }
Issues:                  ${ ansi.hl( upstream.issuesUrl ) }
Wiki:                    ${ ansi.hl( upstream.wikiUrl ) }
Docs:                    ${ ansi.hl( pkg.docsUrl || "-" ) }

Clone:                   ${ ansi.hl( upstream.sshCloneUrl ) }
Clone wiki:              ${ ansi.hl( upstream.wikiSshCloneUrl ) }
            `.trim() );
        }

        const localizationStatus = pkg.localization.status();

        if ( localizationStatus.data ) {
            console.log( "\nLocalization status:\n" );

            for ( const [ poFilePath, isTranslated ] of Object.entries( localizationStatus.data ) ) {
                console.log( isTranslated
                    ? " OK    "
                    : ansi.error( " FUZZY " ), poFilePath );
            }
        }
    }

    // private
    async #createBranchStatus ( pkg, branchStatus ) {
        const table = new Table( {
            "ansi": true,
            "columns": {
                "branch": {
                    "title": ansi.hl( "BRANCH" ),
                    "headerAlign": "center",
                    "headerValign": "end",
                    "width": 30,
                },
                "pushStatus": {
                    "title": ansi.hl( "PUSH STATUS" ),
                    "headerAlign": "center",
                    "headerValign": "end",
                    "width": 20,
                    "align": "end",
                    "format": status => {
                        if ( status.upstream ) {
                            if ( status.synchronized ) {
                                return " - ";
                            }
                            else {
                                const text = [];

                                if ( status.ahead ) {
                                    text.push( "push: " + ansi.error( ` ${ status.ahead } ` ) );
                                }

                                if ( status.behind ) {
                                    text.push( "pull: " + ansi.error( ` ${ status.behind } ` ) );
                                }

                                return text.join( ", " );
                            }
                        }
                        else {
                            return ansi.dim( "NOT TRACKED" );
                        }
                    },
                },
                "currentRelease": {
                    "title": ansi.hl( "CURRENT\nRELEASE" ),
                    "headerAlign": "center",
                    "headerValign": "end",
                    "width": 15,
                    "align": "end",
                    "format": status => {
                        if ( pkg.isReleaseEnabled ) {
                            if ( status.currentRelease ) {
                                return `${ status.currentRelease.versionString }${ status.releases.lastRelease.eq( status.currentRelease )
                                    ? " ✅️"
                                    : "   " }`;
                            }
                            else {
                                return " - " + "   ";
                            }
                        }
                        else {
                            return ansi.dim( " DISABLED " );
                        }
                    },
                },
                "unreleasedCommits": {
                    "title": ansi.hl( "UNRELEASED\nCOMMITS" ),
                    "headerAlign": "center",
                    "headerValign": "end",
                    "width": 15,
                    "align": "end",
                    "format": status => {
                        if ( pkg.isReleaseEnabled ) {
                            if ( status.currentReleaseDistance ) {
                                return ansi.error( ` ${ status.currentReleaseDistance } ` );
                            }
                            else {
                                return " - ";
                            }
                        }
                        else {
                            return ansi.dim( " DISABLED " );
                        }
                    },
                },
            },
        } );

        for ( const branch of Object.keys( branchStatus ).sort() ) {
            const res = await pkg.git.getCurrentRelease( { "commitRef": branch } );

            table.write( {
                branch,
                "pushStatus": branchStatus[ branch ],
                "currentRelease": res.data,
                "unreleasedCommits": res.data,
            } );
        }

        table.end();

        return table.content + "✅️ - latest release";
    }
}
