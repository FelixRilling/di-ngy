import { Client } from "discord.js";
import { IDingyCli, IDingyStrings, IDingyConfig, IDingyUserEvents } from "./interfaces";
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
        cli: IDingyCli;
        logger: any;
        bot: Client;
        connect(): void;
    };
};
export default Dingy;
