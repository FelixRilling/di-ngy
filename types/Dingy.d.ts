import { Client } from "discord.js";
import { IAnyObject } from "lightdash/types/obj/lib/IAnyObject";
import { IConfig } from "./config/IConfig";
import { JSONStorage } from "./storage/JSONStorage";
import { MemoryStorage } from "./storage/MemoryStorage";
/**
 * Main Dingy class.
 */
declare class Dingy {
    private static readonly logger;
    private static readonly DATA_DIRECTORY;
    readonly config: IConfig;
    readonly client: Client;
    readonly memoryStorage: MemoryStorage;
    readonly jsonStorage: JSONStorage;
    private readonly messageReceiverService;
    /**
     * Creates a new Dingy instance.
     *
     * @param commands Object containing command for the bot to use.
     * @param config Config object.
     */
    constructor(commands?: IAnyObject, config?: IAnyObject);
    /**
     * Connects the instance to the Discord API.
     *
     * @param token API token.
     */
    connect(token: string): Promise<void>;
    /**
     * Disconnects the instance from the discord API.
     */
    disconnect(): Promise<void>;
    private bindEvents;
    private messageHandler;
}
export { Dingy };
