"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Expressions_1 = require("./Expressions");
const _ = require("lodash");
class Environment {
    constructor(id) {
        this.defs = {};
        this.id = id;
    }
    applyDefinition(location, value) {
        let target = Expressions_1.Locator.normalizeLocation(location);
        if (target.length == 0) {
            throw new Error("No target passed in!");
        }
        let cur = this;
        _.forEach(target.slice(0, -1), (loc) => {
            if (!(loc in cur.defs)) {
                cur.defs[loc] = new Environment(loc);
            }
            if (cur.defs[loc] instanceof Environment) {
                cur = (cur.defs[loc]);
            }
            else {
                throw new Error("Could not locate " + target + " Failed at " + loc);
            }
        });
        let ass = target[target.length - 1];
        cur.defs[ass] = value;
    }
    get(location) {
        let target = Expressions_1.Locator.normalizeLocation(location);
        if (target.length == 0) {
            throw new Error("No target passed in!");
        }
        let cur = this;
        _.forEach(target.slice(0, -1), (loc) => {
            if (!(loc in cur.defs)) {
                throw new Error("Could not locate " + target + " Failed at " + loc);
            }
            if (cur.defs[loc] instanceof Environment) {
                cur = (cur.defs[loc]);
            }
            else {
                throw new Error("Trying to locate object " + target + ", but found " + cur.defs[loc] + " at " + loc);
            }
        });
        let ass = target[target.length - 1];
        return cur.defs[ass];
    }
    export() {
        let output = _.map(this.defs, (value, key) => {
            let out = key + ":";
            out += findString(value);
            return out;
        }).join("\n");
        return output;
    }
}
exports.Environment = Environment;
function findString(o) {
    if (o instanceof Environment) {
        return "\n" + o.export();
    }
    else if (o instanceof Array) {
        return _.flatMap(o, findString).join(" ");
    }
    else {
        return "TOSTRING" + o.toString();
    }
}
;
