'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var lightdash = require('lightdash');
var Log = _interopDefault(require('log'));
var Clingy = _interopDefault(require('cli-ngy'));

const mapCommand = (key, command) => {
    const result = command;
    result.powerRequired = !lightdash.isUndefined(result.powerRequired)
        ? result.powerRequired
        : 0;
    result.hidden = !lightdash.isUndefined(result.hidden) ? result.hidden : false;
    result.help = !lightdash.isUndefined(result.help) ? result.help : {};
    result.help.short = !lightdash.isUndefined(result.help.short)
        ? result.help.short
        : "No help provided";
    result.help.long = !lightdash.isUndefined(result.help.long)
        ? result.help.long
        : result.help.short;
    result.args.map(arg => (!lightdash.isUndefined(arg.help) ? arg.help : "No help provided"));
    if (result.sub) {
        result.sub = lightdash.objMap(result.sub, mapCommand);
    }
    return result;
};
const mapCommands = (commands) => lightdash.objMap(commands, mapCommand);

/*
const jsonToYaml = require("../../util/jsonToYaml"); */
/**
 * Turns an array into a humanized string
 *
 * @param {Array<string>} arr
 * @returns {string}
 */
/* const humanizeList = arr => arr.join(", "); */
/**
 * Displays list of all non-hidden commands
 *
 * @param {Object} commands
 * @param {Dingy} app
 * @returns {string}
 */
/* const getHelpAll = function (commands, app) {
    const result = {};

    commands.map.forEach((command, commandName) => {
        if (!command.hidden) {
            if (command.sub) {
                result[commandName] = {
                    desc: command.help.short,
                    subcommands: humanizeList(Array.from(command.sub.map.keys()))
                };
            } else {
                result[commandName] = command.help.short;
            }
        }
    });

    return ["Help", app.strings.separator, jsonToYaml(result)].join("\n");
}; */
/**
 * Displays help for a single command
 *
 * @param {Object} command
 * @param {Array<string>} commandPath
 * @param {Dingy} app
 * @returns {string}
 */
/* const getHelpSingle = function (command, commandPath, app) {
    const result = {
        desc: command.help.long
    };

    if (command.alias.length > 0) {
        result.alias = humanizeList(command.alias);
    }

    if (command.args.length > 0) {
        result.args = {};

        command.args.forEach(arg => {
            result.args[arg.name] = {};

            if (arg.help) {
                result.args[arg.name].desc = arg.help;
            }

            if (arg.required) {
                result.args[arg.name].required = arg.required;
            }
        });
    }

    if (command.sub) {
        result.sub = Array.from(command.sub.getAll().map.keys());
    }

    return [`Help for '${commandPath.join(" ")}'`, app.strings.separator, jsonToYaml(result)].join("\n");
};
 */
/**
 * Displays help
 *
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {string}
 */
const commandCoreHelp = (args, msg, app) => {
    /* const commandPath = args._all;

    if (commandPath.length > 0) {
        const commandLookup = app.cli.getCommand(commandPath);

        if (commandLookup.success) {
            return [getHelpSingle(commandLookup.command, commandPath, app), "yaml"];
        } else {
            return `Command '${commandPath.join(" ")}' not found`;
        }
    } else {
        return [getHelpAll(app.cli.getAll(), app), "yaml"];
    } */
    return "ok";
};

/* eslint no-unused-vars: "off", no-console: "off" */
/**
 * Evaluates
 *
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {false}
 */
const commandCoreEval = (args, msg, app) => {
    return "";
};

/**
 * Echos text
 *
 * @param {Array<any>} args
 * @returns {string}
 */
const commandCoreEcho = args => args.text;

/**
 * Exits the process
 *
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {string}
 */
const commandCoreDie = (args, msg, app) => {
    app.bot.setTimeout(() => {
        // @ts-ignore
        process.exit();
    }, 1000);
    return "Shutting down.";
};

const commandsDefault = {
    die: {
        fn: commandCoreDie,
        args: [],
        alias: ["quit", "exit"],
        powerRequired: 10,
        hidden: true,
        help: {
            short: "Kills the bot",
            long: "Kills the bot"
        },
        sub: null
    },
    eval: {
        fn: commandCoreEval,
        args: [
            {
                name: "code",
                required: true,
                help: "Code to run "
            }
        ],
        alias: ["dump"],
        powerRequired: 10,
        hidden: true,
        help: {
            short: "Executes JS code",
            long: "Executes JS code, dangerous!"
        },
        sub: null
    },
    echo: {
        fn: commandCoreEcho,
        args: [
            {
                name: "text",
                required: true,
                help: "Text to echo"
            }
        ],
        alias: ["say"],
        powerRequired: 8,
        hidden: true,
        help: {
            short: "Echos text",
            long: "Echos text"
        },
        sub: null
    },
    help: {
        fn: commandCoreHelp,
        args: [
            {
                name: "command",
                required: false,
                default: null,
                help: "Command to get help for"
            }
        ],
        alias: ["commands"],
        hidden: false,
        powerRequired: 0,
        help: {
            short: "Shows help",
            long: "Shows help for one or all commands"
        },
        sub: null
    }
};

