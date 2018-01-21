import { IDingyCommandResolved, IDingyMessageResultEvents, IDingyMessageResultExpanded } from "../../../interfaces";
declare const eventsDefault: IDingyMessageResultEvents;
declare const dataDefaults: IDingyMessageResultExpanded;
declare const dataFromValue: (val: string | IDingyMessageResultExpanded) => IDingyMessageResultExpanded;
declare const normalizeMessage: (data: false | IDingyCommandResolved) => IDingyCommandResolved;
export { normalizeMessage, dataFromValue, eventsDefault, dataDefaults };
