import { Logby } from 'logby';
import { isPromise, isString, isNil, objDefaultsDeep } from 'lightdash';
import { pathExists, readJson, writeJson } from 'fs-extra';
import { Clingy } from 'cli-ngy';
import { Client } from 'discord.js';
import { join } from 'path';

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

const commandsDefault = {
    echo
};

const configDefault = {
    prefix: "$",
    roles: [],
    enableDefaultCommands: true,
    answerToMissingCommand: false,
    answerToMissingArgs: true,
    answerToMissingPerms: true,
    strings: {
        error: {
            notFound: "The command was not found: ",
            missingArgs: "Missing required arguments: ",
            noPermission: "You do not have the permissions to use this command.",
            invalidDMCall: "This command cannot be used in DMs."
        },
        response: {
            empty: "Empty response.",
            tooLong: "The output was too long to send."
        }
    }
};

const dingyLogby = new Logby();

class MessageReactor {
    constructor(config, client, clingy, memoryStorage, jsonStorage) {
        this.config = config;
        this.client = client;
        this.clingy = clingy;
        this.memoryStorage = memoryStorage;
        this.jsonStorage = jsonStorage;
    }
    static createSlimMessage(msg) {
        return {
            author: { username: msg.author.username, id: msg.author.id },
            content: msg.content
        };
    }
    handleMessage(msg) {
        MessageReactor.logger.debug("Parsing content.", MessageReactor.createSlimMessage(msg));
        const msgContent = msg.content.substr(this.config.prefix.length);
        const lookupResult = this.clingy.parse(msgContent);
        MessageReactor.logger.debug("Parsed content.", lookupResult);
        if (lookupResult.type === 1 /* ERROR_NOT_FOUND */) {
            const lookupResultNotFound = lookupResult;
            MessageReactor.logger.debug(`Command not found: ${lookupResultNotFound.missing}.`);
            this.handleLookupNotFound(msg, lookupResultNotFound);
        }
        else if (lookupResult.type === 2 /* ERROR_MISSING_ARGUMENT */) {
            const lookupResultMissingArg = (lookupResult);
            MessageReactor.logger.debug(`Argument missing: ${lookupResultMissingArg.missing}.`);
            this.handleLookupMissingArg(msg, lookupResultMissingArg);
        }
        else if (lookupResult.type === 0 /* SUCCESS */) {
            const lookupResultSuccess = lookupResult;
            MessageReactor.logger.info("Lookup successful.", lookupResultSuccess);
            this.handleLookupSuccess(msg, lookupResultSuccess);
        }
        else {
            MessageReactor.logger.error("Every check failed, this should never happen.", lookupResult);
        }
    }
    handleLookupNotFound(msg, lookupResultNotFound) {
        if (this.config.answerToMissingCommand) {
            MessageReactor.logger.debug("Answering to command not found.");
            this.sendResult(msg, this.config.strings.error.notFound +
                lookupResultNotFound.missing);
        }
    }
    handleLookupMissingArg(msg, lookupResultMissingArg) {
        if (this.config.answerToMissingArgs) {
            MessageReactor.logger.debug("Answering to missing arg.");
            this.sendResult(msg, this.config.strings.error.missingArgs +
                lookupResultMissingArg.missing.map(arg => arg.name));
        }
    }
    handleLookupSuccess(msg, lookupResultSuccess) {
        const command = lookupResultSuccess.command;
        if (this.hasPermissions(msg, command)) {
            MessageReactor.logger.debug("Running command:", command);
            const result = command.fn(lookupResultSuccess.args, msg, this);
            MessageReactor.logger.debug("Command returned:", result);
            if (result != null) {
                MessageReactor.logger.debug("Answering to successful command.");
                this.sendResult(msg, result);
            }
            else {
                MessageReactor.logger.debug("Skipping response.");
            }
        }
        else {
            MessageReactor.logger.debug("No permissions.");
            this.sendResult(msg, this.config.strings.error.noPermission);
        }
    }
    sendResult(msg, value) {
        if (isPromise(value)) {
            MessageReactor.logger.debug("Value is a promise, waiting.");
            value
                .then(valueResolved => this.send(msg, valueResolved))
                .catch(err => MessageReactor.logger.error("Error while waiting for resolve: ", err));
        }
        else {
            this.send(msg, value);
        }
    }
    send(msg, value) {
        MessageReactor.logger.debug("Sending message.", value);
        const isPlainValue = isString(value);
        const content = isPlainValue ? value : value.val;
        const options = {
            code: isPlainValue ? false : value.code,
            files: isPlainValue ? [] : value.files
        };
        msg.channel
            .send(content, options)
            .then(() => MessageReactor.logger.debug("Sent message.", content, options))
            .catch(err => MessageReactor.logger.error("Could not send message.", err));
    }
    hasPermissions(msg, command) {
        let maxPower = 0;
        this.config.roles.forEach(role => {
            if (role.power > maxPower && role.check(msg)) {
                maxPower = role.power;
            }
        });
        return maxPower >= command.data.powerRequired;
    }
}
MessageReactor.logger = dingyLogby.getLogger(MessageReactor);

class JSONStorage {
    constructor(path) {
        this.data = {};
        this.path = path;
        this.logger = dingyLogby.getLogger(JSONStorage);
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
        writeJson(this.path, this.data).catch(e => this.logger.error("Could not save JSON", e));
    }
    load(key) {
        return this.data[key];
    }
    has(key) {
        return !isNil(this.data[key]);
    }
}

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

class Dingy {
    constructor(commands = {}, config = {}) {
        Dingy.logger.info("Creating instance.");
        Dingy.logger.debug("Reading config.");
        this.config = objDefaultsDeep(config, configDefault);
        Dingy.logger.debug("Creating Client.");
        this.client = new Client();
        const commandsDefaulted = this.config
            .enableDefaultCommands
            ? objDefaultsDeep(commands, commandsDefault)
            : commands;
        Dingy.logger.debug("Creating Clingy.");
        this.clingy = new Clingy(commandsDefaulted);
        Dingy.logger.debug("Creating MemoryStorage.");
        this.memoryStorage = new MemoryStorage();
        const storagePath = join("./", Dingy.DATA_DIRECTORY, "storage.json");
        Dingy.logger.debug(`Creating JSONStorage in '${storagePath}'.`);
        this.jsonStorage = new JSONStorage(storagePath);
        Dingy.logger.debug("Creating MessageReactor.");
        this.messageReactor = new MessageReactor(this.config, this.client, this.clingy, this.memoryStorage, this.jsonStorage);
        this.bindEvents();
        Dingy.logger.info("Created instance.");
    }
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
        this.client.on("error", e => Dingy.logger.error("An error occurred, trying to continue.", e));
        this.client.on("message", (msg) => {
            Dingy.logger.trace("A message was sent.", MessageReactor.createSlimMessage(msg));
            this.handleMessage(msg);
        });
    }
    handleMessage(msg) {
        if (!msg.system &&
            !msg.author.bot &&
            msg.content.startsWith(this.config.prefix) &&
            msg.content !== this.config.prefix) {
            Dingy.logger.debug("Message will be processed.", MessageReactor.createSlimMessage(msg));
            this.messageReactor.handleMessage(msg);
        }
    }
}
Dingy.DATA_DIRECTORY = "data";
Dingy.logger = dingyLogby.getLogger(Dingy);

export { Dingy, dingyLogby };
