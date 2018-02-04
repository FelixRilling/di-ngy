import { IDingyUserEvents } from "../interfaces";

const userEventsDefault: IDingyUserEvents = {
    onInit: () => {},
    onConnect: () => {},
    onMessage: () => {}
};

export default userEventsDefault;
