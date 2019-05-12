import { Client } from "discord.js";
import { IAnyObject } from "lightdash/types/obj/lib/IAnyObject";
import { IConfig } from "./config/IConfig";
import { IInitializableStorage } from "./storage/IInitializableStorage";
import { IStorage } from "./storage/IStorage";
/**
 * Main Dingy class.
 *
 * @public
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
     * @param {object} commands Object containing commands for the bot to use.
     * @param {object?} config Config object.
     * @param {object?} memoryStorage Storage instance handling runtime data. Falls back to {@link MemoryStorage}.
     * @param {object?} persistentStorage Storage instance handling persistent data; Falls back to {@link JSONStorage}.
     */
    constructor(commands: IAnyObject, config?: IAnyObject, memoryStorage?: IStorage<any>, persistentStorage?: IInitializableStorage<any>);
    /**
     * Connects the instance to the Discord API.
     *
     * @param {string} token API token.
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
