import { echo } from "./default/echo";
import { stop } from "./default/stop";
import { IDingyCommandObject } from "./IDingyCommandObject";
import { help } from "./default/help";

const commandsDefault: IDingyCommandObject = {
    echo,
    stop,
    help
};

export { commandsDefault };
