import { isNil, isUndefined, objDefaultsDeep, objMap, isString, isPromise, isArray, isDate, isObjectLike, isRegExp, isBoolean, isFunction, isNumber, isObject } from 'lightdash';
import { Attachment, Client } from 'discord.js';
import fetch from 'make-fetch-happen';
import Clingy from 'cli-ngy';
import flatCache from 'flat-cache';
import { createLogger, format, transports } from 'winston';

const NO_HELP = "No help provided";
const commandDefault = {
    fn: () => "",
    args: [],
    alias: [],
    powerRequired: 0,
    hidden: false,
    usableInDMs: false,
    help: {
        short: NO_HELP
    },
    sub: null
};
const mapCommand = (key, command) => {
    const result = objDefaultsDeep(command, commandDefault);
    result.args.map(arg => (!isUndefined(arg.help) ? arg.help : NO_HELP));
    if (isUndefined(result.help.long)) {
        result.help.long = result.help.short;
    }
    if (!isNil(result.sub)) {
        result.sub = objMap(result.sub, mapCommand);
    }
    return result;
};
const mapCommands = (commands) => objMap(commands, mapCommand);

const RECONNECT_TIMEOUT = 10000;
const onError = (err, app) => {
    app.logger.warn(`Reconnect: Attempting to reconnect in ${RECONNECT_TIMEOUT}ms`);
    app.bot.setTimeout(() => {
        app.connect();
    }, RECONNECT_TIMEOUT);
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
const dataFromValue = (val) => objDefaultsDeep(isString(val) ? [val] : val, dataDefaults);
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

const hasPermissions = (powerRequired, roles, msg) => {
    const checkResults = roles.map(role => (role.check(msg) ? role.power : 0));
    return Math.max(...checkResults) >= powerRequired;
};
const resolveCommandResult = (str, msg, app) => {
    const commandLookup = app.cli.parse(str);
    // Command check
    if (commandLookup.success) {
        const command = commandLookup.command;
        const isDM = !msg.guild;
        if (isDM && !command.usableInDMs) {
            return false;
        }
        // Permission check
        if (hasPermissions(command.powerRequired, app.config.roles, msg)) {
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
    .send(content[0].trim(), {
    code: content[1],
    files: content[2]
})
    .then(msgSent => {
    app.logger.debug(`SentMsg: ${content[0]}`);
    content[3].onSend(msgSent);
})
    .catch(err => {
    app.logger.error(`SentMsgError ${err}`);
});
const pipeThroughChecks = (app, msg, commandResult, content) => {
    const text = content[0].trim();
    if (text.length === 0) {
        app.logger.debug("Empty");
        send(app, msg, dataFromValue(app.strings.infoEmpty));
    }
    else if (text.length > MAX_SIZE_MESSAGE) {
        if (app.config.options.sendFilesForLongReply) {
            const outputFile = Buffer.from(text);
            if (text.length > MAX_SIZE_FILE) {
                app.logger.debug("TooLong");
                send(app, msg, dataFromValue(app.strings.infoTooLong));
            }
            else {
                const outputAttachment = new Attachment(outputFile, "output.txt");
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
    if (isPromise(content)) {
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
     *    NOT from a bot
     *    DOES start with prefix
     *      NOT just the prefix
     */
    if (!msg.author.bot &&
        messageText.startsWith(app.config.prefix) &&
        messageText !== app.config.prefix) {
        const messageCommand = messageText.substr(app.config.prefix.length);
        const commandResult = resolveCommand(messageCommand, msg, app);
        app.logger.info(`Resolving ${msg.author.id}: ${msg.content}`);
        if (commandResult.ignore) {
            app.logger.debug("Ignoring");
        }
        else {
            sendMessage(app, msg, commandResult);
            app.logger.info(`Returning response to message from ${msg.author.id}`);
        }
    }
};

/**
 * slightly modified
 */
/*
    cycle.js
    2017-02-07

    Public Domain.
*/
/**
 * @private
 */
const decycle = (object, replacer) => {
    const objects = new WeakMap();
    const derez = (input, path) => {
        let value = input;
        let oldPath; // The path of an earlier occurrence of value
        let nu; // The new object or array
        // If a replacer function was provided, then call it to get a replacement value.
        if (!isUndefined(replacer)) {
            value = replacer(value);
        }
        // typeof null === "object", so go on if this value is really an object but not
        // one of the weird builtin objects.
        if (isObjectLike(value) && !isDate(value) && !isRegExp(value)) {
            // If the value is an object or array, look to see if we have already
            // encountered it. If so, return a {"$ref":PATH} object. This uses an
            // ES6 WeakMap.
            oldPath = objects.get(value);
            if (!isUndefined(oldPath)) {
                return {
                    $ref: oldPath
                };
            }
            // Otherwise, accumulate the unique value and its path.
            objects.set(value, path);
            // If it is an array, replicate the array.
            if (isArray(value)) {
                nu = [];
                value.forEach((element, i) => {
                    nu[i] = derez(element, path + "[" + i + "]");
                });
            }
            else {
                // If it is an object, replicate the object.
                nu = {};
                Object.keys(value).forEach(name => {
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
 * @private
 * @param {Array<string>} arr
 * @returns {string}
 */
const humanizeList = (arr) => arr.join(", ");

/**
 * Turns an array into a humanized string of optionals
 *
 * @private
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
    return ` or '${item}'`;
})
    .join("");

const LINEBREAK = "\n";
const INDENT_CHAR = " ";
const INDENT_SIZE = 2;
/**
 * Indent string by factor
 *
 * @private
 * @param {string} str
 * @param {number} factor
 * @returns {string}
 */
const indent = (str, factor) => INDENT_CHAR.repeat(factor * INDENT_SIZE) + str;
/**
 * Formats JSON as YAML
 *
 * Note: the output is not fully spec compliant, strings are not escaped/quoted
 *
 * @private
 * @param {any} val
 * @param {number} [factor=0]
 * @returns {string}
 */
const format$1 = (val, factor = 0) => {
    if (isString(val) && val.length > 0) {
        return val;
    }
    else if (isNumber(val) || isBoolean(val)) {
        return String(val);
    }
    else if (isArray(val) && val.length > 0) {
        return (LINEBREAK +
            val
                .filter(item => !isFunction(item))
                .map(item => indent(format$1(item, factor + 1), factor))
                .join(LINEBREAK));
    }
    else if (isObject(val) && Object.keys(val).length > 0) {
        return (LINEBREAK +
            Object.entries(val)
                .filter(entry => !isFunction(entry[1]))
                .map(entry => indent(`${entry[0]}: ${format$1(entry[1], factor + 1)}`, factor))
                .join(LINEBREAK));
    }
    return "";
};
/**
 * Decycles and trims object after formating
 *
 * @private
 * @param {Object} obj
 * @returns {string}
 */
const jsonToYaml = (obj) => format$1(decycle(obj))
    .replace(/\s+\n/g, "\n")
    .trim();

const nodeFetch = fetch.defaults({
    cacheManager: "./.cache/"
});
/**
 * Loads an attachment and returns contents
 *
 * @private
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
 * @private
 * @param {string} channelResolvable
 * @param {Guild} guild
 * @returns {Channel|null}
 */
const resolveChannel = (channelResolvable, guild) => guild.channels.find((channel, id) => id === channelResolvable || channel.name === channelResolvable);

/**
 * creates user+discriminator from user
 *
 * @private
 * @param {User} user
 * @returns {string}
 */
const toFullName = (user) => `${user.username}#${user.discriminator}`;

/**
 * resolves member by id, username, name#discriminator or name
 *
 * @private
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
 * @private
 * @param {string} userResolvable
 * @param {Guild} guild
 * @returns {Promise}
 */
const resolveUser = (userResolvable, bot) => bot.fetchUser(userResolvable);

const BLOCKED_KEYS = /_\w+|\$\w+|client|guild|lastMessage/;
/**
 * Checks if a value is to be kept in a filter iterator
 *
 * @private
 * @param {any} value
 * @returns {boolean}
 */
const isLegalValue = (value) => !isNil(value) && !isFunction(value);
/**
 * Checks if a entry is to be kept in a filter iterator
 *
 * @private
 * @param {Array<any>} entry
 * @returns {boolean}
 */
const isLegalEntry = (entry) => !BLOCKED_KEYS.test(entry[0]) && isLegalValue(entry[1]);
/**
 * Cycles and strips all illegal values
 *
 * @private
 * @param {any} val
 * @returns {any}
 */
const strip = (val) => {
    if (isString(val) || isNumber(val) || isBoolean(val)) {
        return val;
    }
    else if (isArray(val)) {
        return val.filter(isLegalValue).map(strip);
    }
    else if (isObject(val)) {
        const result = {};
        Object.entries(val)
            .filter(isLegalEntry)
            .forEach(entry => {
            result[entry[0]] = strip(entry[1]);
        });
        return result;
    }
    return null;
};
/**
 * Strips sensitive data from bot output
 *
 * @private
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
    toFullName
};

/**
 * Exits the process
 *
 * @private
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

/**
 * Evaluates and returns
 *
 * @private
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {false}
 */
const commandCoreDump = (args, msg, app) => {
    let result = "";
    try {
        // tslint:disable-next-line:no-eval
        result = eval(args.code);
    }
    catch (err) {
        result = err;
    }
    // tslint:disable-next-line:no-console
    console.log(result);
    return [String(result), true];
};

/**
 * Echos text
 *
 * @private
 * @param {Array<any>} args
 * @returns {string}
 */
const commandCoreEcho = args => args.text;

/**
 * Evaluates
 *
 * @private
 * @param {Array<any>} args
 * @param {Message} msg
 * @param {App} app
 * @returns {false}
 */
const commandCoreEval = (args, msg, app) => {
    let result = "";
    try {
        // tslint:disable-next-line:no-eval
        result = eval(args.code);
    }
    catch (err) {
        result = err;
    }
    // tslint:disable-next-line:no-console
    console.log(result);
    return "Done.";
};

const getHelpAll = (commandsMap, app) => {
    const result = {};
    commandsMap.forEach((command, commandName) => {
        const subcommandsList = command.sub !== null
            ? app.util.humanizeList(Array.from(command.sub.map.keys()))
            : null;
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
        result.sub = Array.from(command.sub.getAll().map.keys());
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
 * @private
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

const commandsDefault = {
    die: {
        fn: commandCoreDie,
        args: [],
        alias: ["quit", "exit"],
        powerRequired: 10,
        hidden: true,
        usableInDMs: true,
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
        alias: [],
        powerRequired: 10,
        hidden: true,
        usableInDMs: true,
        help: {
            short: "Executes JS code",
            long: "Executes JS code, dangerous!"
        },
        sub: null
    },
    dump: {
        fn: commandCoreDump,
        args: [
            {
                name: "code",
                required: true,
                help: "Code to run "
            }
        ],
        alias: [],
        powerRequired: 10,
        hidden: true,
        usableInDMs: true,
        help: {
            short: "Executes JS code and returns",
            long: "Executes JS code and returns, dangerous!"
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
        usableInDMs: true,
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
        powerRequired: 0,
        hidden: false,
        usableInDMs: true,
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
            check: (msg) => ["yourIdHere"].includes(msg.author.id)
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
        logLevel: "info" // Winston log level
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
 * @public
 * @class
 */
const Dingy = class {
    /**
     * Creates Di-ngy instance
     *
     * @constructor
     * @param {Object} config
     * @param {Object} [commands={}]
     * @param {Object} [strings={}]
     * @param {Object} [userEvents={}]
     */
    constructor(config, commands = {}, strings = {}, userEvents = {}) {
        if (isUndefined(config.token)) {
            throw new Error("No token provided");
        }
        /**
         * Contains internal utility methods
         *
         * @private
         */
        this.util = util;
        /**
         * Stores instance config
         *
         * @protected
         */
        this.config = objDefaultsDeep(config, configDefault);
        /**
         * Strings used by the bot
         *
         * @protected
         */
        this.strings = objDefaultsDeep(strings, stringsDefault);
        /**
         * Custom user events
         *
         * @protected
         */
        this.userEvents = objDefaultsDeep(userEvents, userEventsDefault);
        /**
         * Winston logger
         *
         * @protected
         */
        this.logger = createLogger({
            level: this.config.options.logLevel,
            exitOnError: false,
            format: format.combine(format.timestamp(), format.printf((info) => {
                return `${info.timestamp} [${info.level}] ${info.message}`;
            })),
            transports: [
                new transports.Console(),
                new transports.File({ filename: "bot.log" })
            ]
        });
        this.logger.verbose("Init: Loaded Config");
        /**
         * Command interpreter
         *
         * @protected
         */
        this.cli = new Clingy(mapCommands(Object.assign(commandsDefault, commands)), {
            caseSensitive: this.config.options.namesAreCaseSensitive,
            validQuotes: this.config.options.validQuotes
        });
        this.logger.verbose("Init: Created Clingy");
        /**
         * Discord.js client
         *
         * @public
         */
        this.bot = new Client();
        this.logger.verbose("Init: Created Discord Client");
        /**
         * Runtime data storage
         *
         * @public
         */
        this.data = {};
        /**
         * Persisted data storage
         *
         * @public
         */
        this.dataPersisted = {};
        this.config.dataPersisted.files.forEach(fileName => {
            this.dataPersisted[fileName] = flatCache.load(`${fileName}.json`, this.config.dataPersisted.dir);
        });
        this.logger.verbose("Init: Loaded Data");
        /**
         * Binds events
         */
        this.bot.on("message", (msg) => {
            onMessage(msg, this);
            this.userEvents.onMessage(msg, this);
        });
        this.bot.on("disconnect", (err) => {
            this.logger.error("Disconnect", err);
            onError(err, this);
        });
        this.bot.on("error", (err) => {
            this.logger.error("Error", err);
            onError(err, this);
        });
        this.logger.info("Init: Success");
        this.userEvents.onInit(this);
    }
    /**
     * Connect to the Discord API
     *
     * @public
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

export default Dingy;
