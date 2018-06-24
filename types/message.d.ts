import { Message } from "discord.js";
import { IDingy, IDingyCommandResolved, IDingyMessageResultEvents, IDingyMessageResultExpanded } from "./interfaces";
declare const eventsDefault: IDingyMessageResultEvents;
declare const dataDefaults: IDingyMessageResultExpanded;
declare const dataFromValue: (val: string | IDingyMessageResultExpanded) => IDingyMessageResultExpanded;
declare const normalizeMessage: (data: false | IDingyCommandResolved) => IDingyCommandResolved;
declare const sendMessage: (app: IDingy, msg: Message, commandResult: IDingyCommandResolved) => void;
export { normalizeMessage, dataFromValue, eventsDefault, dataDefaults, sendMessage };
