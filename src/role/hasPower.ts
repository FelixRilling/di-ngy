import { Message } from "discord.js";
import { IRole } from "./IRole";

const hasPower = (
    roles: IRole[],
    msg: Message,
    powerRequired: number
): boolean => {
    for (const role of roles) {
        if (role.power >= powerRequired && role.check(msg)) {
            return true;
        }
    }

    return false;
};

export { hasPower };
