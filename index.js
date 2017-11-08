"use strict";

const RECONNECT_TIMEOUT = 10000;

const {
    defaultsDeep,
    isUndefined
} = require("lodash");
const Log = require("log");
const Clingy = require("cli-ngy");
const Discord = require("discord.js");
const flatCache = require("flat-cache");
const mapCommands = require("./lib/events/lib/mapCommands");
const onMessage = require("./lib/events/onMessage");

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
        const app = this;

        if (isUndefined(config.token)) {
            throw new Error("No token provided!");
        }

        /**
         * Stores instance config
         */
        app.config = defaultsDeep(config, configDefault);
        app.strings = defaultsDeep(strings, stringsDefault);
        app.userEvents = defaultsDeep(userEvents, userEventsDefault);

        app.log = new Log(app.config.options.logLevel);
        app.log.debug("Init", "Loaded Config");

        app.cli = new Clingy(
            mapCommands(app.config.options.enableDefaultCommands ? defaultsDeep(commands, commandsDefault) : commands), {
                caseSensitive: app.config.options.namesAreCaseSensitive,
                validQuotes: app.config.options.validQuotes,
            });
        app.log.debug("Init", "Created Clingy");

        /**
         * Bootstraps Client
         */
        app.bot = new Discord.Client();
        app.log.debug("Init", "Created Discord Client");

        app.data = {};
        app.dataPersisted = {};

        app.config.dataPersisted.files.forEach(fileName => {
            app.dataPersisted[fileName] = flatCache.load(`${fileName}.json`, app.config.dataPersisted.dir);
        });
        app.log.debug("Init", "Loaded Data");

        /**
         * Binds events
         */
        app.bot.on("message", msg => {
            onMessage(msg, app);
            app.userEvents.onMessage(msg, app);
        });
        app.bot.on("disconnect", err => {
            app.log.error("Disconnect", err);
            app.log.error("Reconnect", `Attempting to reconnect in ${RECONNECT_TIMEOUT}ms`);
            app.bot.setTimeout(() => {
                app.connect();
            }, RECONNECT_TIMEOUT);
        });

        app.log.info("Init", "Success");
        app.userEvents.onInit(app);
    }
    /**
     * Connect to the Discord API
     */
    connect() {
        const app = this;

        app.log.info("Connect", "Starting");

        app.bot
            .login(app.config.token)
            .then(() => {
                app.log.info("Connect", "Success");
                app.bot.user.setGame(app.strings.currentlyPlaying);
                app.userEvents.onConnect(app);
            })
            .catch(err => {
                app.log.error("Connect", "Failure");

                throw new Error("An error occured connecting to the Discord-API", err);
            });
    }
};
