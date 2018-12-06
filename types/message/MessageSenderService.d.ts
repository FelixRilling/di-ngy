import { Message } from "discord.js";
import { Dingy } from "../Dingy";
import { ICommandResponse } from "./response/ICommandResponse";
import { sendable } from "./response/sendable";
/**
 * Handles sending messages.
 *
 * @private
 */
declare class MessageSenderService {
    private static readonly logger;
    private readonly dingy;
    constructor(dingy: Dingy);
    /**
     * Sends a result as response.
     *
     * @param msg Message to respond to.
     * @param value Value to send.
     */
    sendResult(msg: Message, value: sendable<string | ICommandResponse>): void;
    private send;
    private determineContent;
}
export { MessageSenderService };
