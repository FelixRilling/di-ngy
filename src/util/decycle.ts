/**
 * slightly modified
 */
import { isArray, isObjectLike, isDate, isRegExp, objKeys, isDefined } from "lightdash";
/*
    cycle.js
    2017-02-07

    Public Domain.
*/

const decycle = (object: any, replacer?: (val: any) => any): any => {
    const objects = new WeakMap();
    const derez = (value, path) => {

        let old_path; // The path of an earlier occurance of value
        let nu; // The new object or array

        // If a replacer function was provided, then call it to get a replacement value.

        if (isDefined(replacer)) {
            value = replacer(value);
        }

        // typeof null === "object", so go on if this value is really an object but not
        // one of the weird builtin objects.

        if (
            isObjectLike(value) &&
            !isDate(value) &&
            !isRegExp(value)
        ) {
            // If the value is an object or array, look to see if we have already
            // encountered it. If so, return a {"$ref":PATH} object. This uses an
            // ES6 WeakMap.

            old_path = objects.get(value);

            if (isDefined(old_path)) {
                return {
                    $ref: old_path
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
                objKeys(value).forEach((name) => {
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
