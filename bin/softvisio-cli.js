#!/usr/bin/env node

import "#core";

import CLI from "#core/cli";

import RPC from "#lib/commands/rpc";
import Wiki from "#lib/commands/wiki";
import Docs from "#lib/commands/docs";
import Icons from "#lib/commands/icons";
import Lint from "#lib/commands/lint";
import Publish from "#lib/commands/publish";
import Ls from "#lib/commands/ls";
import Log from "#lib/commands/log";
import Docker from "#lib/commands/docker";
import Git from "#lib/commands/git";
import Status from "#lib/commands/status";
import Test from "#lib/commands/test";

class App {
    static cli () {
        return {
            "title": "Softvisio build tool",
            "commands": {
                "rpc": RPC,
                "wiki": Wiki,
                "docs": Docs,
                "icons": Icons,
                "lint": Lint,
                "publish": Publish,
                "ls": Ls,
                "log": Log,
                "docker": Docker,
                "git": Git,
                "status": Status,
                "test": Test,
            },
        };
    }
}

CLI.parse( App );
