'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var lightdash = require('lightdash');
var Clingy = _interopDefault(require('cli-ngy'));
var discord_js = require('discord.js');

const mapCommand = (key, command) => {
    const result = command;
    result.powerRequired = lightdash.isDefined(result.powerRequired)
        ? result.powerRequired
        : 0;
    result.hidden = lightdash.isDefined(result.hidden) ? result.hidden : false;
    result.help = lightdash.isDefined(result.help) ? result.help : {};
    result.help.short = lightdash.isDefined(result.help.short)
        ? result.help.short
        : "No help provided";
    result.help.long = lightdash.isDefined(result.help.long)
        ? result.help.long
        : result.help.short;
    result.args = lightdash.isDefined(result.args) ? result.args : [];
    result.args.map(arg => (lightdash.isDefined(arg.help) ? arg.help : "No help provided"));
    if (result.sub) {
        result.sub = lightdash.objMap(result.sub, mapCommand);
    }
    return result;
};
const mapCommands = (commands) => lightdash.objMap(commands, mapCommand);

/**
 * Turns an array into a humanized string of optionals
 *
 * @param {Array<string>} arr
 * @returns {string}
 */
const humanizeListOptionals = (arr) => arr
    .map((item, index, data) => {
    if (index === 0) {
        return `'${item}'`;
    }
    else if (index < data.length - 1) {
        return `, '${item}'`;
    }
    else {
        return ` or '${item}'`;
    }
})
    .join("");

const eventsDefault = {
    onSend: () => { }
};
const dataDefaults = [
    "",
    false,
    [],
    eventsDefault
];
const dataFromValue = (val) => lightdash.objDefaultsDeep(lightdash.isString(val) ? [val] : val, dataDefaults);
const normalizeMessage = (data) => {
    if (data === false) {
        return {
            success: true,
            ignore: true,
            result: dataDefaults
        };
    }
    data.ignore = false;
    data.result = dataFromValue(data.result);
    return data;
};

