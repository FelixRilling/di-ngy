import { resolvedArgumentMap } from "cli-ngy/types/argument/resolvedArgumentMap";
import { Message } from "discord.js";
import { Dingy } from "../Dingy";
import { ICommandResponse } from "../message/response/ICommandResponse";
import { sendable } from "../message/response/sendable";
declare type commandFn = (args: resolvedArgumentMap, msg: Message, instance: Dingy) => sendable<string> | sendable<ICommandResponse>;
export { commandFn };
