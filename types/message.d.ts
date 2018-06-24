import { Attachment, Message } from "discord.js";
import { IDingyCommandResolved } from "./command";
import { IDingy } from "./dingy";
interface IDingyMessageResultEvents {
    onSend: (msg: Message) => void;
}
interface IDingyMessageResultExpanded {
    0: string;
    1?: boolean | string;
    2?: string[] | Attachment[];
    3?: IDingyMessageResultEvents;
}
declare const eventsDefault: IDingyMessageResultEvents;
declare const dataDefaults: IDingyMessageResultExpanded;
declare const dataFromValue: (val: string | IDingyMessageResultExpanded) => IDingyMessageResultExpanded;
declare const normalizeMessage: (data: false | IDingyCommandResolved) => IDingyCommandResolved;
declare const sendMessage: (app: IDingy, msg: Message, commandResult: IDingyCommandResolved) => void;
export { normalizeMessage, dataFromValue, eventsDefault, dataDefaults, sendMessage, IDingyMessageResultExpanded, IDingyCommandResolved, IDingyMessageResultEvents };
