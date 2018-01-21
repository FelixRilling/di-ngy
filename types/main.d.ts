import { Client } from "discord.js";
import { IClingy } from "cli-ngy/src/interfaces";
import { IDingyStrings, IDingyConfig, IDingyUserEvents } from "./interfaces";
/**
 * Di-ngy class
 *
 * @class
 */
declare const Dingy: {
    new (config: any, commands?: any, strings?: any, userEvents?: any): {
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
