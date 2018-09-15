'use strict';

var logby = require('logby');
var fsExtra = require('fs-extra');
var lightdash = require('lightdash');
var discord_js = require('discord.js');
var cliNgy = require('cli-ngy');
var path = require('path');

const dingyLoggerRoot = new logby.Logby();

class JSONStorage {
    constructor(path$$1) {
        this.data = {};
        this.path = path$$1;
        this.logger = dingyLoggerRoot.getLogger(JSONStorage);
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
        fsExtra.writeJson(this.path, this.data)
            .catch(e => this.logger.error("Could not save JSON", e));
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
    constructor() {
        this.loggerRoot = dingyLoggerRoot;
        this.logger = dingyLoggerRoot.getLogger(Dingy);
        this.logger.info("Creating instance.");
        this.logger.debug("Creating Client.");
        this.client = new discord_js.Client();
        this.logger.debug("Creating Clingy.");
        this.clingy = new cliNgy.Clingy();
        this.logger.debug("Creating MemoryStorage.");
        this.memoryStorage = new MemoryStorage();
        const storagePath = path.join("./", Dingy.DATA_DIRECTORY, "storage.json");
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

module.exports = Dingy;
