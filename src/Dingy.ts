import { Client } from "discord.js";
import { Clingy } from "cli-ngy";
import { ILogger, Logby } from "logby";
import { dingyLoggerRoot } from "./loggerRoot";
import { JSONStorage } from "./storage/JSONStorage";
import { MemoryStorage } from "./storage/MemoryStorage";
import * as path from "path";

class Dingy {
    private static readonly DATA_DIRECTORY = "data";

    private readonly logger: ILogger; // Logger Instance
    public readonly loggerRoot: Logby; // Root logger
    public readonly client: Client; // Discord client
    public readonly clingy: Clingy; // Clingy instance
    public readonly memoryStorage: MemoryStorage; // Runtime data
    public readonly jsonStorage: JSONStorage; // Persisted data

    constructor() {
        this.loggerRoot = dingyLoggerRoot;
        this.logger = dingyLoggerRoot.getLogger(Dingy);

        this.logger.info("Creating instance.");

        this.logger.debug("Creating Client.");
        this.client = new Client();

        this.logger.debug("Creating Clingy.");
        this.clingy = new Clingy();

        this.logger.debug("Creating MemoryStorage.");
        this.memoryStorage = new MemoryStorage();

        const storagePath = path.join("./", Dingy.DATA_DIRECTORY, "storage.json");
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
