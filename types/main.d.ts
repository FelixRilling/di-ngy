import { IClingy } from "cli-ngy/src/interfaces";
import { Client } from "discord.js";
import { IDingyStrings, IDingyConfig, IDingyUserEvents } from "./interface";
/**
 * Di-ngy class
 *
 * @class
 */
declare const Dingy: {
    new (config: any, commands?: {}, strings?: {}, userEvents?: {}): {
        config: IDingyConfig;
        strings: IDingyStrings;
        userEvents: IDingyUserEvents;
        data: object;
        dataPersisted: object;
        cli: IClingy;
        log: any;
        bot: Client;
        connect(): void;
    };
};
export default Dingy;
