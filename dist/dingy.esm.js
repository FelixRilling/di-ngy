import { Logby } from 'logby';
import { pathExists, readJson, writeJson } from 'fs-extra';
import { isNil, objDefaultsDeep } from 'lightdash';
import { Client } from 'discord.js';
import { Clingy } from 'cli-ngy';
import { join } from 'path';

const dingyLoggerRoot = new Logby();

class JSONStorage {
    constructor(path) {
        this.data = {};
        this.path = path;
        this.logger = dingyLoggerRoot.getLogger(JSONStorage);
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

const configDefault = {
    prefix: "$",
    roles: [],
    legalQuotes: ["\""],
    caseSensitive: false,
    enableDefaultCommands: true,
    answerToMissingCommand: false,
    answerToMissingArgs: true,
    answerToMissingPerms: true
};

const echo = {
    fn: (args) => args.get("val"),
    alias: [],
    args: [{
            name: "val",
            required: true
        }],
    data: {
        powerRequired: 8,
        hidden: true,
        usableInDMs: true,
        help: ""
    },
    sub: null
};

const commandsDefault = {
    echo
};

class Dingy {
    constructor(commands = {}, config = {}) {
        this.loggerRoot = dingyLoggerRoot;
        this.logger = dingyLoggerRoot.getLogger(Dingy);
        this.logger.info("Creating instance.");
        this.logger.debug("Reading config.");
        this.config = objDefaultsDeep(config, configDefault);
        this.logger.debug("Creating Client.");
        this.client = new Client();
        const commandsDefaulted = this.config.enableDefaultCommands
            ? objDefaultsDeep(commands, commandsDefault)
            : commands;
        this.logger.debug("Creating Clingy.");
        this.clingy = new Clingy(commandsDefaulted);
        this.logger.debug("Creating MemoryStorage.");
        this.memoryStorage = new MemoryStorage();
        const storagePath = join("./", Dingy.DATA_DIRECTORY, "storage.json");
        this.logger.debug(`Creating JSONStorage in '${storagePath}'.`);
        this.jsonStorage = new JSONStorage(storagePath);
        this.logger.debug("Binding events.");
        this.client.on("error", e => this.logger.error("An error occurred", e));
        this.logger.info("Created instance.");
    }
    async connect(token) {
        this.logger.debug("Loading storage.");
        try {
            await this.jsonStorage.init();
        }
        catch (e) {
            const err = e;
            this.logger.error("Could not load storage: ", err);
            throw err;
        }
        this.logger.info("Connecting to the Discord API.");
        try {
            await this.client.login(token);
        }
        catch (e) {
            const err = e;
            this.logger.error("Could not connect to the Discord API", err);
            throw err;
        }
        this.logger.info("Connected.");
    }
    async disconnect() {
        this.logger.info("Disconnecting from the Discord API.");
        try {
            await this.client.destroy();
        }
        catch (e) {
            const err = e;
            this.logger.error("Could not disconnect from the Discord API", err);
            throw err;
        }
        this.logger.info("Disconnected.");
    }
}
Dingy.DATA_DIRECTORY = "data";

export default Dingy;
