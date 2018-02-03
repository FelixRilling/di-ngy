import {
    IDingyCommandResolved,
    IDingyMessageResultEvents,
    IDingyMessageResultExpanded
} from "../../interfaces";
import { isString, objDefaultsDeep } from "lightdash";

const eventsDefault: IDingyMessageResultEvents = {
    onSend: () => { }
};

const dataDefaults: IDingyMessageResultExpanded = [
    "",
    false,
    [],
    eventsDefault
];

const dataFromValue = (
    val: string | IDingyMessageResultExpanded
): IDingyMessageResultExpanded =>
    <IDingyMessageResultExpanded>objDefaultsDeep(
        isString(val) ? [<string>val] : <IDingyMessageResultExpanded>val,
        dataDefaults
    );

const normalizeMessage = (
    data: false | IDingyCommandResolved
): IDingyCommandResolved => {
    if (data === false) {
        return {
            success: true,
            ignore: true,
            result: dataDefaults
        };
    }

    data.ignore = false;
    data.result = dataFromValue(<
        | string
        | IDingyMessageResultExpanded>data.result);

    return data;
};

export { normalizeMessage, dataFromValue, eventsDefault, dataDefaults };
