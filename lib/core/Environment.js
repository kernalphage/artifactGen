import {_} from "lodash";
export class Environment{
    constructor(id){
        this.defs = {};
        this.id = id;
    }
    applyDefinition(target, value) {
        // TODO: split some of this into a "findTarget" function
        if(!(target instanceof Array)){
            target = target.split(".");
        }
        let cur = this;
        _.forEach(target.slice(0,-1), (loc) => {
            if(!(loc in cur.defs)){
                cur.defs[loc] = new Environment();   // theres a lot of things this node could be
            }
            cur = cur.defs[loc];
        });
        let ass = _.last(target);
        cur.defs[ass] = value;
    }
    get(target) {
        if(!(target instanceof Array)){
            target = target.split(".");
        }

        let res = _.reduce(target, (cur, loc)=>{
            if(cur instanceof Environment) {
                return cur.defs[loc];
            } else if(cur.value) {
                return cur.value.defs[loc];
            }
        }, this) || [];
    // TODO: this is the wrong place to do this. Time to get automagic with types
        if(res.length == 1){
            return res[0];
        }
        return res;
    }

    // TODO: Re-read the chapter on environments. This is definitely not groovy
    export(){
        let output =  _.map(this.defs, (value, key)=>{
            let out = key+":";
            out+=findString(value);
            return out;
        }).join("\n");
        return output;
    }
}

function findString(o){
    if(o instanceof Environment){
        return "\n" + o.export();
    } else if (o instanceof Array){
        return _.flatMap(o, findString).join(" ");
    } else if(o.value){
        return findString(o.value);
    } else {
        return "TOSTRING" + o.toString();
    }
};