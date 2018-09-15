import { Attachment } from "discord.js";

export interface ICommandResult {
    val: string;
    code: boolean | string;
    attachment: Array<string | Blob | Attachment>;
}
