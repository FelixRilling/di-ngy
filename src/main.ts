import { objDefaultsDeep, isUndefined } from "lightdash";
//import Log from "log";
import Clingy from "cli-ngy";
import { Client } from "discord.js";
//import flatCache from "flat-cache";

import mapCommands from "./lib/events/lib/mapCommands";
import onMessage from "./lib/events/onMessage";
import onError from "./lib/events/onError";

import commandsDefault from "./lib/defaults/commands.default";
import configDefault from "./lib/defaults/config.default";
import stringsDefault from "./lib/defaults/strings.default";
import userEventsDefault from "./lib/defaults/userEvents.default";

import { IClingy } from "cli-ngy/src/interfaces";
import {
    IDingy,
    IDingyStrings,
    IDingyConfig,
    IDingyUserEvents
} from "./interfaces";

/**
 * Di-ngy class
 *
 * @class
 */
const Dingy = class implements IDingy {
    public config: IDingyConfig;
    public strings: IDingyStrings;
    public userEvents: IDingyUserEvents;

    public data: object;
    public dataPersisted: object;

    public cli: IClingy;
    public log: any;
    public bot: Client;

    /**
     * Creates Di-ngy instance
     *
     * @constructor
     * @param {Object} config
     * @param {Object} commands
     * @param {Object} strings
     * @param {Object} userEvents
     */
    constructor(
        config: any,
        commands: any = {},
        strings: any = {},
        userEvents: any = {}
    ) {
        if (isUndefined(config.token)) {
            throw new Error("No token provided!");
        }

        /**
         * Stores instance config
         */
        this.config = <IDingyConfig>objDefaultsDeep(config, configDefault);
        this.strings = <IDingyStrings>objDefaultsDeep(strings, stringsDefault);
        this.userEvents = <IDingyUserEvents>objDefaultsDeep(
            userEvents,
            userEventsDefault
        );

        this.log = null;
        //this.log.debug("Init", "Loaded Config");

        this.cli = new Clingy(
            mapCommands(objDefaultsDeep(commands, commandsDefault)),
            {
                caseSensitive: this.config.options.namesAreCaseSensitive,
                validQuotes: this.config.options.validQuotes
            }
        );
        //this.log.debug("Init", "Created Clingy");

        /**
         * Bootstraps Client
         */
        this.bot = new Client();
        //this.log.debug("Init", "Created Discord Client");

        this.data = {};
        this.dataPersisted = {};

        /*this.config.dataPersisted.files.forEach(fileName => {
            this.dataPersisted[fileName] = flatCache.load(
                `${fileName}.json`,
                this.config.dataPersisted.dir
            );
        });
        this.log.debug("Init", "Loaded Data"); */

        /**
         * Binds events
         */
        this.bot.on("message", msg => {
            onMessage(msg, this);
            this.userEvents.onMessage(msg, this);
        });
        this.bot.on("disconnect", err => {
            //this.log.warning("Disconnect", err);
            onError(err, this);
        });
        this.bot.on("error", err => {
            //this.log.error("Error", err);
            onError(err, this);
        });

        //this.log.info("Init", "Success");
        this.userEvents.onInit(this);
    }
    /**
     * Connect to the Discord API
     */
    connect() {
        //this.log.info("Connect", "Starting");

        this.bot
            .login(this.config.token)
            .then(() => {
                //this.log.info("Connect", "Success");
                this.bot.user.setActivity(this.strings.currentlyPlaying);
                this.userEvents.onConnect(this);
            })
            .catch(() => {
                //this.log.error("Connect", "Failure");

                throw new Error(
                    "An error ocurred connecting to the Discord-API"
                );
            });
    }
};

export default Dingy;
