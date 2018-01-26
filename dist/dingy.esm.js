import { arrFrom, isArray, isBoolean, isDate, isDefined, isFunction, isNumber, isObject, isObjectLike, isPromise, isRegExp, isString, isUndefined, objDefaultsDeep, objEntries, objKeys, objMap } from 'lightdash';
import { createLogger, format, transports } from 'winston';
import Clingy from 'cli-ngy';
import { Attachment, Client } from 'discord.js';
import flatCache from 'flat-cache';

const mapCommand = (key, command) => {
    const result = command;
    result.powerRequired = isDefined(result.powerRequired)
        ? result.powerRequired
        : 0;
    result.hidden = isDefined(result.hidden) ? result.hidden : false;
    result.help = isDefined(result.help) ? result.help : {};
    result.help.short = isDefined(result.help.short)
        ? result.help.short
        : "No help provided";
    result.help.long = isDefined(result.help.long)
        ? result.help.long
        : result.help.short;
    result.args = isDefined(result.args) ? result.args : [];
    result.args.map(arg => (isDefined(arg.help) ? arg.help : "No help provided"));
    if (result.sub) {
        result.sub = objMap(result.sub, mapCommand);
    }
    return result;
};
const mapCommands = (commands) => objMap(commands, mapCommand);

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
    app.logger.debug("SentMsg");
    content[3].onSend(msgSent);
})
    .catch(err => {
    app.logger.error(`SentMsgError ${err}`);
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
/**
 * Performs checks and waits for promise, then sends a message
 *
 * @param {Dingy} app
 * @param {Message} msg
 * @param {Array<any>|Promise} data
 */
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
/**
 * onError event
 *
 * @param {Error} err
 * @param {Dingy} app
 */
const onError = (err, app) => {
    app.logger.warn(`reconnect: Attempting to reconnect in ${RECONNECT_TIMEOUT}ms`);
    app.bot.setTimeout(() => {
        app.connect();
    }, RECONNECT_TIMEOUT);
};

/**
 * Turns an array into a humanized string
 *
 * @param {Array<string>} arr
 * @returns {string}
 */
const humanizeList = (arr) => arr.join(", ");

/**
 * slightly modified
 */
/*
    cycle.js
    2017-02-07

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/
// The file uses the WeakMap feature of ES6.
/*jslint es6, eval */
/*property
    $ref, decycle, forEach, get, indexOf, isArray, keys, length, push,
    retrocycle, set, stringify, test
*/
const decycle = (object, replacer) => {
    // Make a deep copy of an object or array, assuring that there is at most
    // one instance of each object or array in the resulting structure. The
    // duplicate references (which might be forming cycles) are replaced with
    // an object of the form
    //      {"$ref": PATH}
    // where the PATH is a JSONPath string that locates the first occurance.
    // So,
    //      let a = [];
    //      a[0] = a;
    //      return JSON.stringify(JSON.decycle(a));
    // produces the string '[{"$ref":"$"}]'.
    // If a replacer function is provided, then it will be called for each value.
    // A replacer function receives a value and returns a replacement value.
    // JSONPath is used to locate the unique object. $ indicates the top level of
    // the object or array. [NUMBER] or [STRING] indicates a child element or
    // property.
    const objects = new WeakMap(); // object to path mappings
    const derez = function derez(value, path) {
        // The derez function recurses through the object, producing the deep copy.
        let old_path; // The path of an earlier occurance of value
        let nu; // The new object or array
        // If a replacer function was provided, then call it to get a replacement value.
        if (replacer !== undefined) {
            value = replacer(value);
        }
        // typeof null === "object", so go on if this value is really an object but not
        // one of the weird builtin objects.
        if (isObjectLike(value) &&
            !isBoolean(value) &&
            !isDate(value) &&
            !isNumber(value) &&
            !isRegExp(value) &&
            !isString(value)) {
            // If the value is an object or array, look to see if we have already
            // encountered it. If so, return a {"$ref":PATH} object. This uses an
            // ES6 WeakMap.
            old_path = objects.get(value);
            if (old_path !== undefined) {
                return {
                    $ref: old_path
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
                objKeys(value).forEach((name) => {
                    nu[name] = derez(value[name], path + "[" + JSON.stringify(name) + "]");
                });
            }
            return nu;
        }
        return value;
    };
    return derez(object, "$");
};

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
    if (isString(val) && val.length > 0) {
        return val;
    }
    else if (isNumber(val) || isBoolean(val)) {
        return String(val);
    }
    else if (isArray(val) && val.length > 0) {
        return LINEBREAK + val
            .filter(item => !isFunction(item))
            .map(item => indent(format$1(item, factor + 1), factor))
            .join(LINEBREAK);
    }
    else if (isObject(val) && objKeys(val).length > 0) {
        return LINEBREAK + objEntries(val)
            .filter(entry => !isFunction(entry[1]))
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

/**
 * Displays list of all non-hidden commands
 *
 * @param {Object} commands
 * @param {Dingy} app
 * @returns {string}
 */
const getHelpAll = (commandsMap, app) => {
    const result = {};
    commandsMap.forEach((command, commandName) => {
        const subcommandsList = command.sub !== null ? humanizeList(arrFrom(command.sub.map.keys())) : null;
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
        ["Help", app.strings.separator, jsonToYaml(result)].join("\n"),
        "yaml"
    ];
};
/**
 * Displays help for a single command
 *
 * @param {Object} command
 * @param {Array<string>} commandPath
 * @param {Dingy} app
 * @returns {string}
 */
const getHelpSingle = (command, commandPath, app) => {
    const result = {
        desc: command.help.long,
        alias: null,
        args: null,
        sub: null
    };
    if (command.alias.length > 0) {
        result.alias = humanizeList(command.alias);
    }
    if (command.sub !== null) {
        result.sub = arrFrom(command.sub.getAll().map.keys());
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
            jsonToYaml(result)
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
        if (isUndefined(config.token)) {
            throw new Error("No token provided!");
        }
        /**
         * Stores instance config
         */
        this.config = objDefaultsDeep(config, configDefault);
        this.strings = objDefaultsDeep(strings, stringsDefault);
        this.userEvents = objDefaultsDeep(userEvents, userEventsDefault);
        this.logger = createLogger({
            level: this.config.options.logLevel,
            exitOnError: false,
            format: format.combine(format.timestamp(), format.printf(info => {
                return `${info.timestamp} [${info.level}] ${info.message}`;
            })),
            transports: [
                new transports.Console(),
                new transports.File({ filename: "bot.log" })
            ]
        });
        this.logger.info("init: Loaded Config");
        this.cli = new Clingy(mapCommands(objDefaultsDeep(commands, commandsDefault)), {
            caseSensitive: this.config.options.namesAreCaseSensitive,
            validQuotes: this.config.options.validQuotes
        });
        this.logger.info("init: Created Clingy");
        /**
         * Bootstraps Client
         */
        this.bot = new Client();
        this.logger.info("init: Created Discord Client");
        this.data = {};
        this.dataPersisted = {};
        this.config.dataPersisted.files.forEach(fileName => {
            this.dataPersisted[fileName] = flatCache.load(`${fileName}.json`, this.config.dataPersisted.dir);
        });
        this.logger.info("init: Loaded Data");
        /**
         * Binds events
         */
        this.bot.on("message", msg => {
            onMessage(msg, this);
            this.userEvents.onMessage(msg, this);
        });
        this.bot.on("disconnect", err => {
            this.logger.error("disconnect", err);
            onError(err, this);
        });
        this.bot.on("error", err => {
            this.logger.error("error", err);
            onError(err, this);
        });
        this.logger.info("init: Success");
        this.userEvents.onInit(this);
    }
    /**
     * Connect to the Discord API
     */
    connect() {
        this.logger.info("connect: starting");
        this.bot
            .login(this.config.token)
            .then(() => {
            this.logger.info("connect: Success");
            this.bot.user.setActivity(this.strings.currentlyPlaying);
            this.userEvents.onConnect(this);
        })
            .catch(() => {
            this.logger.error("connect: error");
            throw new Error("An error ocurred connecting to the Discord-API");
        });
    }
};

export default Dingy;
