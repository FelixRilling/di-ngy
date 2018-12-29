import { echo } from "./core/echo";
import { help } from "./core/help";
import { stop } from "./core/stop";
import { IDingyCommandObject } from "./IDingyCommandObject";

/**
 * Default commands.
 *
 * @private
 */
const DEFAULT_COMMANDS: IDingyCommandObject = {
    echo,
    stop,
    help
};

export { DEFAULT_COMMANDS };
