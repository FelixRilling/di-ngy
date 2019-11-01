import { Message } from "discord.js";
import { Role } from "./Role";
/**
 * Helper function checking role access.
 *
 * @private
 */
declare const hasEnoughPower: (msg: Message, powerRequired: number, roles: Role[]) => boolean;
export { hasEnoughPower };
//# sourceMappingURL=hasEnoughPower.d.ts.map