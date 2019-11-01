import { Clingy } from "cli-ngy";
import { Message } from "discord.js";
import { Dingy } from "../Dingy";
import { ICommandResponse } from "../message/response/ICommandResponse";
import { sendable } from "../message/response/sendable";
import { ResolvedArgumentMap } from "cli-ngy/dist/esm/src/argument/ResolvedArgumentMap";

type commandFn = (
    args: ResolvedArgumentMap,
    argsAll: string[],
    msg: Message,
    dingy: Dingy,
    clingy: Clingy
) => sendable<string | ICommandResponse> | null;

export { commandFn };
