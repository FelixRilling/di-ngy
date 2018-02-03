import { Client } from "discord.js";
import { IDingyCli, IDingyStrings, IDingyConfig, IDingyUserEvents, IDingyUtils } from "./interfaces";
import { objectStringKeyed } from "lightdash/src/types";
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
        data: objectStringKeyed;
        dataPersisted: objectStringKeyed;
        bot: Client;
        cli: IDingyCli;
        logger: any;
        util: IDingyUtils;
        connect(): void;
    };
};
export default Dingy;
