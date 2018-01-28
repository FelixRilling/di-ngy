'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var lightdash = require('lightdash');
var winston = require('winston');
var Clingy = _interopDefault(require('cli-ngy'));
var discord_js = require('discord.js');
var flatCache = _interopDefault(require('flat-cache'));
var fetch = _interopDefault(require('make-fetch-happen'));

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
 * slightly modified
 */
/*
    cycle.js
    2017-02-07

    Public Domain.
*/
const decycle = (object, replacer) => {
    const objects = new WeakMap();
    const derez = (value, path) => {
        let old_path; // The path of an earlier occurance of value
        let nu; // The new object or array
        // If a replacer function was provided, then call it to get a replacement value.
        if (lightdash.isDefined(replacer)) {
            value = replacer(value);
        }
        // typeof null === "object", so go on if this value is really an object but not
        // one of the weird builtin objects.
        if (lightdash.isObjectLike(value) &&
            !lightdash.isDate(value) &&
            !lightdash.isRegExp(value)) {
            // If the value is an object or array, look to see if we have already
            // encountered it. If so, return a {"$ref":PATH} object. This uses an
            // ES6 WeakMap.
            old_path = objects.get(value);
            if (lightdash.isDefined(old_path)) {
                return {
                    $ref: old_path
                };
            }
            // Otherwise, accumulate the unique value and its path.
            objects.set(value, path);
            // If it is an array, replicate the array.
            if (lightdash.isArray(value)) {
                nu = [];
                value.forEach((element, i) => {
                    nu[i] = derez(element, path + "[" + i + "]");
                });
            }
            else {
                // If it is an object, replicate the object.
                nu = {};
                lightdash.objKeys(value).forEach((name) => {
                    nu[name] = derez(value[name], path + "[" + JSON.stringify(name) + "]");
                });
            }
            return nu;
        }
        return value;
    };
    return derez(object, "$");
};

/**
 * Turns an array into a humanized string
 *
 * @param {Array<string>} arr
 * @returns {string}
 */
const humanizeList = (arr) => arr.join(", ");

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

const LINEBREAK = "\n";
const INDENT_CHAR = " ";
const INDENT_SIZE = 2;
/**
 * Indent string by factor
 *
 * @param {string} str
 * @param {number} factor
 * @returns {string}
 */
const indent = (str, factor) => INDENT_CHAR.repeat(factor * INDENT_SIZE) + str;
/**
 * Formats JSON as YAML
 *
 * @param {any} val
 * @param {number} [factor=0]
 * @returns {string}
 */
const format$1 = (val, factor = 0) => {
    if (lightdash.isString(val) && val.length > 0) {
        return val;
    }
    else if (lightdash.isNumber(val) || lightdash.isBoolean(val)) {
        return String(val);
    }
    else if (lightdash.isArray(val) && val.length > 0) {
        return LINEBREAK + val
            .filter(item => !lightdash.isFunction(item))
            .map(item => indent(format$1(item, factor + 1), factor))
            .join(LINEBREAK);
    }
    else if (lightdash.isObject(val) && lightdash.objKeys(val).length > 0) {
        return LINEBREAK + lightdash.objEntries(val)
            .filter(entry => !lightdash.isFunction(entry[1]))
            .map(entry => indent(`${entry[0]}: ${format$1(entry[1], factor + 1)}`, factor))
            .join(LINEBREAK);
    }
    else {
        return "";
    }
};
/**
 * Decycles and trims object after formating
 *
 * @param {Object} obj
 * @returns {string}
 */
const jsonToYaml = (obj) => format$1(decycle(obj)).replace(/\s+\n/g, "\n").trim();

const nodeFetch = fetch.defaults({
    cacheManager: "./.cache/"
});
/**
 * Loads an attachment and returns contents
 *
 * @param {MessageAttachment} attachment
 * @returns {Promise}
 */
const loadAttachment = (attachment) => new Promise((resolve, reject) => {
    nodeFetch(attachment.url)
        .then(response => response.text())
        .then(resolve)
        .catch(reject);
});

/**
 * resolves channel by id or name
 *
 * @param {string} channelResolvable
 * @param {Guild} guild
 * @returns {Channel|null}
 */
const resolveChannel = (channelResolvable, guild) => guild.channels.find((channel, id) => id === channelResolvable ||
    channel.name === channelResolvable);

/**
 * creates user+discrim from user
 *
 * @param {User} user
 * @returns {string}
 */
const toFullName = (user) => `${user.username}#${user.discriminator}`;

/**
 * resolves member by id, username, name#discrim or name
 *
 * @param {string} memberResolvable
 * @param {Guild} guild
 * @returns {Member|null}
 */
const resolveMember = (memberResolvable, guild) => guild.members.find((member, id) => id === memberResolvable ||
    toFullName(member.user) === memberResolvable ||
    member.user.username === memberResolvable ||
    member.nickname === memberResolvable);

