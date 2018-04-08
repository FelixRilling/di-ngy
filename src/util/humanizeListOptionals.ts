/**
 * Turns an array into a humanized string of optionals
 *
 * @private
 * @param {Array<string>} arr
 * @returns {string}
 */
const humanizeListOptionals = (arr: string[]): string =>
    arr
        .map((item, index, data) => {
            if (index === 0) {
                return `'${item}'`;
            } else if (index < data.length - 1) {
                return `, '${item}'`;
            }

            return ` or '${item}'`;
        })
        .join("");

export default humanizeListOptionals;
