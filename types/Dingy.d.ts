import { Client } from "discord.js";
import { IConfig } from "./config/IConfig";
import { JSONStorage } from "./storage/JSONStorage";
import { MemoryStorage } from "./storage/MemoryStorage";
import { IAnyObject } from "lightdash/types/obj/lib/IAnyObject";
/**
 * Main Dingy class.
 */
declare class Dingy {
    private static readonly DATA_DIRECTORY;
    private static readonly logger;
    readonly config: IConfig;
    readonly client: Client;
    readonly memoryStorage: MemoryStorage;
    readonly jsonStorage: JSONStorage;
    private readonly messageController;
    /**
     * Creates a new Dingy instance.
     *
     * @param commands Object containing commands for the bot to use.
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
