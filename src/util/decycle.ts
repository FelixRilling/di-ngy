/**
 * slightly modified
 */
import { isArray, isObjectLike, isNumber, isBoolean, isDate, isString, isRegExp, isMap, objKeys } from "lightdash";
/*
    cycle.js
    2017-02-07

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

// The file uses the WeakMap feature of ES6.

/*jslint es6, eval */

/*property
    $ref, decycle, forEach, get, indexOf, isArray, keys, length, push,
    retrocycle, set, stringify, test
*/

const decycle = (object: any, replacer?: any): any => {
    // Make a deep copy of an object or array, assuring that there is at most
    // one instance of each object or array in the resulting structure. The
    // duplicate references (which might be forming cycles) are replaced with
    // an object of the form

    //      {"$ref": PATH}

    // where the PATH is a JSONPath string that locates the first occurance.

    // So,

    //      let a = [];
    //      a[0] = a;
    //      return JSON.stringify(JSON.decycle(a));

    // produces the string '[{"$ref":"$"}]'.

    // If a replacer function is provided, then it will be called for each value.
    // A replacer function receives a value and returns a replacement value.

    // JSONPath is used to locate the unique object. $ indicates the top level of
    // the object or array. [NUMBER] or [STRING] indicates a child element or
    // property.

    const objects = new WeakMap(); // object to path mappings
    const derez = function derez(value, path) {

        // The derez function recurses through the object, producing the deep copy.

        let old_path; // The path of an earlier occurance of value
        let nu; // The new object or array

        // If a replacer function was provided, then call it to get a replacement value.

        if (replacer !== undefined) {
            value = replacer(value);
        }

        // typeof null === "object", so go on if this value is really an object but not
        // one of the weird builtin objects.

        if (
            isObjectLike(value) &&
            !isBoolean(value) &&
            !isDate(value) &&
            !isNumber(value) &&
            !isRegExp(value) &&
            !isString(value)
        ) {

            // If the value is an object or array, look to see if we have already
            // encountered it. If so, return a {"$ref":PATH} object. This uses an
            // ES6 WeakMap.

            old_path = objects.get(value);

            if (old_path !== undefined) {
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
