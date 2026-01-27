import CoreGit from "#core/api/git";
import SemanticVersion from "#core/semantic-version";
import GitChangelog from "./git/changelog.js";

export default class Git extends CoreGit {

    // public
    async getChangelog ( { commitRef, release, stable, commitTypes } = {} ) {
        var res;

        if ( release ) {
            res = await this.getCurrentRelease( {
                commitRef,
                stable,
                "changes": true,
            } );
            if ( !res.ok ) return res;

            // commit is not a branch HEAD
            if ( !res.data.commit.isBranchHead ) {
                return result( [ 400, "Commit should be a branch head" ] );
            }

            return result(
                200,
                new GitChangelog( res.data.changes, {
                    "upstream": this.upstream,
                    "previousRelease": res.data.currentRelease,
                    "currentRelease": null,
                    commitTypes,
                } )
            );
        }
        else {
            res = await this.getReleasesRange( {
                commitRef,
                stable,
                "changes": true,
            } );
            if ( !res.ok ) return res;

            return result(
                200,
                new GitChangelog( res.data.changes, {
                    "upstream": this.upstream,
                    "previousRelease": res.data.startRelease,
                    "currentRelease": res.data.endRelease,
                    commitTypes,
                } )
            );
        }
    }

    async createObject ( data ) {
        const res = await this.exec( [ "hash-object", "-w", "--stdin" ], {
            "input": data,
        } );

        if ( res.ok ) res.data = res.data.trim();

        return res;
    }

    async getReleaseTags ( { allowMajorTag } = {} ) {
        const res = await this.getTags();
        if ( !res.ok ) return res;

        const tags = {};

        if ( res.data ) {
            for ( const [ tag, commit ] of Object.entries( res.data ) ) {
                const isMajorTag = /^v\d+$/.test( tag );

                // release tag
                if ( /^v\d+\.\d+\.\d+/.test( tag ) ) {
                    if ( !SemanticVersion.isValid( tag ) ) continue;

                    const releaseVersion = new SemanticVersion( tag );

                    // next
                    tags.next ??= {};
                    tags.next.version ??= releaseVersion;
                    if ( releaseVersion.gt( tags.next.version ) ) {
                        tags.next.version = releaseVersion;
                    }

                    // major.next
                    const majorNextTag = `v${ releaseVersion.majorNumber }.next`;
                    tags[ majorNextTag ] ??= {};
                    tags[ majorNextTag ].version ??= releaseVersion;
                    if ( releaseVersion.gt( tags[ majorNextTag ].version ) ) {
                        tags[ majorNextTag ].version = releaseVersion;
                    }

                    // stable release
                    if ( releaseVersion.isStableRelease ) {

                        // latest
                        tags.latest ??= {};
                        tags.latest.version ??= releaseVersion;
                        if ( releaseVersion.gt( tags.latest.version ) ) {
                            tags.latest.version = releaseVersion;
                        }

                        // major.latest
                        const majorLatestTag = `v${ releaseVersion.majorNumber }.latest`;
                        tags[ majorLatestTag ] ??= {};
                        tags[ majorLatestTag ].version ??= releaseVersion;
                        if ( releaseVersion.gt( tags[ majorLatestTag ].version ) ) {
                            tags[ majorLatestTag ].version = releaseVersion;
                        }

                        // major
                        const majorTag = `v${ releaseVersion.majorNumber }`;
                        tags[ majorTag ] ??= {
                            "isMajorTag": true,
                        };
                        tags[ majorTag ].version = tags[ majorLatestTag ].version;
                    }
                }
                else if ( tag === "latest" || tag === "next" || /^v\d+\.(?:latest|next)$/.test( tag ) || isMajorTag ) {
                    tags[ tag ] ??= {
                        isMajorTag,
                    };

                    if ( commit.isRelease ) {
                        tags[ tag ].current = commit.releaseVersion.version;
                    }
                    else {
                        tags[ tag ].current = false;
                    }
                }
            }
        }

        const releaseTags = {};

        for ( const tag in tags ) {
            releaseTags[ tag ] = {
                "version": tags[ tag ].version?.version,
                "action": null,
            };

            // tag is not set
            if ( tags[ tag ].current == null ) {
                if ( tags[ tag ].isMajorTag && !allowMajorTag ) {
                    delete releaseTags[ tag ];
                }
                else if ( tags[ tag ].version ) {
                    releaseTags[ tag ].action = "update";
                }
            }

            // major tag is set, but not allowed
            else if ( tags[ tag ].isMajorTag && !allowMajorTag ) {
                releaseTags[ tag ].action = "delete";
            }

            // tag is set, but has no version
            else if ( !tags[ tag ].version ) {
                releaseTags[ tag ].action = "delete";
            }

            // tag is set incorrectly
            else if ( tags[ tag ].current === false ) {
                releaseTags[ tag ].action = "update";
            }

            // tag is set, but version is not valid
            else if ( tags[ tag ].current !== tags[ tag ].version.version ) {
                releaseTags[ tag ].action = "update";
            }
        }

        return result( 200, releaseTags );
    }
}
