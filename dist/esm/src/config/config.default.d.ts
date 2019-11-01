import { Config } from "./Config";
/**
 * Default role for every user.
 *
 * @public
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
declare const DEFAULT_CONFIG: Config;
export { DEFAULT_CONFIG, DEFAULT_ROLE };
//# sourceMappingURL=config.default.d.ts.map