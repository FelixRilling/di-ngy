import { IConfig } from "./IConfig";
/**
 * Default role for every user.
 */
declare const DEFAULT_ROLE: {
    power: number;
    check: () => boolean;
};
/**
 * Default config settings.
 *
 * @private
 */
declare const configDefault: IConfig;
export { configDefault, DEFAULT_ROLE };
