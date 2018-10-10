'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var logby = require('logby');
var fsExtra = require('fs-extra');
var lightdash = require('lightdash');
var cliNgy = require('cli-ngy');
var discord_js = require('discord.js');
var path = require('path');

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

const dingyLogby = new logby.Logby();

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
            this.handleNotFound(msg, lookupResultNotFound);
        }
        else if (lookupResult.type === 2 /* ERROR_MISSING_ARGUMENT */) {
            const lookupResultMissingArg = (lookupResult);
            MessageReactor.logger.debug(`Argument missing: ${lookupResultMissingArg.missing}.`);
            this.handleMissingArg(msg, lookupResultMissingArg);
        }
        else if (lookupResult.type === 0 /* SUCCESS */) {
            const lookupResultSuccess = lookupResult;
            MessageReactor.logger.info("Lookup successful.", lookupResultSuccess);
            this.handleSuccess(msg, lookupResultSuccess);
        }
        else {
            MessageReactor.logger.error("Every check failed, this should never happen.", lookupResult);
        }
    }
    handleNotFound(msg, lookupResultNotFound) {
        if (this.config.answerToMissingCommand) {
            MessageReactor.logger.debug("Answering to command not found.");
            this.send(msg, this.config.strings.error.notFound + lookupResultNotFound.missing);
        }
    }
    handleMissingArg(msg, lookupResultMissingArg) {
        if (this.config.answerToMissingArgs) {
            MessageReactor.logger.debug("Answering to missing arg.");
            this.send(msg, this.config.strings.error.missingArgs + lookupResultMissingArg.missing.map(arg => arg.name));
        }
    }
    handleSuccess(msg, lookupResultSuccess) {
        MessageReactor.logger.debug("Answering to successful command.");
        this.send(msg, "ok");
    }
    send(msg, value) {
        MessageReactor.logger.debug("Sending message.", value);
        msg.channel
            .send(value)
            .then(() => MessageReactor.logger.debug("Sent message."))
            .catch(err => MessageReactor.logger.error("Could not send message.", err));
    }
}
MessageReactor.logger = dingyLogby.getLogger(MessageReactor);

class JSONStorage {
    constructor(path$$1) {
        this.data = {};
        this.path = path$$1;
        this.logger = dingyLogby.getLogger(JSONStorage);
    }
    async init() {
        const exists = await fsExtra.pathExists(this.path);
        if (exists) {
            this.data = await fsExtra.readJson(this.path);
        }
        else {
            await fsExtra.writeJson(this.path, this.data);
        }
    }
    save(key, val) {
        this.data[key] = val;
        // We don't need to wait for the saving to finish
        // this *could* lead to locking/access issues but hey, probably works.
        fsExtra.writeJson(this.path, this.data).catch(e => this.logger.error("Could not save JSON", e));
    }
    load(key) {
        return this.data[key];
    }
    has(key) {
        return !lightdash.isNil(this.data[key]);
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
        this.config = lightdash.objDefaultsDeep(config, configDefault);
        Dingy.logger.debug("Creating Client.");
        this.client = new discord_js.Client();
        const commandsDefaulted = this.config
            .enableDefaultCommands
            ? lightdash.objDefaultsDeep(commands, commandsDefault)
            : commands;
        Dingy.logger.debug("Creating Clingy.");
        this.clingy = new cliNgy.Clingy(commandsDefaulted);
        Dingy.logger.debug("Creating MemoryStorage.");
        this.memoryStorage = new MemoryStorage();
        const storagePath = path.join("./", Dingy.DATA_DIRECTORY, "storage.json");
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

exports.Dingy = Dingy;
exports.dingyLogby = dingyLogby;
