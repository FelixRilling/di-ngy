import { objDefaultsDeep, objMerge, isUndefined } from "lightdash";
import { createLogger, format, transports } from "winston";
import Clingy from "cli-ngy";
import { Client } from "discord.js";
import flatCache from "flat-cache";

import mapCommands from "./events/lib/mapCommands";
import util from "./util/index";
/* import onMessage from "./events/onMessage"; */
import onError from "./events/onError";

import commandsDefault from "./defaults/commands.default";
import configDefault from "./defaults/config.default";
import stringsDefault from "./defaults/strings.default";
import userEventsDefault from "./defaults/userEvents.default";

import {
    IDingy,
    IDingyCli,
    IDingyStrings,
    IDingyConfig,
    IDingyUserEvents,
    IDingyUtils
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

    public bot: Client;
    public cli: IDingyCli;
    public logger: any;
    public util: IDingyUtils;

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
            throw new Error("No token provided");
        }

        this.util = util;

        /**
         * Stores instance config
         */
        this.config = <IDingyConfig>objDefaultsDeep(config, configDefault);
        this.strings = <IDingyStrings>objDefaultsDeep(strings, stringsDefault);
        this.userEvents = <IDingyUserEvents>objDefaultsDeep(
            userEvents,
            userEventsDefault
        );

        this.logger = createLogger({
            level: this.config.options.logLevel,
            exitOnError: false,
            format: format.combine(
                format.timestamp(),
                format.printf(info => {
                    return `${info.timestamp} [${info.level}] ${info.message}`;
                })
            ),
            transports: [
                new transports.Console(),
                new transports.File({ filename: "bot.log" })
            ]
        });
        this.logger.info("Init: Loaded Config");

        this.cli = <IDingyCli>new Clingy(
            mapCommands(objMerge(commandsDefault, commands)),
            {
                caseSensitive: this.config.options.namesAreCaseSensitive,
                validQuotes: this.config.options.validQuotes
            }
        );
        this.logger.info("Init: Created Clingy");

        /**
         * Bootstraps Client
         */
        this.bot = new Client();
        this.logger.info("Init: Created Discord Client");

        this.data = {};
        this.dataPersisted = {};
        this.config.dataPersisted.files.forEach(fileName => {
            this.dataPersisted[fileName] = flatCache.load(
                `${fileName}.json`,
                this.config.dataPersisted.dir
            );
        });
        this.logger.info("Init: Loaded Data");

        /**
         * Binds events
         */
        this.bot.on("message", msg => {
            /*   onMessage(msg, this);
              this.userEvents.onMessage(msg, this); */
        });
        this.bot.on("disConnect", err => {
            this.logger.error("Dissconnect", err);
            onError(err, this);
        });
        this.bot.on("error", err => {
            this.logger.error("Error", err);
            onError(err, this);
        });

        this.logger.info("Init: Success");
        this.userEvents.onInit(this);
    }
    /**
     * Connect to the Discord API
     */
    connect() {
        this.logger.info("Connect: Starting");

        this.bot
            .login(this.config.token)
            .then(() => {
                this.logger.info("Connect: Success");
                this.bot.user.setActivity(this.strings.currentlyPlaying);
                this.userEvents.onConnect(this);
            })
            .catch(() => {
                this.logger.error("Connect: Error");

                throw new Error(
                    "An error ocurred Connecting to the Discord API"
                );
            });
    }
};

export default Dingy;
