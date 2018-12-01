import { join } from 'path';
import { Logby } from 'logby';
import { Clingy } from 'cli-ngy';
import { DMChannel, Client } from 'discord.js';
import { stringify } from 'yamljs';
import { pathExists, readJson, writeJson } from 'fs-extra';
import { isInstanceOf, isPromise, isString, objDefaultsDeep, isNil } from 'lightdash';

/**
 * Default role for everyone.
 */
const DEFAULT_ROLE = {
    power: 0,
    check: () => true
};
/**
 * Default config settings.
 *
 * @private
 */
const configDefault = {
    prefix: "$",
    roles: [DEFAULT_ROLE],
    enableDefaultCommands: true,
    answerToMissingCommand: false,
    answerToMissingArgs: true,
    answerToMissingPerms: true,
    strings: {
        error: {
            notFound: "The command was not found: ",
            missingArgs: "Missing required argument(s): ",
            noPermission: "You do not have the permissions to use this command.",
            invalidDMCall: "This command cannot be used in DMs."
        },
        response: {
            empty: "Empty response.",
            tooLong: "The output was too long to send."
        }
    }
};

/**
 * Logby instance used by Di-ngy.
 */
const dingyLogby = new Logby();

/**
 * @private
 */
const createSlimMessage = (msg) => {
    return {
        author: { username: msg.author.username, id: msg.author.id },
        content: msg.content
    };
};

/**
 * Built-in "echo" command.
 *
 * @private
 */
const echo = {
    alias: ["say", "send"],
    args: [
        {
            name: "val",
            required: true
        }
    ],
    sub: null,
    data: {
        powerRequired: 8,
        hidden: true,
        usableInDMs: true,
        help: "Echoes a text."
    },
    fn: (args) => args.get("val")
};

const LINE_SEPARATOR = "-".repeat(9);
/**
 * @private
 */
const createSlimCommandTree = (map) => {
    const result = {};
    map.forEach((command, key) => {
        if (!command.data.hidden) {
            result[key] = createSlimCommand(command);
        }
    });
    return result;
};
/**
 * @private
 */
const createSlimCommand = (command) => {
    const result = {
        desc: command.data.help,
        powerRequired: command.data.powerRequired,
        usableInDMs: command.data.usableInDMs
    };
    if (command.alias.length > 0) {
        result.alias = command.alias;
    }
    if (command.args.length > 0) {
        result.args = command.args;
    }
    if (command.sub != null) {
        result.sub = Array.from(command.sub.map.keys());
    }
    return result;
};
/**
 * @private
 */
const showDetailHelp = (clingy, argsAll) => {
    const lookupResult = clingy.getPath(argsAll);
    // prematurely assume success to combine hidden + success check.
    const command = lookupResult.command;
    if (!lookupResult.successful || command.data.hidden) {
        return {
            val: `Command '${argsAll.join("->")}' does not exist.`,
            code: "yaml"
        };
    }
    return {
        val: [
            `Help for: '${lookupResult.pathUsed.join("->")}'`,
            LINE_SEPARATOR,
            stringify(createSlimCommand(command))
        ].join("\n"),
        code: "yaml"
    };
};
/**
 * @private
 */
const showGeneralHelp = (clingy) => {
    return {
        val: [
            "Help",
            LINE_SEPARATOR,
            stringify(createSlimCommandTree(clingy.map))
        ].join("\n"),
        code: "yaml"
    };
};
/**
 * Built-in "help" command.
 *
 * @private
 */
const help = {
    alias: ["manual", "?"],
    args: [],
    sub: null,
    data: {
        powerRequired: 0,
        hidden: false,
        usableInDMs: true,
        help: "Shows the help page."
    },
    fn: (args, argsAll, msg, dingy, clingy) => argsAll.length > 0
        ? showDetailHelp(clingy, argsAll)
        : showGeneralHelp(clingy)
};

const EXIT_CODE_STOP = 10;
/**
 * Built-in "stop" command.
 *
 * @private
 */
const stop = {
    alias: ["die", "shutdown"],
    args: [],
    sub: null,
    data: {
        powerRequired: 10,
        hidden: true,
        usableInDMs: true,
        help: "Stops the bot."
    },
    fn: (args, argsAll, msg, dingy) => {
        dingy.client.setTimeout(async () => {
            await dingy.disconnect();
            process.exit(EXIT_CODE_STOP);
        }, 1000);
        return "Stopping...";
    }
};

const commandsDefault = {
    echo,
    stop,
    help
};

/**
 * @private
 */
