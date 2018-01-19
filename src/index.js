"use strict";

const {
    objDefaultsDeep,
    isUndefined
} = require("lightdash");
const Log = require("log");
const Clingy = require("cli-ngy");
const Discord = require("discord.js");
const flatCache = require("flat-cache");

const mapCommands = require("./lib/events/lib/mapCommands");
const onMessage = require("./lib/events/onMessage");
const onError = require("./lib/events/onError");

const configDefault = require("./lib/defaults/config.default");
const stringsDefault = require("./lib/defaults/strings.default");
const commandsDefault = require("./lib/defaults/commands.default");
const userEventsDefault = require("./lib/defaults/userEvents.default");

/**
 * Di-ngy class
 *
 * @class
 */
module.exports = class {
    /**
     * Creates Di-ngy instance
     * {
     *   bot,           //Discord.js instance
     *   cli,           //Cli-ngy command parser
     *   log,           //Logger
     *
     *   strings,       //String object
     *   config,        //Config object
     *   userEvents     //Even object
     *
     *   data,          //Runtime Data
     *   dataPersisted  //Persisted Data (As JSON)
     * }
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

        this.log = new Log(this.config.options.logLevel);
        this.log.debug("Init", "Loaded Config");

        this.cli = new Clingy(
            mapCommands(this.config.options.enableDefaultCommands ? objDefaultsDeep(commands, commandsDefault) : commands), {
                caseSensitive: this.config.options.namesAreCaseSensitive,
                validQuotes: this.config.options.validQuotes,
            });
        this.log.debug("Init", "Created Clingy");

        /**
         * Bootstraps Client
         */
        this.bot = new Discord.Client();
        this.log.debug("Init", "Created Discord Client");

        this.data = {};
        this.dataPersisted = {};

        this.config.dataPersisted.files.forEach(fileName => {
            this.dataPersisted[fileName] = flatCache.load(`${fileName}.json`, this.config.dataPersisted.dir);
        });
        this.log.debug("Init", "Loaded Data");

        /**
         * Binds events
         */
        this.bot.on("message", msg => {
            onMessage(msg, this);
            this.userEvents.onMessage(msg, this);
        });
        this.bot.on("disconnect", err => {
            this.log.warning("Disconnect", err);
            onError(err, this);
        });
        this.bot.on("error", err => {
            this.log.error("Error", err);
            onError(err, this);
        });

        this.log.info("Init", "Success");
        this.userEvents.onInit(this);
    }
    /**
     * Connect to the Discord API
     */
    connect() {
        this.log.info("Connect", "Starting");

        this.bot
            .login(this.config.token)
            .then(() => {
                this.log.info("Connect", "Success");
                this.bot.user.setActivity(this.strings.currentlyPlaying);
                this.userEvents.onConnect(this);
            })
            .catch(err => {
                this.log.error("Connect", "Failure");

                throw new Error("An error ocurred connecting to the Discord-API", err);
            });
    }
};
