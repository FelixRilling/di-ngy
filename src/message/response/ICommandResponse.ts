import { Attachment } from "discord.js";

export interface ICommandResponse {
    val: string;
    code: boolean | string;
    attachment: Array<string | Blob | Attachment>;
}
