import { Client } from "discord.js";
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

class Dingy {
    private static readonly DATA_DIRECTORY = "data";

    private readonly logger: ILogger;
    private readonly loggerRoot: Logby;
    private readonly config: IConfig;

    public readonly client: Client;
    public readonly clingy: Clingy;
    public readonly memoryStorage: MemoryStorage;
    public readonly jsonStorage: JSONStorage;

    constructor(commands: object = {}, config: object = {}) {
        this.loggerRoot = dingyLoggerRoot;
        this.logger = dingyLoggerRoot.getLogger(Dingy);

        this.logger.info("Creating instance.");

        this.logger.debug("Saving config.");
        this.config = objDefaultsDeep(config, configDefault);

        this.logger.debug("Creating Client.");
        this.client = new Client();

        this.logger.debug("Creating Clingy.");
        this.clingy = new Clingy(objDefaultsDeep(commands, commandsDefault));

        this.logger.debug("Creating MemoryStorage.");
        this.memoryStorage = new MemoryStorage();

        const storagePath = path.join(
            "./",
            Dingy.DATA_DIRECTORY,
            "storage.json"
        );
        this.logger.debug(`Creating JSONStorage in '${storagePath}'.`);
        this.jsonStorage = new JSONStorage(storagePath);

        this.logger.debug("Binding events.");
        this.client.on("error", e => this.logger.error("An error occurred", e));

        this.logger.info("Created instance.");
    }

    async connect(token: string): Promise<void> {
        this.logger.debug("Loading storage.");
        try {
            await this.jsonStorage.init();
        } catch (e) {
            const err: Error = e;
            this.logger.error("Could not load storage: ", err);
            throw err;
        }

        this.logger.info("Connecting to the Discord API.");
        try {
            await this.client.login(token);
        } catch (e) {
            const err: Error = e;
            this.logger.error("Could not connect to the Discord API", err);
            throw err;
        }
        this.logger.info("Connected.");
    }

    async disconnect(): Promise<void> {
        this.logger.info("Disconnecting from the Discord API.");
        try {
            await this.client.destroy();
        } catch (e) {
            const err: Error = e;
            this.logger.error("Could not disconnect from the Discord API", err);
            throw err;
        }
        this.logger.info("Disconnected.");
    }
}

export { Dingy };
