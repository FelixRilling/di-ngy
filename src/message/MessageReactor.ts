import { Clingy } from "cli-ngy";
import { ILookupErrorMissingArgs } from "cli-ngy/types/lookup/result/ILookupErrorMissingArgs";
import { ILookupErrorNotFound } from "cli-ngy/types/lookup/result/ILookupErrorNotFound";
import { ResultType } from "cli-ngy/types/lookup/result/ILookupResult";
import { ILookupSuccess } from "cli-ngy/types/lookup/result/ILookupSuccess";
import { DMChannel, Message, MessageOptions } from "discord.js";
import { isInstanceOf, isPromise, isString, objDefaultsDeep } from "lightdash";
import { ITypedObject } from "lightdash/types/obj/lib/ITypedObject";
import { ILogger } from "logby";
import { commandsDefault } from "../commands/commands.default";
import { IDingyCommand } from "../commands/IDingyCommand";
import { Dingy } from "../Dingy";
import { dingyLogby } from "../logger";
import { hasEnoughPower } from "../role/hasEnoughPower";
import { createSlimMessage } from "./createSlimMessage";
import { ICommandResponse } from "./response/ICommandResponse";
import { sendable } from "./response/sendable";

class MessageReactor {
    private static readonly logger: ILogger = dingyLogby.getLogger(
        MessageReactor
    );

    private static readonly MAX_LENGTH = 2000;

    private readonly dingy: Dingy;
    private readonly clingy: Clingy;

    constructor(dingy: Dingy, commands: ITypedObject<any> = {}) {
        this.clingy = new Clingy(
            dingy.config.enableDefaultCommands
                ? objDefaultsDeep(commands, commandsDefault)
                : commands
        );
        MessageReactor.logger.debug("Creating Clingy.");
        this.dingy = dingy;
        MessageReactor.logger.debug("Created MessageReactor.");
    }

    public handleMessage(msg: Message): void {
        MessageReactor.logger.debug("Parsing content.", createSlimMessage(msg));
        const msgContent = msg.content.substr(this.dingy.config.prefix.length);
        const lookupResult = this.clingy.parse(msgContent);
        MessageReactor.logger.debug("Parsed content.", lookupResult);

        if (lookupResult.type === ResultType.ERROR_NOT_FOUND) {
            const lookupResultNotFound = <ILookupErrorNotFound>lookupResult;
            MessageReactor.logger.debug(
                `Command not found: ${lookupResultNotFound.missing}.`
            );
            this.handleLookupNotFound(msg, lookupResultNotFound);
        } else if (lookupResult.type === ResultType.ERROR_MISSING_ARGUMENT) {
            const lookupResultMissingArg = <ILookupErrorMissingArgs>(
                lookupResult
            );
            MessageReactor.logger.debug(
                `Argument missing: ${lookupResultMissingArg.missing}.`
            );
            this.handleLookupMissingArg(msg, lookupResultMissingArg);
        } else if (lookupResult.type === ResultType.SUCCESS) {
            const lookupResultSuccess = <ILookupSuccess>lookupResult;
            MessageReactor.logger.info(
                "Lookup successful.",
                lookupResultSuccess
            );
            this.handleLookupSuccess(msg, lookupResultSuccess);
        } else {
            MessageReactor.logger.error(
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
            MessageReactor.logger.debug("Answering to command not found.");
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
            MessageReactor.logger.debug("Answering to missing arg.");
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
            MessageReactor.logger.debug("Not usable in DMs.");
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
            MessageReactor.logger.debug("No permissions.");
            this.sendResult(msg, this.dingy.config.strings.error.noPermission);
            return;
        }

        MessageReactor.logger.debug("Running command:", command);
        const result = command.fn(
            lookupResultSuccess.args,
            msg,
            this.dingy,
            this
        );
        MessageReactor.logger.debug("Command returned:", result);

        if (result == null) {
            MessageReactor.logger.debug("Skipping response.");
            return;
        }

        MessageReactor.logger.debug("Answering to successful command.");
        this.sendResult(msg, result);
    }

    private sendResult(
        msg: Message,
        value: sendable<string | ICommandResponse>
    ): void {
        if (isPromise(value)) {
            MessageReactor.logger.debug("Value is a promise, waiting.");
            value
                .then(valueResolved => this.send(msg, valueResolved))
                .catch(err =>
                    MessageReactor.logger.error(
                        "Error while waiting for resolve: ",
                        err
                    )
                );
        } else {
            this.send(msg, value);
        }
    }

    private send(msg: Message, value: string | ICommandResponse): void {
        MessageReactor.logger.debug("Preparing sending of message.", value);
        const isPlainValue = isString(value);
        const options: MessageOptions = {
            code: isPlainValue ? false : (<ICommandResponse>value).code,
            files: isPlainValue ? [] : (<ICommandResponse>value).files
        };
        let content: string = isPlainValue
            ? <string>value
            : (<ICommandResponse>value).val;

        if (content.length > MessageReactor.MAX_LENGTH) {
            MessageReactor.logger.warn("Message is too long to send:", content);
            content = this.dingy.config.strings.response.tooLong;
        } else if (content.length === 0) {
            MessageReactor.logger.warn("Message is empty.");
            content = this.dingy.config.strings.response.empty;
        }

        MessageReactor.logger.debug("Sending message.", value);
        msg.channel
            .send(content, options)
            .then(() =>
                MessageReactor.logger.debug("Sent message.", content, options)
            )
            .catch(err =>
                MessageReactor.logger.error("Could not send message.", err)
            );
    }
}

export { MessageReactor };
