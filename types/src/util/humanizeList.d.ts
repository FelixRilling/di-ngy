/**
 * Turns an array into a humanized string
 *
 * @private
 * @param {Array<string>} arr
 * @returns {string}
 */
declare const humanizeList: (arr: string[]) => string;
/**
 * Turns an array into a humanized string of optionals
 *
 * @private
 * @param {Array<string>} arr
 * @returns {string}
 */
declare const humanizeListOptionals: (arr: string[]) => string;
export { humanizeList, humanizeListOptionals };
