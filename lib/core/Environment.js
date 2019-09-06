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
                console.log("Making new key " + loc);
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
        // 
        let cur = this;
        // TODO: is this cleaner as a reduce? 
        _.forEach(target, (loc) => {
            if(!(loc in cur.defs)){
                throw Error(loc + " Doesn't exist");
            }
            cur = cur.defs[loc];
        });
    // TODO: this is the wrong place to do this. Time to get automagic with types
        if(cur.length == 1){
            return cur[0];
        }
        return cur;
    }

    // TODO: Re-read the chapter on environments. This is definitely not groovy
    export(){
        let output =  _.map(this.defs, (value, key)=>{
            let out = key+":";
            if(value instanceof Environment){
                out += "\n" + value.export();
            } else {
                out += _.flatMap(value, (v)=>{
                    return v.value ? (v.value.export? v.value.export() : v.value) : v.toString();}).join(" ");
            }
            return out;
        }).join("\n");
        return output;
    }
}