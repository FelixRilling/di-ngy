import { Message } from "discord.js";
import { IAnyObject } from "lightdash/types/obj/lib/IAnyObject";
import { Dingy } from "../Dingy";
/**
 * Handles resolving messages.
 *
 * @private
 */
declare class MessageReceiverService {
    private static readonly logger;
    private readonly dingy;
    private readonly clingy;
    private readonly messageSenderService;
    /**
     * Creates a new MessageReceiverService
     *
     * @param dingy Dingy instance this service belongs to.
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
}
export { MessageReceiverService };
