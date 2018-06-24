import { Message } from "discord.js";
import { IDingy } from "../dingy";

interface IDingyUserEvents {
    onInit: (app: IDingy) => void;
    onConnect: (app: IDingy) => void;
    onMessage: (msg: Message, app: IDingy) => void;
}

const userEventsDefault: IDingyUserEvents = {
    onInit: () => {},
    onConnect: () => {},
    onMessage: () => {}
};

export { userEventsDefault, IDingyUserEvents };
