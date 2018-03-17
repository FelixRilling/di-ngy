import {
    isArray,
    isDate,
    isObjectLike,
    isRegExp,
    isUndefined
} from "lightdash";
/**
 * slightly modified
 */
/*
    cycle.js
    2017-02-07

    Public Domain.
*/
/**
 * @private
 */
const decycle = (object: any, replacer?: (val: any) => any): any => {
    const objects = new WeakMap();
    const derez = (input, path) => {
        let value = input;
        let oldPath; // The path of an earlier occurrence of value
        let nu; // The new object or array

        // If a replacer function was provided, then call it to get a replacement value.

        if (!isUndefined(replacer)) {
            value = (<(val: any) => any>replacer)(value);
        }

        // typeof null === "object", so go on if this value is really an object but not
        // one of the weird builtin objects.

        if (isObjectLike(value) && !isDate(value) && !isRegExp(value)) {
            // If the value is an object or array, look to see if we have already
            // encountered it. If so, return a {"$ref":PATH} object. This uses an
            // ES6 WeakMap.

            oldPath = objects.get(value);

            if (!isUndefined(oldPath)) {
                return {
                    $ref: oldPath
                };
            }

            // Otherwise, accumulate the unique value and its path.

            objects.set(value, path);

            // If it is an array, replicate the array.

            if (isArray(value)) {
                nu = [];
                value.forEach((element, i) => {
                    nu[i] = derez(element, path + "[" + i + "]");
                });
            } else {
                // If it is an object, replicate the object.

                nu = {};
                Object.keys(value).forEach(name => {
                    nu[name] = derez(
                        value[name],
                        path + "[" + JSON.stringify(name) + "]"
                    );
                });
            }

            return nu;
        }

        return value;
    };

    return derez(object, "$");
};

export default decycle;
