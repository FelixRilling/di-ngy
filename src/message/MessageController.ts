import { Clingy } from "cli-ngy";
import { ILookupErrorMissingArgs } from "cli-ngy/types/lookup/result/ILookupErrorMissingArgs";
import { ILookupErrorNotFound } from "cli-ngy/types/lookup/result/ILookupErrorNotFound";
import { ResultType } from "cli-ngy/types/lookup/result/ILookupResult";
import { ILookupSuccess } from "cli-ngy/types/lookup/result/ILookupSuccess";
import { DMChannel, Message, MessageOptions } from "discord.js";
import { isInstanceOf, isPromise, isString, objDefaultsDeep } from "lightdash";
import { ILogger } from "logby";
import { commandsDefault } from "../commands/commands.default";
import { IDingyCommand } from "../commands/IDingyCommand";
import { Dingy } from "../Dingy";
import { dingyLogby } from "../logger";
import { hasEnoughPower } from "../role/hasEnoughPower";
import { createSlimMessage } from "./createSlimMessage";
import { ICommandResponse } from "./response/ICommandResponse";
import { sendable } from "./response/sendable";
import { IAnyObject } from "lightdash/types/obj/lib/IAnyObject";

/**
 * Handles resolving messages and sending the response.
 *
 * @private
 */
class MessageController {
    private static readonly logger: ILogger = dingyLogby.getLogger(
        MessageController
    );

    private static readonly MAX_LENGTH = 2000;

    private readonly dingy: Dingy;
    private readonly clingy: Clingy;

    /**
     * Creates a new MessageController
     *
     * @param dingy Dingy instance this controller belongs to.
     * @param commands Command object.
     */
    constructor(dingy: Dingy, commands: IAnyObject = {}) {
        this.clingy = new Clingy(
            dingy.config.enableDefaultCommands
                ? objDefaultsDeep(commands, commandsDefault)
                : commands
        );
        MessageController.logger.debug("Creating Clingy.");
        this.dingy = dingy;
        MessageController.logger.debug("Created MessageController.");
    }

    /**
     * Handle an incoming message.
     *
     * @param msg Discord message to process.
     */
    public handleMessage(msg: Message): void {
        MessageController.logger.debug(
            "Parsing content.",
            createSlimMessage(msg)
        );
        const msgContent = msg.content.substr(this.dingy.config.prefix.length);
        const lookupResult = this.clingy.parse(msgContent);
        MessageController.logger.trace("Parsed content.", lookupResult);

        if (lookupResult.type === ResultType.ERROR_NOT_FOUND) {
            const lookupResultNotFound = <ILookupErrorNotFound>lookupResult;
            MessageController.logger.debug(
                `Command not found: ${lookupResultNotFound.missing}.`
            );
            this.handleLookupNotFound(msg, lookupResultNotFound);
        } else if (lookupResult.type === ResultType.ERROR_MISSING_ARGUMENT) {
            const lookupResultMissingArg = <ILookupErrorMissingArgs>(
                lookupResult
            );
            MessageController.logger.debug(
                `Argument missing: ${lookupResultMissingArg.missing}.`
            );
            this.handleLookupMissingArg(msg, lookupResultMissingArg);
        } else if (lookupResult.type === ResultType.SUCCESS) {
            const lookupResultSuccess = <ILookupSuccess>lookupResult;
            MessageController.logger.trace(
                "Lookup successful.",
                lookupResultSuccess
            );
            this.handleLookupSuccess(msg, lookupResultSuccess);
        } else {
            MessageController.logger.error(
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
            MessageController.logger.info("Answering to command not found.");
            this.sendResult(
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
            MessageController.logger.info("Answering to missing arg.");
            this.sendResult(
                msg,
                this.dingy.config.strings.error.missingArgs +
                    lookupResultMissingArg.missing.map(arg => arg.name)
            );
        }
    }

    private handleLookupSuccess(
        msg: Message,
        lookupResultSuccess: ILookupSuccess
    ): void {
        const command = <IDingyCommand>lookupResultSuccess.command;

        if (isInstanceOf(msg.channel, DMChannel) && !command.data.usableInDMs) {
            MessageController.logger.info("Not usable in DMs.");
            this.sendResult(msg, this.dingy.config.strings.error.invalidDMCall);
            return;
        }

        if (
            !hasEnoughPower(
                msg,
                command.data.powerRequired,
                this.dingy.config.roles
            )
        ) {
            MessageController.logger.info("No permissions.");
            this.sendResult(msg, this.dingy.config.strings.error.noPermission);
            return;
        }

        MessageController.logger.debug("Running command:", command);
        const result = command.fn(
            lookupResultSuccess.args,
            lookupResultSuccess.pathDangling,
            msg,
            this.dingy,
            this.clingy
        );
        MessageController.logger.trace("Command returned:", { result });

        if (result == null) {
            MessageController.logger.trace("Skipping response.");
            return;
        }

        MessageController.logger.info("Answering to successful command.", {
            result
        });
        this.sendResult(msg, result);
    }

    private sendResult(
        msg: Message,
        value: sendable<string | ICommandResponse>
    ): void {
        if (isPromise(value)) {
            MessageController.logger.debug("Value is a promise, waiting.");
            value
                .then(valueResolved => this.send(msg, valueResolved))
                .catch(err =>
                    MessageController.logger.error(
                        "Error while waiting for resolve: ",
                        err
                    )
                );
        } else {
            this.send(msg, value);
        }
    }

    private send(msg: Message, value: string | ICommandResponse): void {
        MessageController.logger.trace("Preparing sending of message.", {
            value
        });
        const isPlainValue = isString(value);
        const options: MessageOptions = {
            code: isPlainValue ? false : (<ICommandResponse>value).code,
            files: isPlainValue ? [] : (<ICommandResponse>value).files
        };
        let content: string = isPlainValue
            ? <string>value
            : (<ICommandResponse>value).val;

        if (content.length > MessageController.MAX_LENGTH) {
            MessageController.logger.warn(
                "Message is too long to send:",
                content
            );
            content = this.dingy.config.strings.response.tooLong;
        } else if (content.length === 0) {
            MessageController.logger.warn("Message is empty.");
            content = this.dingy.config.strings.response.empty;
        }

        MessageController.logger.debug("Sending message.", {
            content,
            options
        });
        msg.channel
            .send(content, options)
            .then(() =>
                MessageController.logger.debug("Sent message.", {
                    content,
                    options
                })
            )
            .catch(err =>
                MessageController.logger.error("Could not send message.", err)
            );
    }
}

export { MessageController };
