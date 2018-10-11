import { Message } from "discord.js";
import { Dingy } from "../../Dingy";
import { ICommandResponse } from "../../message/response/ICommandResponse";
import { IDingyCommand } from "../IDingyCommand";

const showDetailHelp = (
    msg: Message,
    dingy: Dingy,
    s: string
): ICommandResponse => {
    return { val: "detail", code: "yaml" };
};

const showGeneralHelp = (msg: Message, dingy: Dingy): ICommandResponse => {
    return { val: "general", code: "yaml" };
};

const help: IDingyCommand = {
    alias: ["manual", "?"],
    args: [
        {
            name: "command",
            required: false,
            defaultValue: ""
        }
    ],
    sub: null,
    data: {
        powerRequired: 0,
        hidden: false,
        usableInDMs: true,
        help: "Shows the help page."
    },
    fn: (args, msg, dingy, controller) =>
        args.get("command") !== ""
            ? showDetailHelp(msg, dingy, args.get("command")!)
            : showGeneralHelp(msg, dingy)
};

export { help };
