import { Client } from "discord.js";
import { Clingy } from "cli-ngy";
import { Logby } from "logby";
import { JSONStorage } from "./storage/JSONStorage";
import { MemoryStorage } from "./storage/MemoryStorage";
declare class Dingy {
    private static readonly DATA_DIRECTORY;
    private readonly logger;
    readonly loggerRoot: Logby;
    readonly client: Client;
    readonly clingy: Clingy;
    readonly memoryStorage: MemoryStorage;
    readonly jsonStorage: JSONStorage;
    constructor();
    connect(token: string): Promise<void>;
    disconnect(): Promise<void>;
}
export { Dingy };
