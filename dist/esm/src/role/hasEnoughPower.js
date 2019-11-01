/**
 * Helper function checking role access.
 *
 * @private
 */
const hasEnoughPower = (msg, powerRequired, roles) => {
    for (const role of roles) {
        if (role.power >= powerRequired && role.check(msg)) {
            return true;
        }
    }
    return false;
};
export { hasEnoughPower };
//# sourceMappingURL=hasEnoughPower.js.map