const hasEnoughPower = (msg, powerRequired, roles) => {
    for (const role of roles) {
        if (role.power >= powerRequired && role.check(msg)) {
            return true;
        }
    }
    return false;
};

/**
 * Handles resolving messages and sending the response.
 *
 * @private
 */
class MessageController {
    /**
     * Creates a new MessageController
     *
     * @param dingy Dingy instance this controller belongs to.
     * @param commands Command object.
     */
    constructor(dingy, commands = {}) {
        this.clingy = new Clingy(dingy.config.enableDefaultCommands
            ? objDefaultsDeep(commands, commandsDefault)
            : commands);
        MessageController.logger.debug("Creating Clingy.");
        this.dingy = dingy;
        MessageController.logger.debug("Created MessageController.");
    }
    /**
     * Handle an incoming message.
     *
     * @param msg Discord message to process.
     */
    handleMessage(msg) {
        MessageController.logger.debug("Parsing content.", createSlimMessage(msg));
        const msgContent = msg.content.substr(this.dingy.config.prefix.length);
        const lookupResult = this.clingy.parse(msgContent);
        MessageController.logger.trace("Parsed content.", lookupResult);
        if (lookupResult.type === 1 /* ERROR_NOT_FOUND */) {
            const lookupResultNotFound = lookupResult;
            MessageController.logger.debug(`Command not found: ${lookupResultNotFound.missing}.`);
            this.handleLookupNotFound(msg, lookupResultNotFound);
        }
        else if (lookupResult.type === 2 /* ERROR_MISSING_ARGUMENT */) {
            const lookupResultMissingArg = (lookupResult);
            MessageController.logger.debug(`Argument missing: ${lookupResultMissingArg.missing}.`);
            this.handleLookupMissingArg(msg, lookupResultMissingArg);
        }
        else if (lookupResult.type === 0 /* SUCCESS */) {
            const lookupResultSuccess = lookupResult;
            MessageController.logger.trace("Lookup successful.", lookupResultSuccess);
            this.handleLookupSuccess(msg, lookupResultSuccess);
        }
        else {
            MessageController.logger.error("Every check failed, this should never happen.", lookupResult);
        }
    }
    handleLookupNotFound(msg, lookupResultNotFound) {
        if (this.dingy.config.answerToMissingCommand) {
            MessageController.logger.info("Answering to command not found.");
            this.sendResult(msg, this.dingy.config.strings.error.notFound +
                lookupResultNotFound.missing);
        }
    }
    handleLookupMissingArg(msg, lookupResultMissingArg) {
        if (this.dingy.config.answerToMissingArgs) {
            MessageController.logger.info("Answering to missing arg.");
            this.sendResult(msg, this.dingy.config.strings.error.missingArgs +
                lookupResultMissingArg.missing.map(arg => arg.name));
        }
    }
    handleLookupSuccess(msg, lookupResultSuccess) {
        const command = lookupResultSuccess.command;
        if (isInstanceOf(msg.channel, DMChannel) && !command.data.usableInDMs) {
            MessageController.logger.info("Not usable in DMs.");
            this.sendResult(msg, this.dingy.config.strings.error.invalidDMCall);
            return;
        }
        if (!hasEnoughPower(msg, command.data.powerRequired, this.dingy.config.roles)) {
            MessageController.logger.info("No permissions.");
            this.sendResult(msg, this.dingy.config.strings.error.noPermission);
            return;
        }
        MessageController.logger.debug("Running command:", command);
        const result = command.fn(lookupResultSuccess.args, lookupResultSuccess.pathDangling, msg, this.dingy, this.clingy);
        MessageController.logger.trace("Command returned:", { result });
        if (result == null) {
            MessageController.logger.trace("Skipping response.");
            return;
        }
        MessageController.logger.info("Answering to successful command.", {
            result
        });
        this.sendResult(msg, result);
    }
    sendResult(msg, value) {
        if (isPromise(value)) {
            MessageController.logger.debug("Value is a promise, waiting.");
            value
                .then(valueResolved => this.send(msg, valueResolved))
                .catch(err => MessageController.logger.error("Error while waiting for resolve: ", err));
        }
        else {
            this.send(msg, value);
        }
    }
    send(msg, value) {
        MessageController.logger.trace("Preparing sending of message.", {
            value
        });
        const isPlainValue = isString(value);
        const options = {
            code: isPlainValue ? false : value.code,
            files: isPlainValue ? [] : value.files
        };
        let content = isPlainValue
            ? value
            : value.val;
        if (content.length > MessageController.MAX_LENGTH) {
            MessageController.logger.warn("Message is too long to send:", content);
            content = this.dingy.config.strings.response.tooLong;
        }
        else if (content.length === 0) {
            MessageController.logger.warn("Message is empty.");
            content = this.dingy.config.strings.response.empty;
        }
        MessageController.logger.debug("Sending message.", {
            content,
            options
        });
        msg.channel
            .send(content, options)
            .then(() => MessageController.logger.debug("Sent message.", {
            content,
            options
        }))
            .catch(err => MessageController.logger.error("Could not send message.", err));
    }
}
MessageController.logger = dingyLogby.getLogger(MessageController);
MessageController.MAX_LENGTH = 2000;

