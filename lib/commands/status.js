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
Package name:            ${ ansi.hl( config?.name || "-" ) }
Releasable:              ${ pkg.isReleaseEnabled
    ? ansi.ok( " RELEASABLE " )
    : ansi.error( " NOT RELEASABLE " ) }
Publishable:             ${ pkg.isPrivate
    ? "🔒 " + ansi.error( " PRIVATE " )
    : ansi.ok( " PUBLIC " ) }
Stable release (latest): ${ ansi.hl( status.releases.lastStableRelease?.versionString || "-" ) }
Last release (next):     ${ ansi.hl( status.releases.lastRelease?.versionString || "-" ) }

Branch:                  ${ ansi.hl( status.head.branch ) }
Current release:         ${ ansi.hl( status.currentRelease?.versionString || "-" ) }${ status.currentRelease && status.releases.lastRelease?.eq( status.currentRelease )
    ? " 🚩"
    : "" }
Working tree status:     ${ status.isDirty
    ? ansi.error( " DIRTY " )
    : ansi.ok( " COMMITED " ) }
Unreleased commits:      ${ pkg.isReleaseEnabled
    ? ( status.currentReleaseDistance
        ? ansi.error( " " + status.currentReleaseDistance + " " )
        : ansi.ok( " RELEASED " ) )
    : "-" }
`.trim() );

        // branch status
        console.log();
        console.log( "Branch status:" );
        console.log( await this.#createBranchStatus( pkg, status ) );

        // upstream links
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

        // localization status
        const localizationStatus = this.#createLocalizationStatus( pkg );

        if ( localizationStatus ) {
            console.log( "" );
            console.log( "Localization status:\n" + localizationStatus );
        }
    }

    // private
    async #createBranchStatus ( pkg, status ) {
        const table = new Table( {
            "ansi": true,
            "width": 90,
            "columns": {
                "branch": {
                    "title": ansi.hl( "BRANCH" ),
                    "headerAlign": "center",
                    "headerValign": "end",
                    "format": branch => {
                        return `${ status.head.branch === branch
                            ? "🔶"
                            : "  " } ${ branch }`;
                    },
                },
                "syncStatus": {
                    "title": ansi.hl( "SYNC STATUS" ),
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

                                if ( status.behind ) {
                                    text.push( "pull: " + ansi.error( ` ${ status.behind } ` ) );
                                }

                                if ( status.ahead ) {
                                    text.push( "push: " + ansi.error( ` ${ status.ahead } ` ) );
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
                                    ? " 🚩"
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

        for ( const branch of Object.keys( status.branchStatus ).sort() ) {
            const res = await pkg.git.getCurrentRelease( { "commitRef": branch } );

            table.write( {
                branch,
                "syncStatus": status.branchStatus[ branch ],
                "currentRelease": res.data,
                "unreleasedCommits": res.data,
            } );
        }

        table.end();

        return `${ table.content.trim() }
🔶 - current branch
🚩 - latest release
`.trim();
    }

    #createLocalizationStatus ( pkg ) {
        const localizationStatus = pkg.localization.status(),
            table = new Table( {
                "ansi": true,
                "width": 90,
                "columns": {
                    "isTranslated": {
                        "title": ansi.hl( "STATUS" ),
                        "headerAlign": "center",
                        "headerValign": "end",
                        "width": 13,
                        "align": "end",
                        "format": isTranslated => {
                            return isTranslated
                                ? " OK "
                                : ansi.error( " FUZZY " );
                        },
                    },
                    "poFilePath": {
                        "title": ansi.hl( "PATH" ),
                        "headerAlign": "center",
                        "headerValign": "end",
                    },
                },
            } );

        if ( localizationStatus.data ) {
            for ( const [ poFilePath, isTranslated ] of Object.entries( localizationStatus.data ) ) {
                table.write( {
                    poFilePath,
                    isTranslated,
                } );
            }
        }

        table.end();

        return table.content;
    }
}