/**
 * resolves user by id
 *
 * @param {string} userResolveable
 * @param {Guild} guild
 * @returns {Promise}
 */
const resolveUser = (userResolveable, bot) => bot.fetchUser(userResolveable);

const BLOCKED_KEYS = /_\w+|\$\w+|client|guild|lastMessage/;
/**
 * Checks if a value is to be kept in a filter iterator
 *
 * @param {any} value
 * @returns {boolean}
 */
const isLegalValue = (value) => !lightdash.isNil(value) && !lightdash.isFunction(value);
/**
 * Checks if a entry is to be kept in a filter iterator
 *
 * @param {Array<any>} entry
 * @returns {boolean}
 */
const isLegalEntry = (entry) => !BLOCKED_KEYS.test(entry[0]) && isLegalValue(entry[1]);
/**
 * Cycles and strips all illegal values
 *
 * @param {any} val
 * @returns {any}
 */
const strip = (val) => {
    if (lightdash.isString(val) || lightdash.isNumber(val) || lightdash.isBoolean(val)) {
        return val;
    }
    else if (lightdash.isArray(val)) {
        return val.filter(isLegalValue).map(strip);
    }
    else if (lightdash.isObject(val)) {
        const result = {};
        lightdash.objEntries(val)
            .filter(isLegalEntry)
            .forEach(entry => {
            result[entry[0]] = strip(entry[1]);
        });
        return result;
    }
    else {
        return null;
    }
};
/**
 * Strips sensitive data from bot output
 *
 * @param {Object} obj
 * @returns {any}
 */
const stripBotData = (obj) => strip(decycle(obj));

const util = {
    decycle,
    humanizeList,
    humanizeListOptionals,
    jsonToYaml,
    loadAttachment,
    resolveChannel,
    resolveMember,
    resolveUser,
    stripBotData,
    toFullName,
};

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
        return app.config.options.answerToMissingPerms
            ? {
                result: `${app.strings.errorPermission}`,
                success: false
            }
            : false;
    }
    const error = commandLookup.error;
    if (error.type === "missingCommand") {
        if (app.config.options.answerToMissingCommand) {
            const content = [
                `${app.strings.errorUnknownCommand} '${error.missing}'`
            ];
            if (error.similar.length > 0) {
                content.push(`${app.strings.infoSimilar} ${app.util.humanizeListOptionals(error.similar)}?`);
            }
            return {
                result: content.join("\n"),
                success: false
            };
        }
        return false;
    }
    else if (error.type === "missingArg") {
        if (app.config.options.answerToMissingArgs) {
            const missingNames = error.missing.map(item => item.name);
            return {
                result: `${app.strings.errorMissingArgs} ${missingNames.join(",")}`,
                success: false
            };
        }
        return false;
    }
    return false;
};
const resolveCommand = (str, msg, app) => normalizeMessage(resolveCommandResult(str, msg, app));

const MAX_SIZE_MESSAGE = 2000;
const MAX_SIZE_FILE = 8000000;
const send = (app, msg, content) => msg.channel
    .send(content[0], {
    code: content[1],
    attachments: content[2]
})
    .then(msgSent => {
    app.logger.debug("SentMsg");
    content[3].onSend(msgSent);
})
    .catch(err => {
    app.logger.error(`SentMsgError ${err}`);
});
const pipeThroughChecks = (app, msg, commandResult, content) => {
    if (content[0].length === 0) {
        app.logger.debug("Empty");
        send(app, msg, dataFromValue(app.strings.infoEmpty));
    }
    else if (content[0].length > MAX_SIZE_MESSAGE) {
        if (app.config.options.sendFilesForLongReply) {
            const outputFile = Buffer.from(content[0]);
            if (content[0].length > MAX_SIZE_FILE) {
                app.logger.debug("TooLong");
                send(app, msg, dataFromValue(app.strings.infoTooLong));
            }
            else {
                const outputAttachment = new discord_js.Attachment(outputFile, "output.txt");
                app.logger.debug("TooLong");
                send(app, msg, [
                    app.strings.infoTooLong,
                    true,
                    [outputAttachment],
                    eventsDefault
                ]);
            }
        }
        else {
            app.logger.debug("TooLong false");
            send(app, msg, dataFromValue(app.strings.errorTooLong));
        }
    }
    else {
        // Normal case
        app.logger.debug("Sending");
        if (!commandResult.success) {
            content[1] = true;
        }
        send(app, msg, content);
    }
};
const sendMessage = (app, msg, commandResult) => {
    const content = commandResult.result;
    if (lightdash.isPromise(content)) {
        content
            .then(contentResolved => {
            app.logger.debug("TextAsync");
            pipeThroughChecks(app, msg, commandResult, contentResolved);
        })
            .catch(err => {
            app.logger.error(`ErrorInPromise ${err}`);
        });
    }
    else {
        app.logger.debug("TextSync");
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
        app.logger.debug(`Resolving ${msg.author.id}`);
        if (commandResult.ignore) {
            app.logger.debug("Ignoring");
        }
        else {
            sendMessage(app, msg, commandResult);
            app.logger.debug(`Returning ${msg.author.id}`);
        }
    }
};

