import { resolvedArgumentMap } from "cli-ngy/types/argument/resolvedArgumentMap";
import { Message } from "discord.js";
import { Dingy } from "../Dingy";
import { ICommandResult } from "./result/ICommandResult";
import { sendable } from "./result/sendable";

type commandFn = (
    args: resolvedArgumentMap,
    msg: Message,
    instance: Dingy
) => sendable<string> | sendable<ICommandResult>;

export { commandFn };