const configDefault = {
    prefix: "myPrefix",
    token: "#botToken#",
    dataPersisted: {
        dir: "./data/",
        files: [] // File names, "foo" will be saved as "foo.json" and can be accessed with bot.dataPersisted.foo
    },
    roles: [
        {
            name: "Admin",
            power: 10,
            assignable: false,
            check: member => [].includes(member.user.id)
        },
        {
            name: "User",
            power: 1,
            assignable: true,
            check: () => true
        }
    ],
    options: {
        enableDefaultCommands: true,
        namesAreCaseSensitive: false,
        validQuotes: ['"'],
        answerToMissingCommand: false,
        answerToMissingArgs: true,
        answerToMissingPerms: true,
        sendFilesForLongReply: true,
        logLevel: "debug" // Level of log messages recommended to be either "debug" or "info", but can be any supported log-level
    }
};

const stringsDefault = {
    currentlyPlaying: "with bots",
    separator: "-".repeat(12),
    infoSimilar: "Did you mean",
    infoEmpty: "Empty message",
    infoTooLong: "The output was too long to print",
    infoInternal: "Internal error",
    errorUnknownCommand: "Unknown command",
    errorMissingArgs: "Missing argument",
    errorPermission: "You don't have permissions to access this command",
    errorTooLong: "The output was too long to print or to send as a file",
    errorInternal: "Internal error"
};

const userEventsDefault = {
    onInit: () => { },
    onMessage: () => { },
    onConnect: () => { }
};

/* import onMessage from "./lib/events/onMessage";
import onError from "./lib/events/onError";
;*/
/**
 * Di-ngy class
 *
 * @class
 */
const Dingy = class {
    /**
     * Creates Di-ngy instance
     *
     * @constructor
     * @param {Object} config
     * @param {Object} commands
     * @param {Object} strings
     * @param {Object} userEvents
     */
    constructor(config, commands = {}, strings = {}, userEvents = {}) {
        if (lightdash.isUndefined(config.token)) {
            throw new Error("No token provided!");
        }
        /**
         * Stores instance config
         */
        this.config = lightdash.objDefaultsDeep(config, configDefault);
        this.strings = lightdash.objDefaultsDeep(strings, stringsDefault);
        this.userEvents = lightdash.objDefaultsDeep(userEvents, userEventsDefault);
        this.log = new Log(this.config.options.logLevel);
        //this.log.debug("Init", "Loaded Config");
        this.cli = new Clingy(mapCommands(lightdash.objDefaultsDeep(commands, commandsDefault)), {
            caseSensitive: this.config.options.namesAreCaseSensitive,
            validQuotes: this.config.options.validQuotes
        });
        //this.log.debug("Init", "Created Clingy");
        /**
         * Bootstraps Client
         */
        /*         this.bot = new Discord.Client();
        this.log.debug("Init", "Created Discord Client");

        this.data = {};
        this.dataPersisted = {};

        this.config.dataPersisted.files.forEach(fileName => {
            this.dataPersisted[fileName] = flatCache.load(
                `${fileName}.json`,
                this.config.dataPersisted.dir
            );
        });
        this.log.debug("Init", "Loaded Data"); */
        /**
         * Binds events
         */
        /*         this.bot.on("message", msg => {
            onMessage(msg, this);
            this.userEvents.onMessage(msg, this);
        });
        this.bot.on("disconnect", err => {
            this.log.warning("Disconnect", err);
            onError(err, this);
        });
        this.bot.on("error", err => {
            this.log.error("Error", err);
            onError(err, this);
        });

        this.log.info("Init", "Success");
        this.userEvents.onInit(this);*/
    }
    /**
     * Connect to the Discord API
     */
    connect() {
        /*         this.log.info("Connect", "Starting");

        this.bot
            .login(this.config.token)
            .then(() => {
                this.log.info("Connect", "Success");
                this.bot.user.setActivity(this.strings.currentlyPlaying);
                this.userEvents.onConnect(this);
            })
            .catch(() => {
                this.log.error("Connect", "Failure");

                throw new Error(
                    "An error ocurred connecting to the Discord-API"
                );
            }); */
    }
};

module.exports = Dingy;
