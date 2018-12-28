import { DMChannel, Client } from 'discord.js';
import { isPromise, isString, isNil, objDefaultsDeep, isRegExp, isInstanceOf } from 'lightdash';
import { join } from 'path';
import { Chevron } from 'chevronjs';
import { Logby } from 'logby';
import { Clingy } from 'cli-ngy';
import { stringify } from 'yamljs';
import { pathExists, readJson, writeJson } from 'fs-extra';

/**
 * Default role for every user.
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
        },
        separator: "-".repeat(9)
    },
    clingy: {
        caseSensitive: false,
        // tslint:disable-next-line:quotemark
        legalQuotes: ['"']
    }
};

const dingyChevron = new Chevron();

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
const createSlimCommand = (command, showDetails = false) => {
    const result = {
        desc: command.data.help
    };
    if (showDetails) {
        result.powerRequired = command.data.powerRequired;
        result.usableInDMs = command.data.usableInDMs;
        if (command.args.length > 0) {
            result.args = command.args;
        }
        if (command.alias.length > 0) {
            result.alias = command.alias;
        }
    }
    if (command.sub != null) {
        result.sub = Array.from(command.sub.map.keys());
    }
    return result;
};
/**
 * @private
 */
const showDetailHelp = (dingy, clingy, argsAll) => {
    const lookupResult = clingy.getPath(argsAll);
    // prematurely assume success to combine hidden + success check.
    const command = lookupResult.command;
    if (!lookupResult.successful || command.data.hidden) {
        return {
            val: `Command '${argsAll.join("->")}' does not exist.`,
            code: true
        };
    }
    return {
        val: [
            `Help: '${lookupResult.pathUsed.join("->")}'`,
            dingy.config.strings.separator,
            stringify(createSlimCommand(command, true))
        ].join("\n"),
        code: "yaml"
    };
};
/**
 * @private
 */
