import { Client, Message } from "discord.js";
import { Clingy } from "cli-ngy";
import { ILogger, Logby } from "logby";
import { dingyLoggerRoot } from "./loggerRoot";
import { JSONStorage } from "./storage/JSONStorage";
import { MemoryStorage } from "./storage/MemoryStorage";
import * as path from "path";
import { IConfig } from "./config/IConfig";
import { objDefaultsDeep } from "lightdash";
import { configDefault } from "./config/config.default";
import { commandsDefault } from "./commands/commands.default";
import { ITypedObject } from "lightdash/types/obj/lib/ITypedObject";
import { IDingyCommandObject } from "./commands/IDingyCommandObject";
import { MessageReactor } from "./message/MessageReactor";

class Dingy {
    private static readonly DATA_DIRECTORY = "data";

    private static readonly loggerRoot: Logby = dingyLoggerRoot;
    private static readonly logger: ILogger = dingyLoggerRoot.getLogger(Dingy);

    private readonly config: IConfig;
    private readonly messageReactor: MessageReactor;

    public readonly client: Client;
    public readonly clingy: Clingy;
    public readonly memoryStorage: MemoryStorage;
    public readonly jsonStorage: JSONStorage;

    constructor(
        commands: ITypedObject<any> = {},
        config: ITypedObject<any> = {}
    ) {
        Dingy.logger.info("Creating instance.");

        Dingy.logger.debug("Reading config.");
        this.config = <IConfig>objDefaultsDeep(config, configDefault);

        Dingy.logger.debug("Creating Client.");
        this.client = new Client();

        const commandsDefaulted: IDingyCommandObject = this.config
            .enableDefaultCommands
            ? objDefaultsDeep(commands, commandsDefault)
            : commands;
        Dingy.logger.debug("Creating Clingy.");
        this.clingy = new Clingy(commandsDefaulted);

        Dingy.logger.debug("Creating MemoryStorage.");
        this.memoryStorage = new MemoryStorage();

        const storagePath = path.join(
            "./",
            Dingy.DATA_DIRECTORY,
            "storage.json"
        );
        Dingy.logger.debug(`Creating JSONStorage in '${storagePath}'.`);
        this.jsonStorage = new JSONStorage(storagePath);

        Dingy.logger.debug("Creating MessageReactor.");
        this.messageReactor = new MessageReactor(
            this.config,
            this.client,
            this.clingy,
            this.memoryStorage,
            this.jsonStorage
        );

        this.bindEvents();

        Dingy.logger.info("Created instance.");
    }

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
            Dingy.logger.error("Could not connect to the Discord API", err);
            throw err;
        }
        Dingy.logger.info("Connected.");
    }

    public async disconnect(): Promise<void> {
        Dingy.logger.info("Disconnecting from the Discord API.");
        try {
            await this.client.destroy();
        } catch (e) {
            const err: Error = e;
            Dingy.logger.error(
                "Could not disconnect from the Discord API",
                err
            );
            throw err;
        }
        Dingy.logger.info("Disconnected.");
    }

    private bindEvents() {
        Dingy.logger.debug("Binding events.");
        this.client.on("error", e =>
            Dingy.logger.error("An error occurred", e)
        );
        this.client.on("message", (msg: Message) => {
            Dingy.logger.trace("Message was sent ", msg);
            if (
                !msg.system &&
                !msg.author.bot &&
                msg.content.startsWith(this.config.prefix) &&
                msg.content !== this.config.prefix
            ) {
                Dingy.logger.debug("Message will be processed", msg);
                this.messageReactor.handleMessage(msg);
            }
        });
    }
}

export { Dingy };
