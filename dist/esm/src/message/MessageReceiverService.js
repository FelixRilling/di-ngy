import { InjectableType } from "chevronjs";
import { Clingy } from "cli-ngy";
import { DMChannel } from "discord.js";
import { isInstanceOf, isRegExp, objDefaultsDeep } from "lightdash";
import { DEFAULT_COMMANDS } from "../command/commands.default";
import { dingyChevron, DingyDiKeys } from "../di";
import { dingyLogby } from "../logger";
import { hasEnoughPower } from "../role/hasEnoughPower";
import { createSlimMessage } from "./createSlimMessage";
import { MessageSenderService } from "./MessageSenderService";
import { ResultType } from "cli-ngy/dist/esm/src/lookup/result/LookupResult";
/**
 * Handles resolving messages.
 *
 * @private
 */
class MessageReceiverService {
    /**
     * Creates a new MessageReceiverService
     *
     * @param dingy Dingy instance this service belongs to.
     * @param commands Command object.
     */
    constructor(dingy, commands) {
        this.dingy = dingy;
        this.clingy = new Clingy(dingy.config.enableDefaultCommands
            ? objDefaultsDeep(commands, DEFAULT_COMMANDS)
            : commands, this.dingy.config.clingy);
        this.messageSenderService = new MessageSenderService(dingy);
    }
    static matchesPrefix(content, prefix) {
        return isRegExp(prefix)
            ? prefix.test(content)
            : content.startsWith(prefix) && content !== prefix;
    }
    static getContentWithoutPrefix(content, prefix) {
        return isRegExp(prefix)
            ? content.replace(prefix, "")
            : content.substr(prefix.length);
    }
    /**
     * Handle an incoming message.
     *
     * @param msg Discord message to process.
     */
    handleMessage(msg) {
        if (msg.system && msg.author.bot) {
            MessageReceiverService.logger.trace("Message is from the system or a bot, will be skipped.", createSlimMessage(msg));
            return;
        }
        if (!MessageReceiverService.matchesPrefix(msg.content, this.dingy.config.prefix)) {
            MessageReceiverService.logger.trace("Message does not match prefix, will be skipped.", createSlimMessage(msg));
            return;
        }
        const msgContent = MessageReceiverService.getContentWithoutPrefix(msg.content, this.dingy.config.prefix);
        MessageReceiverService.logger.debug("Parsing content.", createSlimMessage(msg));
        const lookupResult = this.clingy.parse(msgContent);
        MessageReceiverService.logger.trace("Parsed content.", lookupResult);
        if (lookupResult.type === ResultType.ERROR_NOT_FOUND) {
            const lookupResultNotFound = lookupResult;
            MessageReceiverService.logger.debug(`Command not found: ${lookupResultNotFound.missing}.`);
            this.handleLookupNotFound(msg, lookupResultNotFound);
        }
        else if (lookupResult.type === ResultType.ERROR_MISSING_ARGUMENT) {
            const lookupResultMissingArg = lookupResult;
            MessageReceiverService.logger.debug(`Argument missing: ${lookupResultMissingArg.missing}.`);
            this.handleLookupMissingArg(msg, lookupResultMissingArg);
        }
        else if (lookupResult.type === ResultType.SUCCESS) {
            const lookupResultSuccess = lookupResult;
            MessageReceiverService.logger.trace("Lookup successful.", lookupResultSuccess);
            this.handleLookupSuccess(msg, lookupResultSuccess);
        }
        else {
            MessageReceiverService.logger.error("Every check failed, this should never happen.", lookupResult);
        }
    }
    handleLookupNotFound(msg, lookupResultNotFound) {
        if (this.dingy.config.answerToMissingCommand) {
            MessageReceiverService.logger.debug("Answering to command not found.");
            this.messageSenderService.sendResult(msg, this.dingy.config.strings.error.notFound +
                lookupResultNotFound.missing);
        }
    }
    handleLookupMissingArg(msg, lookupResultMissingArg) {
        if (this.dingy.config.answerToMissingArgs) {
            MessageReceiverService.logger.debug("Answering to missing arg.");
            this.messageSenderService.sendResult(msg, this.dingy.config.strings.error.missingArgs +
                lookupResultMissingArg.missing
                    .map(arg => arg.name)
                    .join(", "));
        }
    }
    handleLookupSuccess(msg, lookupResultSuccess) {
        const command = lookupResultSuccess.command;
        if (isInstanceOf(msg.channel, DMChannel) && !command.data.usableInDMs) {
            MessageReceiverService.logger.debug("Not usable in DMs.");
            this.messageSenderService.sendResult(msg, this.dingy.config.strings.error.invalidDMCall);
            return;
        }
        if (!hasEnoughPower(msg, command.data.powerRequired, this.dingy.config.roles)) {
            MessageReceiverService.logger.debug("No permissions.");
            this.messageSenderService.sendResult(msg, this.dingy.config.strings.error.noPermission);
            return;
        }
        MessageReceiverService.logger.debug("Running command:", command);
        const result = command.fn(lookupResultSuccess.args, lookupResultSuccess.pathDangling, msg, this.dingy, this.clingy);
        MessageReceiverService.logger.trace("Command returned:", { result });
        if (result == null) {
            MessageReceiverService.logger.trace("Skipping response.");
            return;
        }
        MessageReceiverService.logger.debug("Answering to successful command.", {
            result
        });
        this.messageSenderService.sendResult(msg, result);
    }
}
MessageReceiverService.logger = dingyLogby.getLogger(MessageReceiverService);
dingyChevron.set(InjectableType.FACTORY, [DingyDiKeys.CLASS, DingyDiKeys.COMMANDS], MessageReceiverService);
export { MessageReceiverService };
//# sourceMappingURL=MessageReceiverService.js.map