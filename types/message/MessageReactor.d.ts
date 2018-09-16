import { Client, Message } from "discord.js";
import { Clingy } from "cli-ngy";
import { IConfig } from "../config/IConfig";
import { MemoryStorage } from "../storage/MemoryStorage";
import { JSONStorage } from "../storage/JSONStorage";
declare class MessageReactor {
    private static readonly logger;
    private readonly config;
    readonly client: Client;
    readonly clingy: Clingy;
    readonly memoryStorage: MemoryStorage;
    readonly jsonStorage: JSONStorage;
    constructor(config: IConfig, client: Client, clingy: Clingy, memoryStorage: MemoryStorage, jsonStorage: JSONStorage);
    handleMessage(msg: Message): void;
    private handleNotFound;
    private handleMissingArg;
    private handleSuccess;
    private send;
}
export { MessageReactor };
