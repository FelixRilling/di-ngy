import { echo } from "./core/echo";
import { help } from "./core/help";
import { stop } from "./core/stop";
import { IDingyCommandObject } from "./IDingyCommandObject";

const commandsDefault: IDingyCommandObject = {
    echo,
    stop,
    help
};

export { commandsDefault };