/**
 * @private
 */
class JSONStorage {
    constructor(path) {
        this.data = {};
        this.path = path;
    }
    async init() {
        const exists = await pathExists(this.path);
        if (exists) {
            this.data = await readJson(this.path);
        }
        else {
            await writeJson(this.path, this.data);
        }
    }
    save(key, val) {
        this.data[key] = val;
        // We don't need to wait for the saving to finish
        // this *could* lead to locking/access issues but hey, probably works.
        writeJson(this.path, this.data).catch(e => JSONStorage.logger.error("Could not save JSON", e));
    }
    load(key) {
        return this.data[key];
    }
    has(key) {
        return !isNil(this.data[key]);
    }
}
JSONStorage.logger = dingyLogby.getLogger(JSONStorage);

/**
 * @private
 */
class MemoryStorage {
    constructor() {
        this.data = new Map();
    }
    save(key, val) {
        this.data.set(key, val);
    }
    load(key) {
        return this.data.get(key);
    }
    has(key) {
        return this.data.has(key);
    }
}

/**
 * Main Dingy class.
 */
class Dingy {
    /**
     * Creates a new Dingy instance.
     *
     * @param commands Object containing commands for the bot to use.
     * @param config Config object.
     */
    constructor(commands = {}, config = {}) {
        Dingy.logger.info("Creating instance.");
        Dingy.logger.debug("Reading config.");
        this.config = objDefaultsDeep(config, configDefault);
        Dingy.logger.debug("Creating Client.");
        this.client = new Client();
        Dingy.logger.debug("Creating MemoryStorage.");
        this.memoryStorage = new MemoryStorage();
        const storagePath = join("./", Dingy.DATA_DIRECTORY, "storage.json");
        Dingy.logger.debug(`Creating JSONStorage in '${storagePath}'.`);
        this.jsonStorage = new JSONStorage(storagePath);
        Dingy.logger.debug("Creating MessageController.");
        this.messageController = new MessageController(this, commands);
        this.bindEvents();
        Dingy.logger.info("Created instance.");
    }
    /**
     * Connects the instance to the Discord API.
     *
     * @param token API token.
     */
    async connect(token) {
        Dingy.logger.debug("Loading storage.");
        try {
            await this.jsonStorage.init();
        }
        catch (e) {
            const err = e;
            Dingy.logger.error("Could not load storage: ", err);
            throw err;
        }
        Dingy.logger.info("Connecting to the Discord API.");
        try {
            await this.client.login(token);
        }
        catch (e) {
            const err = e;
            Dingy.logger.error("Could not connect to the Discord API.", err);
            throw err;
        }
        Dingy.logger.info("Connected.");
    }
    /**
     * Disconnects the instance from the discord API.
     */
    async disconnect() {
        Dingy.logger.info("Disconnecting from the Discord API.");
        try {
            await this.client.destroy();
        }
        catch (e) {
            const err = e;
            Dingy.logger.error("Could not disconnect from the Discord API.", err);
            throw err;
        }
        Dingy.logger.info("Disconnected.");
    }
    bindEvents() {
        Dingy.logger.debug("Binding events.");
        this.client.on("error", err => Dingy.logger.error("An error occurred, trying to continue.", err));
        this.client.on("message", msg => this.messageHandler(msg));
    }
    messageHandler(msg) {
        Dingy.logger.trace("A message was sent.", createSlimMessage(msg));
        if (!msg.system &&
            !msg.author.bot &&
            msg.content.startsWith(this.config.prefix) &&
            msg.content !== this.config.prefix) {
            Dingy.logger.info("Message will be processed.", createSlimMessage(msg));
            this.messageController.handleMessage(msg);
        }
    }
}
Dingy.DATA_DIRECTORY = "data";
Dingy.logger = dingyLogby.getLogger(Dingy);

export { Dingy, dingyLogby, DEFAULT_ROLE };
