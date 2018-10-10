import { resolvedArgumentMap } from "cli-ngy/types/argument/resolvedArgumentMap";
import { Message } from "discord.js";
import { MessageReactor } from "../message/MessageReactor";
import { ICommandResponse } from "../message/response/ICommandResponse";
import { sendable } from "../message/response/sendable";

type commandFn = (
    args: resolvedArgumentMap,
    msg: Message,
    instance: MessageReactor
) => sendable<string | ICommandResponse> | null;

export { commandFn };
