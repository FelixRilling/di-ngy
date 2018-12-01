import { Message } from "discord.js";
import { Dingy } from "../Dingy";
import { IAnyObject } from "lightdash/types/obj/lib/IAnyObject";
/**
 * Handles resolving messages and sending the response.
 *
 * @private
 */
declare class MessageController {
    private static readonly logger;
    private static readonly MAX_LENGTH;
    private readonly dingy;
    private readonly clingy;
    /**
     * Creates a new MessageController
     *
     * @param dingy Dingy instance this controller belongs to.
     * @param commands Command object.
     */
    constructor(dingy: Dingy, commands?: IAnyObject);
    /**
     * Handle an incoming message.
     *
     * @param msg Discord message to process.
     */
    handleMessage(msg: Message): void;
    private handleLookupNotFound;
    private handleLookupMissingArg;
    private handleLookupSuccess;
    private sendResult;
    private send;
}
export { MessageController };
