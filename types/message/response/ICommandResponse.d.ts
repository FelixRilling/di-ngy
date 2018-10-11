import { Attachment, BufferResolvable, FileOptions } from "discord.js";
interface ICommandResponse {
    val: string;
    code?: boolean | string;
    files?: Array<FileOptions | BufferResolvable | Attachment>;
}
export { ICommandResponse };
