interface IDingyStrings {
    currentlyPlaying: string;

    separator: string;

    infoSimilar: string;
    infoEmpty: string;
    infoTooLong: string;
    infoInternal: string;

    errorUnknownCommand: string;
    errorMissingArgs: string;
    errorPermission: string;
    errorTooLong: string;
    errorInternal: string;
}

const stringsDefault: IDingyStrings = {
    currentlyPlaying: "with bots",

    separator: "-".repeat(3),

    infoSimilar: "Did you mean",
    infoEmpty: "Empty message",
    infoTooLong: "The output was too long to print",
    infoInternal: "Internal error",

    errorUnknownCommand: "Unknown command",
    errorMissingArgs: "Missing argument",
    errorPermission: "You don't have permissions to access this command",
    errorTooLong: "The output was too long to print or to send as a file",
    errorInternal: "Internal error"
};

export { stringsDefault, IDingyStrings };
