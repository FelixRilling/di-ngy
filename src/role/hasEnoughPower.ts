import { Message } from "discord.js";
import { Role } from "./Role";

/**
 * Helper function checking role access.
 *
 * @private
 */
const hasEnoughPower = (
    msg: Message,
    powerRequired: number,
    roles: Role[]
): boolean => {
    for (const role of roles) {
        if (role.power >= powerRequired && role.check(msg)) {
            return true;
        }
    }

    return false;
};

export { hasEnoughPower };
