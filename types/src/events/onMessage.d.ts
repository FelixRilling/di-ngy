import { Message } from "discord.js";
import { IDingy } from "../dingy";
declare const onMessage: (msg: Message, app: IDingy) => void;
export { onMessage };
