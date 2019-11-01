import { Attachment, BufferResolvable, FileOptions, Message } from "discord.js";
interface CommandResponse {
    val: string;
    code?: boolean | string;
    files?: Array<FileOptions | BufferResolvable | Attachment>;
    onSend?: (msg: Message | Message[]) => void;
}
export { CommandResponse };
//# sourceMappingURL=CommandResponse.d.ts.map