import { Client } from "discord.js";
import { Clingy } from "cli-ngy";
import { JSONStorage } from "./storage/JSONStorage";
import { MemoryStorage } from "./storage/MemoryStorage";
import { ITypedObject } from "lightdash/types/obj/lib/ITypedObject";
declare class Dingy {
    private static readonly DATA_DIRECTORY;
    private static readonly loggerRoot;
    private static readonly logger;
    private readonly config;
    private readonly messageReactor;
    readonly client: Client;
    readonly clingy: Clingy;
    readonly memoryStorage: MemoryStorage;
    readonly jsonStorage: JSONStorage;
    constructor(commands?: ITypedObject<any>, config?: ITypedObject<any>);
    connect(token: string): Promise<void>;
    disconnect(): Promise<void>;
    private bindEvents;
}
export { Dingy };
