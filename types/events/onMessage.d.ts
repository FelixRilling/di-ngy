import { Message } from "discord.js";
import { IDingy } from "../interfaces";
declare const onMessage: (msg: Message, app: IDingy) => void;
export { onMessage };
