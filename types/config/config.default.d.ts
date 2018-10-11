import { IConfig } from "./IConfig";
/**
 * Default role for everyone.
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
