import { echo } from "./default/echo";
import { help } from "./default/help";
import { stop } from "./default/stop";
import { IDingyCommandObject } from "./IDingyCommandObject";

const commandsDefault: IDingyCommandObject = {
    echo,
    stop,
    help
};

export { commandsDefault };
