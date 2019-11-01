import { Message } from "discord.js";
import { Dingy } from "../Dingy";
import { CommandResponse } from "./response/CommandResponse";
import { Sendable } from "./response/Sendable";
/**
 * Handles sending messages.
 *
 * @private
 */
declare class MessageSenderService {
    private static readonly logger;
    private static readonly MAX_LENGTH;
    private readonly dingy;
    constructor(dingy: Dingy);
    /**
     * Sends a result as response.
     *
     * @param msg Message to respond to.
     * @param value Value to send.
     */
    sendResult(msg: Message, value: Sendable<string | CommandResponse>): void;
    private send;
    private determineContent;
}
export { MessageSenderService };
//# sourceMappingURL=MessageSenderService.d.ts.map