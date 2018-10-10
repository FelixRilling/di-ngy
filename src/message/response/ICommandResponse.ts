import { Attachment, BufferResolvable, FileOptions } from "discord.js";

export interface ICommandResponse {
    val: string;
    code: boolean | string;
    files: (FileOptions | BufferResolvable | Attachment)[];
}
