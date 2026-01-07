import ansi from "#core/ansi";
import NpmApi from "#core/api/npm";
import { TmpDir } from "#core/tmp";
import { repeatAction } from "#core/utils";

export default class Npm {
    #pkg;
    #api;

    constructor ( pkg ) {
        this.#pkg = pkg;

        this.#api = new NpmApi( {
            "cwd": this.#pkg.root,
        } );
    }

    // properties
    get pkg () {
        return this.#pkg;
    }

    get api () {
        return this.#api;
    }

    // public
    async publish ( { commitRef, accessStatus, repeatOnError } = {} ) {
        var res;

        res = await repeatAction(
            async () => {
                var res, error;

                try {
                    res = await this.#publish( { commitRef, accessStatus } );
                }
                catch ( e ) {
                    res = result.catch( e );

                    error = true;
                }

                console.log( `Publish npm package "${ this.pkg.name }":`, res + "" );

                if ( error ) {
                    throw res;
                }
                else {
                    return res;
                }
            },
            {
                repeatOnError,
            }
        );
        if ( !res.ok ) return res;

        res = await this.updateTags( {
            "log": true,
            repeatOnError,
        } );
        if ( !res.ok ) return res;

        if ( accessStatus ) {
            res = await this.setAccessStatus( accessStatus, { repeatOnError } );
            if ( !res.ok ) return res;
        }

        return result( 200 );
    }

    async updateTags ( { repeatOnError, logger } = {} ) {
        if ( this.pkg.isPrivate ) return result( [ 200, "Package is private" ] );

        logger ||= globalThis.console;

        return repeatAction(
            async () => {
                var res, error;

                if ( !this.pkg.name ) {
                    res = result( [ 500, "Package has no name" ] );
                }
                else {
                    res = await this.#updateTags();

                    error = true;
                }

                const statusText = Object.entries( res.data?.tags || {} )
                    .map( ( [ tag, version ] ) => `${ tag }: ${ version || "-" }` )
                    .join( ", " );

                logger.log( "Update npm tags:", res.ok
                    ? ( res.data.updated
                        ? ansi.ok( " Updated " ) + ", " + statusText
                        : "Not modified, " + statusText )
                    : ansi.error( " " + res.statusText + " " ) );

                if ( !res.ok && error ) {
                    throw res;
                }
                else {
                    return res;
                }
            },
            {
                repeatOnError,
            }
        );
    }

    async setAccessStatus ( accessStatus, { repeatOnError, logger } = {} ) {
        if ( this.pkg.isPrivate ) return result( [ 200, "Package is private" ] );

        logger ||= globalThis.console;

        return repeatAction(
            async () => {
                var res, error;

                if ( !this.pkg.name?.startsWith( "@" ) ) {
                    res = result( [ 500, "Package name is not valid" ] );
                }
                else {
                    res = await this.#setAccessStatus( accessStatus );

                    error = true;
                }

                logger.log( "Set npm access status:", res.ok
                    ? ( res.data.updated
                        ? ansi.ok( " Updated " ) + ", access status: " + res.data.accessStatus
                        : "Not modified, access status: " + res.data.accessStatus )
                    : ansi.error( " " + res.statusText + " " ) );

                if ( !res.ok && error ) {
                    throw res;
                }
                else {
                    return res;
                }
            },
            {
                repeatOnError,
            }
        );
    }

    // private
    async #publish ( { commitRef, accessStatus } = {} ) {
        commitRef ||= "HEAD";

        if ( this.pkg.isPrivate ) return result( [ 200, "Package is private" ] );
        if ( !this.pkg.name ) return result( [ 500, "Package has no name" ] );

        var res;

        // get commit
        res = await this.pkg.git.getCommit( { commitRef } );
        if ( !res.ok ) throw res;
        const commit = res.data;

        // commit is not a release
        if ( !commit?.isRelease ) return result( [ 400, "Git commit is not released" ] );

        // get package versions
        res = await this.api.getPackageVersions( this.pkg.name );
        if ( !res.ok ) {

            // package not found
            if ( res.data?.error?.code === "E404" ) {
                res.data = null;
            }
            else {
                throw res;
            }
        }
        const versions = new Set( res.data );

        // version already published
        if ( versions.has( commit.releaseVersion.version ) ) return result( [ 200, "Package already published" ] );

        // checkout
        await using workTree = new TmpDir();
        res = await this.pkg.git.exec( [ `--work-tree=${ workTree.path }`, "checkout", commitRef, "--", "." ] );
        if ( !res.ok ) throw res;

        const { "default": Package } = await import( "#lib/package" ),
            pkg = new Package( workTree.path );

        // pack
        res = await pkg.npm.api.pack( {
            "executablesPatterns": pkg.cliConfig?.meta?.executables,
        } );
        if ( !res.ok ) throw res;
        await using pack = res.data.pack;

        if ( !pkg.name.startsWith( "@" ) ) {
            accessStatus = null;
        }

        // publish
        res = await pkg.npm.api.publish( {
            "packPath": pack.path,
            accessStatus,
            "tag": commit.tags.has( "latest" )
                ? "latest"
                : commit.tags.has( "next" )
                    ? "next"
                    : null,
        } );
        if ( !res.ok ) throw res;

        return result( 200 );
    }

    async #updateTags () {
        var res,
            updated = false;

        res = await this.pkg.git.getReleaseTags();
        if ( !res.ok ) return res;

        const tags = {
            "latest": res.data.latest.version,
            "next": res.data.next.version,
        };

        res = await this.api.getPackageTags( this.pkg.name );
        if ( !res.ok ) return res;
        const remoteTags = res.data;

        for ( const [ tag, version ] of Object.entries( tags ) ) {

            // set
            if ( version && remoteTags[ tag ] !== version ) {
                res = await this.api.setPackageTag( this.pkg.name, version, tag );
                if ( !res.ok ) return res;

                updated = true;
            }

            // delete
            else if ( remoteTags[ tag ] && !version ) {
                res = await this.api.deletePackageTag( this.pkg.name, tag );
                if ( !res.ok ) return res;

                updated = true;
            }
        }

        return result( 200, {
            updated,
            tags,
        } );
    }

    async #setAccessStatus ( accessStatus ) {
        var res,
            updated = false;

        res = await this.api.getPackageAccessStatus( this.pkg.name );
        if ( !res.ok ) return res;

        if ( res.data.accessStatus !== accessStatus ) {
            res = await this.api.setPackageAccessStatus( this.pkg.name, accessStatus );
            if ( !res.ok ) return res;

            updated = true;
        }

        return result( 200, {
            updated,
            accessStatus,
        } );
    }
}
