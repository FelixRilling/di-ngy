import { Chevron } from "chevronjs";

/**
 * Dingy chevron instance.
 *
 * @public
 */
const dingyChevron = new Chevron();

enum DingyDiKeys {
    CLASS = "_DINGY",
    COMMANDS = "_DINGY_COMMANDS"
}

export { dingyChevron, DingyDiKeys };
