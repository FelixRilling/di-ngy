import { Clingy } from "cli-ngy";
import { Message } from "discord.js";
import { Dingy } from "../Dingy";
import { CommandResponse } from "../message/response/CommandResponse";
import { Sendable } from "../message/response/Sendable";
import { ResolvedArgumentMap } from "cli-ngy/dist/esm/src/argument/ResolvedArgumentMap";
declare type CommandFn = (args: ResolvedArgumentMap, argsAll: string[], msg: Message, dingy: Dingy, clingy: Clingy) => Sendable<string | CommandResponse> | null;
export { CommandFn };
//# sourceMappingURL=CommandFn.d.ts.map