const hasPermissions = (powerRequired, roles, member, guild) => {
    const checkResults = roles.map(role => (role.check(member, guild) ? role.power : 0));
    return Math.max(...checkResults) >= powerRequired;
};
const resolveCommandResult = (str, msg, app) => {
    const commandLookup = app.cli.parse(str);
    // Command check
    if (commandLookup.success) {
        const command = commandLookup.command;
        // Permission check
        if (hasPermissions(command.powerRequired, app.config.roles, msg.member, msg.guild)) {
            // Run command fn
            const result = command.fn(commandLookup.args, msg, app, commandLookup, msg.attachments);
            return {
                result,
                success: true
            };
        }
        else {
            return app.config.options.answerToMissingPerms
                ? {
                    result: `${app.strings.errorPermission}`,
                    success: false
                }
                : false;
        }
    }
    else {
        const error = commandLookup.error;
        if (error.type === "missingCommand") {
            if (app.config.options.answerToMissingCommand) {
                const content = [
                    `${app.strings.errorUnknownCommand} '${error.missing}'`
                ];
                if (error.similar.length > 0) {
                    content.push(`${app.strings.infoSimilar} ${humanizeListOptionals(error.similar)}?`);
                }
                return {
                    result: content.join("\n"),
                    success: false
                };
            }
            else {
                return false;
            }
        }
        else if (error.type === "missingArg") {
            if (app.config.options.answerToMissingArgs) {
                const missingNames = error.missing.map(item => item.name);
                return {
                    result: `${app.strings.errorMissingArgs} ${missingNames.join(",")}`,
                    success: false
                };
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
};
const resolveCommand = (str, msg, app) => normalizeMessage(resolveCommandResult(str, msg, app));

const MAX_SIZE_MESSAGE = 2000;
const MAX_SIZE_FILE = 8000000;
/**
 * Sends a message
 *
 * @param {Dingy} app
 * @param {Message} msg
 * @param {string} text
 * @param {boolean|string} code
 * @param {Array<any>} files
 */
const send = (app, msg, content) => msg.channel
    .send(content[0], {
    code: content[1],
    attachments: content[2]
})
    .then(msgSent => {
    //app.log.debug("SentMsg");
    content[3].onSend(msgSent);
})
    .catch(err => {
    //app.log.error("SentMsgError", err);
});
/**
 *  Checks if a message can be sent and continues
 *
 * @param {any} app
 * @param {any} msg
 * @param {any} data
 * @param {boolean} [isError=false]
 */
const pipeThroughChecks = (app, msg, commandResult, content) => {
    if (content[0].length === 0) {
        //app.log.notice("Empty");
        send(app, msg, dataFromValue(app.strings.infoEmpty));
    }
    else if (content[0].length > MAX_SIZE_MESSAGE) {
        if (app.config.options.sendFilesForLongReply) {
            const outputFile = Buffer.from(content[0]);
            if (content[0].length > MAX_SIZE_FILE) {
                //app.log.notice("TooLong", true);
                send(app, msg, dataFromValue(app.strings.infoTooLong));
            }
            else {
                const outputAttachment = new discord_js.Attachment(outputFile, "output.txt");
                //app.log.notice("TooLong", true);
                send(app, msg, [
                    app.strings.infoTooLong,
                    true,
                    [outputAttachment],
                    eventsDefault
                ]);
            }
        }
        else {
            //app.log.notice("TooLong", false);
            send(app, msg, app.strings.errorTooLong);
        }
    }
    else {
        //Normal case
        //app.log.debug("Sending");
        if (!commandResult.success) {
            content[1] = true;
        }
        send(app, msg, content);
    }
};
/**
 * Performs checks and waits for promise, then sends a message
 *
 * @param {Dingy} app
 * @param {Message} msg
 * @param {Array<any>|Promise} data
 */
const sendMessage = (app, msg, commandResult) => {
    const content = commandResult.result;
    if (lightdash.isPromise(content)) {
        content
            .then(contentResolved => {
            //app.log.debug("TextAsync");
            pipeThroughChecks(app, msg, commandResult, contentResolved);
        })
            .catch(err => {
            //app.log.error("ErrorInPromise", err);
        });
    }
    else {
        //app.log.debug("TextSync");
        pipeThroughChecks(app, msg, commandResult, content);
    }
};

const onMessage = (msg, app) => {
    const messageText = msg.content;
    /**
     * Basic Check
     * Conditions:
     *    NOT from the system
     *    NOT from a bot
     *    DOES start with prefix
     */
    if (!msg.system &&
        !msg.author.bot &&
        messageText.startsWith(app.config.prefix)) {
        const messageCommand = messageText.substr(app.config.prefix.length);
        const commandResult = resolveCommand(messageCommand, msg, app);
        //app.log.debug("Resolving", msg.author.id, messageCommand, commandResult);
        if (commandResult.ignore) {
            //app.log.debug("Ignoring");
        }
        else {
            sendMessage(app, msg, commandResult);
            //app.log.debug("Returning", msg.author.id);
        }
    }
};

const RECONNECT_TIMEOUT = 10000;
/**
 * onError event
 *
 * @param {Error} err
 * @param {Dingy} app
 */
const onError = (err, app) => {
    app.log.error("Reconnect", `Attempting to reconnect in ${RECONNECT_TIMEOUT}ms`);
    app.bot.setTimeout(() => {
        app.connect();
    }, RECONNECT_TIMEOUT);
};

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
    let result = "";
    try {
        result = eval(args.code);
    }
    catch (err) {
        result = err;
    }
    console.log(result);
    return String(result);
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
    onConnect: () => { },
    onMessage: () => { }
};

//import Log from "log";
//import flatCache from "flat-cache";
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
        this.log = null;
        //this.log.debug("Init", "Loaded Config");
        this.cli = new Clingy(mapCommands(lightdash.objDefaultsDeep(commands, commandsDefault)), {
            caseSensitive: this.config.options.namesAreCaseSensitive,
            validQuotes: this.config.options.validQuotes
        });
        //this.log.debug("Init", "Created Clingy");
        /**
         * Bootstraps Client
         */
        this.bot = new discord_js.Client();
        //this.log.debug("Init", "Created Discord Client");
        this.data = {};
        this.dataPersisted = {};
        /*this.config.dataPersisted.files.forEach(fileName => {
            this.dataPersisted[fileName] = flatCache.load(
                `${fileName}.json`,
                this.config.dataPersisted.dir
            );
        });
        this.log.debug("Init", "Loaded Data"); */
        /**
         * Binds events
         */
        this.bot.on("message", msg => {
            onMessage(msg, this);
            this.userEvents.onMessage(msg, this);
        });
        this.bot.on("disconnect", err => {
            //this.log.warning("Disconnect", err);
            onError(err, this);
        });
        this.bot.on("error", err => {
            //this.log.error("Error", err);
            onError(err, this);
        });
        //this.log.info("Init", "Success");
        this.userEvents.onInit(this);
    }
    /**
     * Connect to the Discord API
     */
    connect() {
        //this.log.info("Connect", "Starting");
        this.bot
            .login(this.config.token)
            .then(() => {
            //this.log.info("Connect", "Success");
            this.bot.user.setActivity(this.strings.currentlyPlaying);
            this.userEvents.onConnect(this);
        })
            .catch(() => {
            //this.log.error("Connect", "Failure");
            throw new Error("An error ocurred connecting to the Discord-API");
        });
    }
};

module.exports = Dingy;
