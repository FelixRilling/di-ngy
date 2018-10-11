import { resolvedArgumentMap } from "cli-ngy/types/argument/resolvedArgumentMap";
import { Message } from "discord.js";
import { Dingy } from "../Dingy";
import { ICommandResponse } from "../message/response/ICommandResponse";
import { sendable } from "../message/response/sendable";
import { Clingy } from "cli-ngy";

type commandFn = (
    args: resolvedArgumentMap,
    argsAll: string[],
    msg: Message,
    dingy: Dingy,
    clingy: Clingy
) => sendable<string | ICommandResponse> | null;

export { commandFn };
