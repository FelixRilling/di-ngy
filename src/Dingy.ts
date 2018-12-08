import { Client, Message } from "discord.js";
import { objDefaultsDeep } from "lightdash";
import { IAnyObject } from "lightdash/types/obj/lib/IAnyObject";
import { ILogger } from "logby";
import * as path from "path";
import { configDefault } from "./config/config.default";
import { IConfig } from "./config/IConfig";
import { dingyLogby } from "./logger";
import { createSlimMessage } from "./message/createSlimMessage";
import { MessageReceiverService } from "./message/MessageReceiverService";
import { JSONStorage } from "./storage/JSONStorage";
import { MemoryStorage } from "./storage/MemoryStorage";

/**
 * Main Dingy class.
 */
class Dingy {
    private static readonly logger: ILogger = dingyLogby.getLogger(Dingy);
    private static readonly DATA_DIRECTORY = "data";

    public readonly config: IConfig;
    public readonly client: Client;
    public readonly memoryStorage: MemoryStorage;
    public readonly jsonStorage: JSONStorage;

    private readonly messageReceiverService: MessageReceiverService;

    /**
     * Creates a new Dingy instance.
     *
     * @param commands Object containing command for the bot to use.
     * @param config Config object.
     */
    constructor(commands: IAnyObject = {}, config: IAnyObject = {}) {
        Dingy.logger.info("Creating instance.");

        Dingy.logger.debug("Reading config.");
        this.config = <IConfig>objDefaultsDeep(config, configDefault);

        Dingy.logger.debug("Creating Client.");
        this.client = new Client();

        Dingy.logger.debug("Creating MemoryStorage.");
        this.memoryStorage = new MemoryStorage();

        const storagePath = path.join(
            "./",
            Dingy.DATA_DIRECTORY,
            "storage.json"
        );
        Dingy.logger.debug(`Creating JSONStorage in '${storagePath}'.`);
        this.jsonStorage = new JSONStorage(storagePath);

        Dingy.logger.debug("Creating MessageReceiverService.");
        this.messageReceiverService = new MessageReceiverService(
            this,
            commands
        );

        this.bindEvents();

        Dingy.logger.info("Created instance.");
    }

    /**
     * Connects the instance to the Discord API.
     *
     * @param token API token.
     */
    public async connect(token: string): Promise<void> {
        Dingy.logger.debug("Loading storage.");
        try {
            await this.jsonStorage.init();
        } catch (e) {
            const err: Error = e;
            Dingy.logger.error("Could not load storage: ", err);
            throw err;
        }

        Dingy.logger.info("Connecting to the Discord API.");
        try {
            await this.client.login(token);
        } catch (e) {
            const err: Error = e;
            Dingy.logger.error("Could not connect to the Discord API.", err);
            throw err;
        }
        Dingy.logger.info("Connected.");
    }

    /**
     * Disconnects the instance from the discord API.
     */
    public async disconnect(): Promise<void> {
        Dingy.logger.info("Disconnecting from the Discord API.");
        try {
            await this.client.destroy();
        } catch (e) {
            const err: Error = e;
            Dingy.logger.error(
                "Could not disconnect from the Discord API.",
                err
            );
            throw err;
        }
        Dingy.logger.info("Disconnected.");
    }

    private bindEvents() {
        Dingy.logger.debug("Binding events.");
        this.client.on("error", err =>
            Dingy.logger.error("An error occurred, trying to continue.", err)
        );
        this.client.on("message", msg => this.messageHandler(msg));
    }

    private messageHandler(msg: Message) {
        Dingy.logger.trace("A message was sent.", createSlimMessage(msg));
        if (
            !msg.system &&
            !msg.author.bot &&
            msg.content.startsWith(this.config.prefix) &&
            msg.content !== this.config.prefix
        ) {
            Dingy.logger.info(
                "Message will be processed.",
                createSlimMessage(msg)
            );
            this.messageReceiverService.handleMessage(msg);
        }
    }
}

export { Dingy };
