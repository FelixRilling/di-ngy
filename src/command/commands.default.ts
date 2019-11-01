import { echo } from "./core/echo";
import { help } from "./core/help";
import { stop } from "./core/stop";
import { DingyCommandObject } from "./DingyCommandObject";

/**
 * Default commands.
 *
 * @private
 */
const DEFAULT_COMMANDS: DingyCommandObject = {
    echo,
    stop,
    help
};

export { DEFAULT_COMMANDS };
