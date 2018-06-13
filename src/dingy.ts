import Clingy from "cli-ngy";
import { Client, Message } from "discord.js";
import flatCache from "flat-cache";
import { isUndefined, objDecycle, objDefaultsDeep } from "lightdash";
import { createLogger, format, Logger, transports } from "winston";

import { mapCommands } from "./events/lib/mapCommands";
import { onError } from "./events/onError";
import { onMessage } from "./events/onMessage";

import { commandsDefault } from "./defaults/commands.default";
import { configDefault } from "./defaults/config.default";
import { stringsDefault } from "./defaults/strings.default";
import { userEventsDefault } from "./defaults/userEvents.default";

import { humanizeList, humanizeListOptionals } from "./util/humanizeList";
import { jsonToYaml } from "./util/jsonToYaml";
import { loadAttachment } from "./util/loadAttachment";
import { resolveChannel } from "./util/resolveChannel";
import { resolveMember } from "./util/resolveMember";
import { resolveUser } from "./util/resolveUser";
import { stripBotData } from "./util/stripBotData";
import { toFullName } from "./util/toFullName";

import {
    IDingy,
    IDingyCli,
    IDingyConfig,
    IDingyStrings,
    IDingyUserEvents,
    IDingyUtils
} from "./interfaces";

/**
 * Di-ngy class
 *
 * @public
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
    public logger: Logger;
    public util: IDingyUtils;

    /**
     * Creates Di-ngy instance
     *
     * @constructor
     * @param {Object} config
     * @param {Object} [commands={}]
     * @param {Object} [strings={}]
     * @param {Object} [userEvents={}]
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

        /**
         * Contains internal utility methods
         *
         * @private
         */
        this.util = {
            decycle: objDecycle,
            humanizeList,
            humanizeListOptionals,
            jsonToYaml,
            loadAttachment,
            resolveChannel,
            resolveMember,
            resolveUser,
            stripBotData,
            toFullName
        };

        /**
         * Stores instance config
         *
         * @protected
         */
        this.config = <IDingyConfig>objDefaultsDeep(config, configDefault);

        /**
         * Strings used by the bot
         *
         * @protected
         */
        this.strings = <IDingyStrings>objDefaultsDeep(strings, stringsDefault);

        /**
         * Custom user events
         *
         * @protected
         */
        this.userEvents = <IDingyUserEvents>(
            objDefaultsDeep(userEvents, userEventsDefault)
        );

        /**
         * Winston logger
         *
         * @protected
         */
        this.logger = createLogger({
            level: this.config.options.logLevel,
            exitOnError: false,
            format: format.combine(
                format.timestamp(),
                format.printf((info: any) => {
                    return `${info.timestamp} [${info.level}] ${info.message}`;
                })
            ),
            transports: [
                new transports.Console(),
                new transports.File({ filename: "bot.log" })
            ]
        });
        this.logger.verbose("Init: Loaded Config");

        /**
         * Command interpreter
         *
         * @protected
         */
        this.cli = <IDingyCli>(
            new Clingy(mapCommands(Object.assign(commandsDefault, commands)), {
                caseSensitive: this.config.options.namesAreCaseSensitive,
                validQuotes: this.config.options.validQuotes
            })
        );
        this.logger.verbose("Init: Created Clingy");

        /**
         * Discord.js client
         *
         * @public
         */
        this.bot = new Client();
        this.logger.verbose("Init: Created Discord Client");

        /**
         * Runtime data storage
         *
         * @public
         */
        this.data = {};
        /**
         * Persisted data storage
         *
         * @public
         */
        this.dataPersisted = {};
        this.config.dataPersisted.files.forEach(fileName => {
            this.dataPersisted[fileName] = flatCache.load(
                `${fileName}.json`,
                this.config.dataPersisted.dir
            );
        });
        this.logger.verbose("Init: Loaded Data");

        /**
         * Binds events
         */
        this.bot.on("message", (msg: Message) => {
            onMessage(msg, this);
            this.userEvents.onMessage(msg, this);
        });
        this.bot.on("disconnect", (err: Error) => {
            this.logger.error("Disconnect", err);
            onError(err, this);
        });
        this.bot.on("error", (err: Error) => {
            this.logger.error("Error", err);
            onError(err, this);
        });

        this.logger.info("Init: Success");
        this.userEvents.onInit(this);
    }
    /**
     * Connect to the Discord API
     *
     * @public
     */
    public connect() {
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

export { Dingy };
