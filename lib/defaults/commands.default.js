"use strict";

const core_help = require("../commands/core/help");
const core_eval = require("../commands/core/eval");
const core_dump = require("../commands/core/dump");
const core_echo = require("../commands/core/echo");
const core_die = require("../commands/core/die");

module.exports = {
    help: {
        fn: core_help,
        alias: ["man"],
        args: [{
            name: "command",
            default: null,
            required: false,
            help: "Command to get help for"
        }],
        powerRequired: 0,
        help: {
            short: "Shows help",
            long: "Shows help for one or all commands"
        }
    },
    eval: {
        fn: core_eval,
        alias: [],
        args: [{
            name: "code",
            required: true,
            help: "Code to run "
        }],
        powerRequired: 10,
        hidden: true,
        help: {
            short: "Executes JS code",
            long: "Executes JS code, dangerous!"
        }
    },
    dump: {
        fn: core_dump,
        alias: [],
        args: [{
            name: "code",
            required: true,
            help: "Code to run and dump"
        }],
        powerRequired: 10,
        hidden: true,
        help: {
            short: "Executes JS code and dumps the result",
            long: "Executes JS code and dumps the result as message, dangerous!"
        }
    },
    echo: {
        fn: core_echo,
        alias: [],
        args: [{
            name: "text",
            required: true,
            help: "Text to echo"
        }],
        powerRequired: 8,
        hidden: true,
        help: {
            short: "Echos text",
            long: "Echos text"
        }
    },
    die: {
        fn: core_die,
        alias: ["quit", "exit"],
        args: [],
        powerRequired: 10,
        hidden: true,
        help: {
            short: "Kills the bot",
            long: "Kills the bot"
        }
    }
};
