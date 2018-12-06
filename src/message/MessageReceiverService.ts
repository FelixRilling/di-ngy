import { Clingy } from "cli-ngy";
import { ILookupErrorMissingArgs } from "cli-ngy/types/lookup/result/ILookupErrorMissingArgs";
import { ILookupErrorNotFound } from "cli-ngy/types/lookup/result/ILookupErrorNotFound";
import { ResultType } from "cli-ngy/types/lookup/result/ILookupResult";
import { ILookupSuccess } from "cli-ngy/types/lookup/result/ILookupSuccess";
import { DMChannel, Message } from "discord.js";
import { isInstanceOf, objDefaultsDeep } from "lightdash";
import { IAnyObject } from "lightdash/types/obj/lib/IAnyObject";
import { ILogger } from "logby";
import { commandsDefault } from "../command/commands.default";
import { IDingyCommand } from "../command/IDingyCommand";
import { Dingy } from "../Dingy";
import { dingyLogby } from "../logger";
import { hasEnoughPower } from "../role/hasEnoughPower";
import { createSlimMessage } from "./createSlimMessage";
import { MessageSenderService } from "./MessageSenderService";

/**
 * Handles resolving messages.
 *
 * @private
 */
class MessageReceiverService {
    private static readonly logger: ILogger = dingyLogby.getLogger(
        MessageReceiverService
    );

    private readonly dingy: Dingy;
    private readonly clingy: Clingy;
    private readonly messageSenderService: MessageSenderService;

    /**
     * Creates a new MessageReceiverService
     *
     * @param dingy Dingy instance this service belongs to.
     * @param commands Command object.
     */
    constructor(dingy: Dingy, commands: IAnyObject = {}) {
        this.dingy = dingy;
        this.clingy = new Clingy(
            dingy.config.enableDefaultCommands
                ? objDefaultsDeep(commands, commandsDefault)
                : commands
        );
        MessageReceiverService.logger.debug("Created Clingy.");
        this.messageSenderService = new MessageSenderService(dingy);
        MessageReceiverService.logger.debug("Created MessageSenderService.");
        MessageReceiverService.logger.debug("Created MessageReceiverService.");
    }

    /**
     * Handle an incoming message.
     *
     * @param msg Discord message to process.
     */
    public handleMessage(msg: Message): void {
        MessageReceiverService.logger.debug(
            "Parsing content.",
            createSlimMessage(msg)
        );
        const msgContent = msg.content.substr(this.dingy.config.prefix.length);
        const lookupResult = this.clingy.parse(msgContent);
        MessageReceiverService.logger.trace("Parsed content.", lookupResult);

        if (lookupResult.type === ResultType.ERROR_NOT_FOUND) {
            const lookupResultNotFound = <ILookupErrorNotFound>lookupResult;
            MessageReceiverService.logger.debug(
                `Command not found: ${lookupResultNotFound.missing}.`
            );
            this.handleLookupNotFound(msg, lookupResultNotFound);
        } else if (lookupResult.type === ResultType.ERROR_MISSING_ARGUMENT) {
            const lookupResultMissingArg = <ILookupErrorMissingArgs>(
                lookupResult
            );
            MessageReceiverService.logger.debug(
                `Argument missing: ${lookupResultMissingArg.missing}.`
            );
            this.handleLookupMissingArg(msg, lookupResultMissingArg);
        } else if (lookupResult.type === ResultType.SUCCESS) {
            const lookupResultSuccess = <ILookupSuccess>lookupResult;
            MessageReceiverService.logger.trace(
                "Lookup successful.",
                lookupResultSuccess
            );
            this.handleLookupSuccess(msg, lookupResultSuccess);
        } else {
            MessageReceiverService.logger.error(
                "Every check failed, this should never happen.",
                lookupResult
            );
        }
    }

    private handleLookupNotFound(
        msg: Message,
        lookupResultNotFound: ILookupErrorNotFound
    ): void {
        if (this.dingy.config.answerToMissingCommand) {
            MessageReceiverService.logger.info(
                "Answering to command not found."
            );
            this.messageSenderService.sendResult(
                msg,
                this.dingy.config.strings.error.notFound +
                lookupResultNotFound.missing
            );
        }
    }

    private handleLookupMissingArg(
        msg: Message,
        lookupResultMissingArg: ILookupErrorMissingArgs
    ): void {
        if (this.dingy.config.answerToMissingArgs) {
            MessageReceiverService.logger.info("Answering to missing arg.");
            this.messageSenderService.sendResult(
                msg,
                this.dingy.config.strings.error.missingArgs +
                lookupResultMissingArg.missing.map(arg => arg.name).join(", ")
            );
        }
    }

    private handleLookupSuccess(
        msg: Message,
        lookupResultSuccess: ILookupSuccess
    ): void {
        const command = <IDingyCommand>lookupResultSuccess.command;

        if (isInstanceOf(msg.channel, DMChannel) && !command.data.usableInDMs) {
            MessageReceiverService.logger.info("Not usable in DMs.");
            this.messageSenderService.sendResult(
                msg,
                this.dingy.config.strings.error.invalidDMCall
            );
            return;
        }

        if (
            !hasEnoughPower(
                msg,
                command.data.powerRequired,
                this.dingy.config.roles
            )
        ) {
            MessageReceiverService.logger.info("No permissions.");
            this.messageSenderService.sendResult(
                msg,
                this.dingy.config.strings.error.noPermission
            );
            return;
        }

        MessageReceiverService.logger.debug("Running command:", command);
        const result = command.fn(
            lookupResultSuccess.args,
            lookupResultSuccess.pathDangling,
            msg,
            this.dingy,
            this.clingy
        );
        MessageReceiverService.logger.trace("Command returned:", { result });

        if (result == null) {
            MessageReceiverService.logger.trace("Skipping response.");
            return;
        }

        MessageReceiverService.logger.info("Answering to successful command.", {
            result
        });
        this.messageSenderService.sendResult(msg, result);
    }
}

export { MessageReceiverService };