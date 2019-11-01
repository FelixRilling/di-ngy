import { InjectableType } from "chevronjs";
import { isNil, isPromise, isString } from "lightdash";
import { dingyChevron, DingyDiKeys } from "../di";
import { dingyLogby } from "../logger";
/**
 * Handles sending messages.
 *
 * @private
 */
class MessageSenderService {
    constructor(dingy) {
        this.dingy = dingy;
    }
    /**
     * Sends a result as response.
     *
     * @param msg Message to respond to.
     * @param value Value to send.
     */
    sendResult(msg, value) {
        if (isPromise(value)) {
            MessageSenderService.logger.debug("Value is a promise, waiting.");
            value
                .then(valueResolved => this.send(msg, valueResolved))
                .catch(err => MessageSenderService.logger.error("Error while waiting for resolve: ", err));
        }
        else {
            this.send(msg, value);
        }
    }
    send(msg, value) {
        MessageSenderService.logger.trace("Preparing sending of message.", {
            value
        });
        const isPlainValue = isString(value);
        const options = {
            code: isPlainValue ? false : value.code,
            files: isPlainValue ? [] : value.files
        };
        const content = this.determineContent(value, isPlainValue);
        MessageSenderService.logger.debug("Sending message.", {
            content,
            options
        });
        msg.channel
            .send(content, options)
            .then(sentMsg => {
            if (!isPlainValue && !isNil(value.onSend)) {
                value.onSend(sentMsg);
            }
            MessageSenderService.logger.debug("Sent message.", {
                content,
                options
            });
        })
            .catch(err => MessageSenderService.logger.error("Could not send message.", err));
    }
    determineContent(value, isPlainValue) {
        const content = isPlainValue
            ? value
            : value.val;
        if (content.length > MessageSenderService.MAX_LENGTH) {
            MessageSenderService.logger.warn("Message is too long to send:", content);
            return this.dingy.config.strings.response.tooLong;
        }
        if (content.length === 0) {
            MessageSenderService.logger.warn("Message is empty.");
            return this.dingy.config.strings.response.empty;
        }
        return content;
    }
}
MessageSenderService.logger = dingyLogby.getLogger(MessageSenderService);
MessageSenderService.MAX_LENGTH = 2000;
dingyChevron.set(InjectableType.FACTORY, [DingyDiKeys.CLASS], MessageSenderService);
export { MessageSenderService };
//# sourceMappingURL=MessageSenderService.js.map