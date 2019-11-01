import { Attachment, BufferResolvable, FileOptions, Message } from "discord.js";
interface ICommandResponse {
    val: string;
    code?: boolean | string;
    files?: Array<FileOptions | BufferResolvable | Attachment>;
    onSend?: (msg: Message | Message[]) => void;
}
export { ICommandResponse };
//# sourceMappingURL=ICommandResponse.d.ts.map