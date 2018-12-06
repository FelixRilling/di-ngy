import { Message } from "discord.js";
import { IRole } from "./IRole";

/**
 * @private
 */
const hasEnoughPower = (
    msg: Message,
    powerRequired: number,
    roles: IRole[]
): boolean => {
    for (const role of roles) {
        if (role.power >= powerRequired && role.check(msg)) {
            return true;
        }
    }

    return false;
};

export { hasEnoughPower };