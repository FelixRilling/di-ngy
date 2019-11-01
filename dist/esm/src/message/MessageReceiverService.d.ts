import { Message } from "discord.js";
import { Dingy } from "../Dingy";
import { AnyObject } from "lightdash/dist/esm/src/obj/lib/AnyObject";
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
    constructor(dingy: Dingy, commands: AnyObject);
    private static matchesPrefix;
    private static getContentWithoutPrefix;
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
//# sourceMappingURL=MessageReceiverService.d.ts.map