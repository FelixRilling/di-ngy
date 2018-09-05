import { Client } from "discord.js";
import { Logger } from "winston";
import { IDingyCli } from "./cli";
import { IDingyConfig } from "./defaults/config.default";
import { IDingyStrings } from "./defaults/strings.default";
import { IDingyUserEvents } from "./defaults/userEvents.default";
interface IDingyUtils {
    [key: string]: (...args: any[]) => any;
}
interface IDingy {
    config: IDingyConfig;
    strings: IDingyStrings;
    userEvents: IDingyUserEvents;
    data: object;
    dataPersisted: object;
    bot: Client;
    cli: IDingyCli;
    logger: Logger;
    util: IDingyUtils;
    connect: () => void;
}
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
        logger: Logger;
        util: IDingyUtils;
        /**
         * Connect to the Discord API
         *
         * @public
         */
        connect(): void;
    };
};
export { Dingy, IDingy };
