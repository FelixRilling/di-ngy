'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var lightdash = require('lightdash');
var Log = _interopDefault(require('log'));

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
    separator: "-".repeat(12),
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
    onMessage: () => { },
    onConnect: () => { }
};

/* import mapCommands from "./lib/events/lib/mapCommands";
import onMessage from "./lib/events/onMessage";
import onError from "./lib/events/onError";
import commandsDefault from "./lib/defaults/commands.default";*/
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
        if (lightdash.isUndefined(config.token)) {
            throw new Error("No token provided!");
        }
        /**
         * Stores instance config
         */
        this.config = lightdash.objDefaultsDeep(config, configDefault);
        this.strings = lightdash.objDefaultsDeep(strings, stringsDefault);
        this.userEvents = lightdash.objDefaultsDeep(userEvents, userEventsDefault);
        this.log = new Log(this.config.options.logLevel);
        this.log.debug("Init", "Loaded Config");
        /* this.cli = new Clingy(
            mapCommands(
                this.config.options.enableDefaultCommands
                    ? objDefaultsDeep(commands, commandsDefault)
                    : commands
            ),
            {
                caseSensitive: this.config.options.namesAreCaseSensitive,
                validQuotes: this.config.options.validQuotes
            }
        );
        this.log.debug("Init", "Created Clingy"); */
        /**
         * Bootstraps Client
         */
        /*         this.bot = new Discord.Client();
        this.log.debug("Init", "Created Discord Client");

        this.data = {};
        this.dataPersisted = {};

        this.config.dataPersisted.files.forEach(fileName => {
            this.dataPersisted[fileName] = flatCache.load(
                `${fileName}.json`,
                this.config.dataPersisted.dir
            );
        });
        this.log.debug("Init", "Loaded Data"); */
        /**
         * Binds events
         */
        /*         this.bot.on("message", msg => {
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
        this.userEvents.onInit(this);*/
    }
    /**
     * Connect to the Discord API
     */
    connect() {
        /*         this.log.info("Connect", "Starting");

        this.bot
            .login(this.config.token)
            .then(() => {
                this.log.info("Connect", "Success");
                this.bot.user.setActivity(this.strings.currentlyPlaying);
                this.userEvents.onConnect(this);
            })
            .catch(() => {
                this.log.error("Connect", "Failure");

                throw new Error(
                    "An error ocurred connecting to the Discord-API"
                );
            }); */
    }
};

module.exports = Dingy;
