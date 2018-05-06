import { Client } from "discord.js";
import { IDingyCli, IDingyConfig, IDingyStrings, IDingyUserEvents, IDingyUtils } from "./interfaces";
/**
 * Di-ngy class
 *
 * @public
 * @class
 */
declare const Dingy: {
    new (config: any, commands?: any, strings?: any, userEvents?: any): {
        config: IDingyConfig;
        strings: IDingyStrings;
        userEvents: IDingyUserEvents;
        data: object;
        dataPersisted: object;
        bot: Client;
        cli: IDingyCli;
        logger: any;
        util: IDingyUtils;
        connect(): void;
    };
};
export default Dingy;
