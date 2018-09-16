import { IRole } from "./IRole";
import { Message } from "discord.js";
declare const hasPower: (roles: IRole[], msg: Message, powerRequired: number) => boolean;
export { hasPower };
