import { Client } from "discord.js";
import { IAnyObject } from "lightdash/types/obj/lib/IAnyObject";
import { IConfig } from "./config/IConfig";
import { IInitializableStorage } from "./storage/IInitializableStorage";
import { IStorage } from "./storage/IStorage";
/**
 * Main Dingy class.
 */
declare class Dingy {
    private static readonly logger;
    private static readonly DATA_DIRECTORY;
    readonly config: IConfig;
    readonly client: Client;
    readonly memoryStorage: IStorage<any>;
    readonly persistentStorage: IInitializableStorage<any>;
    private readonly messageReceiverService;
    /**
     * Creates a new Dingy instance.
     *
     * @param commands Object containing commands for the bot to use.
     * @param config Config object.
     * @param memoryStorage Storage instance handling runtime data. Falls back to {@link MemoryStorage}.
     * @param persistentStorage Storage instance handling persistent data; Falls back to {@link JSONStorage}.
     */
    constructor(commands: IAnyObject, config?: IAnyObject, memoryStorage?: IStorage<any>, persistentStorage?: IInitializableStorage<any>);
    /**
     * Connects the instance to the Discord API.
     *
     * @param token API token.
     */
    connect(token: string): Promise<void>;
    /**
     * Disconnects the instance from the Discord API.
     */
    disconnect(): Promise<void>;
    private bindEvents;
    private messageHandler;
}
export { Dingy };
