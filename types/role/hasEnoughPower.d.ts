import { Message } from "discord.js";
import { IRole } from "./IRole";
/**
 * Helper function checking role access.
 *
 * @private
 */
declare const hasEnoughPower: (msg: Message, powerRequired: number, roles: IRole[]) => boolean;
export { hasEnoughPower };
