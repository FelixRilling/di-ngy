import { MessageAttachment } from "discord.js";
/**
 * Loads an attachment and returns contents
 *
 * @private
 * @param {MessageAttachment} attachment
 * @returns {Promise}
 */
declare const loadAttachment: (attachment: MessageAttachment) => Promise<string>;
export { loadAttachment };