const showGeneralHelp = (dingy, clingy) => {
    return {
        val: [
            "Help",
            dingy.config.strings.separator,
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
        ? showDetailHelp(dingy, clingy, argsAll)
        : showGeneralHelp(dingy, clingy)
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
 * Handles sending messages.
 *
 * @private
 */
class MessageSenderService {
    constructor(dingy) {
        this.dingy = dingy;
    }
    /**
     * Sends a result as response.
     *
     * @param msg Message to respond to.
     * @param value Value to send.
     */
    sendResult(msg, value) {
        if (isPromise(value)) {
            MessageSenderService.logger.debug("Value is a promise, waiting.");
            value
                .then(valueResolved => this.send(msg, valueResolved))
                .catch(err => MessageSenderService.logger.error("Error while waiting for resolve: ", err));
        }
        else {
            this.send(msg, value);
        }
    }
    send(msg, value) {
        MessageSenderService.logger.trace("Preparing sending of message.", {
            value
        });
        const isPlainValue = isString(value);
        const options = {
            code: isPlainValue ? false : value.code,
            files: isPlainValue ? [] : value.files
        };
        const content = this.determineContent(value, isPlainValue);
        MessageSenderService.logger.debug("Sending message.", {
            content,
            options
        });
        msg.channel
            .send(content, options)
            .then(sentMsg => {
            if (!isPlainValue && !isNil(value.onSend)) {
                value.onSend(sentMsg);
            }
            MessageSenderService.logger.debug("Sent message.", {
                content,
                options
            });
        })
            .catch(err => MessageSenderService.logger.error("Could not send message.", err));
    }
    determineContent(value, isPlainValue) {
        let content = isPlainValue
            ? value
            : value.val;
        if (content.length > MessageSenderService.MAX_LENGTH) {
            MessageSenderService.logger.warn("Message is too long to send:", content);
            return this.dingy.config.strings.response.tooLong;
        }
        if (content.length === 0) {
            MessageSenderService.logger.warn("Message is empty.");
            return this.dingy.config.strings.response.empty;
        }
        return content;
    }
}
MessageSenderService.logger = dingyLogby.getLogger(MessageSenderService);
MessageSenderService.MAX_LENGTH = 2000;
dingyChevron.set("factory" /* FACTORY */, ["_DINGY" /* CLASS */], MessageSenderService);

/**
 * Handles resolving messages.
 *
 * @private
 */
class MessageReceiverService {
    /**
     * Creates a new MessageReceiverService
     *
     * @param dingy Dingy instance this service belongs to.
     * @param commands Command object.
     */
    constructor(dingy, commands) {
        this.dingy = dingy;
        this.clingy = new Clingy(dingy.config.enableDefaultCommands
            ? objDefaultsDeep(commands, commandsDefault)
            : commands, this.dingy.config.clingy);
        this.messageSenderService = new MessageSenderService(dingy);
    }
    static matchesPrefix(content, prefix) {
        return isRegExp(prefix)
            ? prefix.test(content)
            : content.startsWith(prefix) && content !== prefix;
    }
    static getContentWithoutPrefix(content, prefix) {
        return isRegExp(prefix)
            ? content.replace(prefix, "")
            : content.substr(prefix.length);
    }
    /**
     * Handle an incoming message.
     *
     * @param msg Discord message to process.
     */
    handleMessage(msg) {
        if (msg.system && msg.author.bot) {
            MessageReceiverService.logger.trace("Message is from the system or a bot, will be skipped.", createSlimMessage(msg));
            return;
        }
        if (!MessageReceiverService.matchesPrefix(msg.content, this.dingy.config.prefix)) {
            MessageReceiverService.logger.trace("Message does not match prefix, will be skipped.", createSlimMessage(msg));
            return;
        }
        const msgContent = MessageReceiverService.getContentWithoutPrefix(msg.content, this.dingy.config.prefix);
        MessageReceiverService.logger.debug("Parsing content.", createSlimMessage(msg));
        const lookupResult = this.clingy.parse(msgContent);
        MessageReceiverService.logger.trace("Parsed content.", lookupResult);
        if (lookupResult.type === 1 /* ERROR_NOT_FOUND */) {
            const lookupResultNotFound = lookupResult;
            MessageReceiverService.logger.debug(`Command not found: ${lookupResultNotFound.missing}.`);
            this.handleLookupNotFound(msg, lookupResultNotFound);
        }
        else if (lookupResult.type === 2 /* ERROR_MISSING_ARGUMENT */) {
            const lookupResultMissingArg = (lookupResult);
            MessageReceiverService.logger.debug(`Argument missing: ${lookupResultMissingArg.missing}.`);
            this.handleLookupMissingArg(msg, lookupResultMissingArg);
        }
        else if (lookupResult.type === 0 /* SUCCESS */) {
            const lookupResultSuccess = lookupResult;
            MessageReceiverService.logger.trace("Lookup successful.", lookupResultSuccess);
            this.handleLookupSuccess(msg, lookupResultSuccess);
        }
        else {
            MessageReceiverService.logger.error("Every check failed, this should never happen.", lookupResult);
        }
    }
    handleLookupNotFound(msg, lookupResultNotFound) {
        if (this.dingy.config.answerToMissingCommand) {
            MessageReceiverService.logger.debug("Answering to command not found.");
            this.messageSenderService.sendResult(msg, this.dingy.config.strings.error.notFound +
                lookupResultNotFound.missing);
        }
    }
    handleLookupMissingArg(msg, lookupResultMissingArg) {
        if (this.dingy.config.answerToMissingArgs) {
            MessageReceiverService.logger.debug("Answering to missing arg.");
            this.messageSenderService.sendResult(msg, this.dingy.config.strings.error.missingArgs +
                lookupResultMissingArg.missing
                    .map(arg => arg.name)
                    .join(", "));
        }
    }
    handleLookupSuccess(msg, lookupResultSuccess) {
        const command = lookupResultSuccess.command;
        if (isInstanceOf(msg.channel, DMChannel) && !command.data.usableInDMs) {
            MessageReceiverService.logger.debug("Not usable in DMs.");
            this.messageSenderService.sendResult(msg, this.dingy.config.strings.error.invalidDMCall);
            return;
        }
        if (!hasEnoughPower(msg, command.data.powerRequired, this.dingy.config.roles)) {
            MessageReceiverService.logger.debug("No permissions.");
            this.messageSenderService.sendResult(msg, this.dingy.config.strings.error.noPermission);
            return;
        }
        MessageReceiverService.logger.debug("Running command:", command);
        const result = command.fn(lookupResultSuccess.args, lookupResultSuccess.pathDangling, msg, this.dingy, this.clingy);
        MessageReceiverService.logger.trace("Command returned:", { result });
        if (result == null) {
            MessageReceiverService.logger.trace("Skipping response.");
            return;
        }
        MessageReceiverService.logger.debug("Answering to successful command.", {
            result
        });
        this.messageSenderService.sendResult(msg, result);
    }
}
MessageReceiverService.logger = dingyLogby.getLogger(MessageReceiverService);
dingyChevron.set("factory" /* FACTORY */, ["_DINGY" /* CLASS */, "_DINGY_COMMANDS" /* COMMANDS */], MessageReceiverService);

const SAVE_INTERVAL_MS = 60 * 1000; // 1min
/**
 * @private
 */
class JSONStorage {
    constructor(path) {
        this.dirty = false;
        this.saveInterval = null;
        this.data = {};
        this.path = path;
    }
    async init() {
        const exists = await pathExists(this.path);
        if (exists) {
            JSONStorage.logger.trace(`JSON '${this.path}' exists, loading it.`);
            this.data = await readJson(this.path);
        }
        else {
            JSONStorage.logger.trace(`JSON '${this.path}' does not exist, loading it.`);
            await writeJson(this.path, this.data);
        }
        this.saveInterval = setInterval(() => this.save(), SAVE_INTERVAL_MS);
    }
    set(key, val) {
        this.data[key] = val;
        this.dirty = true;
    }
    get(key) {
        return this.data[key];
    }
    has(key) {
        return !isNil(this.data[key]);
    }
    save() {
        if (!this.dirty) {
            JSONStorage.logger.trace("JSON was not changed, not saving it.");
        }
        else {
            JSONStorage.logger.trace("JSON was changed, attempting to save it.");
            this.dirty = false;
            // We don't need to wait for the saving to finish
            // this *could* lead to locking/access issues but hey, probably works.
            writeJson(this.path, this.data)
                .then(() => JSONStorage.logger.trace(`Saved JSON '${this.path}'.`))
                .catch(e => JSONStorage.logger.error(`Could not save JSON '${this.path}'.`, e));
        }
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
    set(key, val) {
        this.data.set(key, val);
    }
    get(key) {
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
     * @param memoryStorage Storage instance handling runtime data. Falls back to {@link MemoryStorage}.
     * @param persistentStorage Storage instance handling persistent data; Falls back to {@link JSONStorage}.
     */
    constructor(commands, config = {}, memoryStorage, persistentStorage) {
        Dingy.logger.info("Creating instance.");
        Dingy.logger.debug("Applying config.");
        this.config = objDefaultsDeep(config, configDefault);
        Dingy.logger.info("Initializing Storage.");
        Dingy.logger.debug("Creating memory storage.");
        this.memoryStorage = isNil(memoryStorage)
            ? new MemoryStorage()
            : memoryStorage;
        Dingy.logger.debug("Creating persistent storage.");
        this.persistentStorage = isNil(persistentStorage)
            ? new JSONStorage(join("./", Dingy.DATA_DIRECTORY, "storage.json"))
            : persistentStorage;
        Dingy.logger.debug("Initializing DI.");
        dingyChevron.set("plain" /* PLAIN */, [], this, "_DINGY" /* CLASS */);
        dingyChevron.set("plain" /* PLAIN */, [], commands, "_DINGY_COMMANDS" /* COMMANDS */);
        Dingy.logger.debug("Creating MessageReceiverService.");
        this.messageReceiverService = dingyChevron.get(MessageReceiverService);
        Dingy.logger.info("Creating Client.");
        this.client = new Client();
        Dingy.logger.debug("Binding events.");
        this.bindEvents();
        Dingy.logger.info("Created instance.");
    }
    /**
     * Connects the instance to the Discord API.
     *
     * @param token API token.
     */
    async connect(token) {
        Dingy.logger.debug("Initializing persistent storage.");
        try {
            await this.persistentStorage.init();
        }
        catch (e) {
            const err = e;
            Dingy.logger.error("Could not init persistent storage: ", err);
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
     * Disconnects the instance from the Discord API.
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
        this.client.on("error", err => Dingy.logger.error("An error occurred, trying to continue.", err));
        this.client.on("message", msg => this.messageHandler(msg));
    }
    messageHandler(msg) {
        Dingy.logger.trace("A message was sent.", createSlimMessage(msg));
        this.messageReceiverService.handleMessage(msg);
    }
}
Dingy.logger = dingyLogby.getLogger(Dingy);
Dingy.DATA_DIRECTORY = "data";

export { Dingy, dingyLogby, DEFAULT_ROLE };
