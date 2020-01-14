import { Expression, Locator, EnvLocation } from './Expressions';
import * as _ from "lodash";


// What goes into an environment? 
// How do i do lazy evaulation

export class Environment {

// Really don't think this should be all 3 types 
    defs: Record<string, Environment | Expression | Expression[]>;
    id: string;
    constructor(id: string) {
        this.defs = {};
        this.id = id;
    }

    applyDefinition(location: EnvLocation, value: Expression | Environment | Expression []) {
        // TODO: split some of this into a "findTarget" function
        let target = Locator.normalizeLocation(location);
        if (target.length == 0) {
            throw new Error("No target passed in!");
        }

        let cur: Environment = this;
        _.forEach(target.slice(0, -1), (loc) => {
            if (!(loc in cur.defs)) {
                cur.defs[loc] = new Environment(loc);   // theres a lot of things this node could be
            }
            if (cur.defs[loc] instanceof Environment) {
                cur = <Environment>(cur.defs[loc]);
            } else {
                throw new Error("Could not locate " + target + " Failed at " + loc);
            }
        });

        let ass = target[target.length-1];
        cur.defs[ass] = value;
    }

    // TODO: Should get always go to the root? I think that's what Interpeter is expecting
    // What is my tree traversal model?
    get(location:EnvLocation) {
        let target = Locator.normalizeLocation(location);
        if(target.length == 0){
            throw new Error("No target passed in!");
        }

        let cur: Environment = this;
        _.forEach(target.slice(0, -1), (loc) => {
            if (!(loc in cur.defs)) {
                throw new Error("Could not locate " + target + " Failed at " + loc);
            }
            if (cur.defs[loc] instanceof Environment) {
                cur = <Environment>(cur.defs[loc]);
            } else {
                throw new Error("Trying to locate object " + target + ", but found " + cur.defs[loc] + " at " + loc);
            }
        });
        let ass = target[target.length - 1];
        return cur.defs[ass];
    }

    // TODO: Re-read the chapter on environments. This is definitely not groovy
    export(): string {
        let output = _.map(this.defs, (value, key) => {
            let out = key + ":";
            out += findString(value);
            return out;
        }).join("\n");
        return output;
    }
}

function findString(o: Expression | Environment | Expression[] ) :string {
    if (o instanceof Environment) {
        return "\n" + o.export();
    } else if (o instanceof Array) {
        return _.flatMap(o, findString).join(" ");
    } else {
        return "TOSTRING" + o.toString();
    }
};