const RECONNECT_TIMEOUT = 10000;
const onError = (err, app) => {
    app.logger.warn(`reconnect: Attempting to reconnect in ${RECONNECT_TIMEOUT}ms`);
    app.bot.setTimeout(() => {
        app.connect();
    }, RECONNECT_TIMEOUT);
};

const getHelpAll = (commandsMap, app) => {
    const result = {};
    commandsMap.forEach((command, commandName) => {
        const subcommandsList = command.sub !== null ? app.util.humanizeList(lightdash.arrFrom(command.sub.map.keys())) : null;
        if (!command.hidden) {
            if (command.sub) {
                result[commandName] = {
                    desc: command.help.short,
                    subcommands: subcommandsList
                };
            }
            else {
                result[commandName] = command.help.short;
            }
        }
    });
    return [
        ["Help", app.strings.separator, app.util.jsonToYaml(result)].join("\n"),
        "yaml"
    ];
};
const getHelpSingle = (command, commandPath, app) => {
    const result = {
        desc: command.help.long,
        alias: null,
        args: null,
        sub: null
    };
    if (command.alias.length > 0) {
        result.alias = app.util.humanizeList(command.alias);
    }
    if (command.sub !== null) {
        result.sub = lightdash.arrFrom(command.sub.getAll().map.keys());
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
    return [
        [
            `Help for '${commandPath.join(" ")}'`,
            app.strings.separator,
            app.util.jsonToYaml(result)
        ].join("\n"),
        "yaml"
    ];
};
/**
 * Displays help
 *
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {string}
 */
const commandCoreHelp = (args, msg, app) => {
    const commandPath = args._all;
    if (commandPath.length > 0) {
        const commandLookup = app.cli.getCommand(commandPath);
        if (!commandLookup.success) {
            return `Command '${commandPath.join(" ")}' not found`;
        }
        return getHelpSingle(commandLookup.command, commandPath, app);
    }
    return getHelpAll(app.cli.getAll().map, app);
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
    separator: "-".repeat(3),
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
            throw new Error("No token provided");
        }
        this.util = util;
        /**
         * Stores instance config
         */
        this.config = lightdash.objDefaultsDeep(config, configDefault);
        this.strings = lightdash.objDefaultsDeep(strings, stringsDefault);
        this.userEvents = lightdash.objDefaultsDeep(userEvents, userEventsDefault);
        this.logger = winston.createLogger({
            level: this.config.options.logLevel,
            exitOnError: false,
            format: winston.format.combine(winston.format.timestamp(), winston.format.printf(info => {
                return `${info.timestamp} [${info.level}] ${info.message}`;
            })),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: "bot.log" })
            ]
        });
        this.logger.info("Init: Loaded Config");
        this.cli = new Clingy(mapCommands(lightdash.objMerge(commandsDefault, commands)), {
            caseSensitive: this.config.options.namesAreCaseSensitive,
            validQuotes: this.config.options.validQuotes
        });
        this.logger.info("Init: Created Clingy");
        /**
         * Bootstraps Client
         */
        this.bot = new discord_js.Client();
        this.logger.info("Init: Created Discord Client");
        this.data = {};
        this.dataPersisted = {};
        this.config.dataPersisted.files.forEach(fileName => {
            this.dataPersisted[fileName] = flatCache.load(`${fileName}.json`, this.config.dataPersisted.dir);
        });
        this.logger.info("Init: Loaded Data");
        /**
         * Binds events
         */
        this.bot.on("message", msg => {
            onMessage(msg, this);
            this.userEvents.onMessage(msg, this);
        });
        this.bot.on("disConnect", err => {
            this.logger.error("Dissconnect", err);
            onError(err, this);
        });
        this.bot.on("error", err => {
            this.logger.error("Error", err);
            onError(err, this);
        });
        this.logger.info("Init: Success");
        this.userEvents.onInit(this);
    }
    /**
     * Connect to the Discord API
     */
    connect() {
        this.logger.info("Connect: Starting");
        this.bot
            .login(this.config.token)
            .then(() => {
            this.logger.info("Connect: Success");
            this.bot.user.setActivity(this.strings.currentlyPlaying);
            this.userEvents.onConnect(this);
        })
            .catch(() => {
            this.logger.error("Connect: Error");
            throw new Error("An error ocurred Connecting to the Discord API");
        });
    }
};

module.exports = Dingy;
