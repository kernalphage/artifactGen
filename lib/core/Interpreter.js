import {I_Interpreter} from "./I_Interpreter.js";
import FunctionManager from "./FunctionManager";
import {tk } from "./Token.js";
import { randomRangeInt } from './kp.js';
import {_} from "lodash";
import {Environment} from "./Environment.js";
import { kMaxLength } from "buffer";


class ReferenceValue{
    constructor(location, value){
        this.loc = location;
        this.value = value;
        this.tries = 0;
    }
    toString(){
        return "RV" + this.value;
    }
};

export class BasicInterpreter extends I_Interpreter {
    execute(expressions){
        super.execute(expressions);
        this.treeShake();
        return this.definitions;
    }
    push_reference(loc){
        let ref = new ReferenceValue(loc, null);
        // TODO: cache references 
        this.toResolve.push(ref);
        return ref;
    }

    // TODO: Actual dependency resolution
    treeShake(){
        let open = this.toResolve;

        let failsafe = 100;
        while(open.length > 0 && (failsafe-->0)){
            let cur = open.pop();
            let val = this.findRvalue(cur.loc);
            if(val){
                cur.value = val;
                console.log(JSON.stringify(cur));
            } else {
                cur.tries ++;
                open.push(cur);
                // tODO: shuffle before pushing? 
            }
        }
    }

    findRvalue(val){
        try{
            let cur = this.definitions.get(val);
            console.log("Found rvalue " + val + " => " + cur);
            return cur;
        } catch(e) {
            console.log("Error finding rvalue " + e);
            return null;
        }
    }

    export(){
        return this.definitions.export();
    }
    constructor(){
        super();
        this.definitions = new Environment();
        this.toResolve = [];

        this.visitors = {
            Assignment:  (expr, ctx)=>{
                let chosenAssignment = _.sample(expr.choices);
                let out = _.zip(expr.targets, chosenAssignment.statements).map((assignment) => {
                    let [target, statements] = assignment;
                    target = target && this.visit(target);
                    let result = statements && this.visit(statements);
                    ctx.applyDefinition(target, result);
                });
                return out;
            },
            Base: (expr)=>{                
                return this.visit(expr.values);
            },
            Definition:  (expr)=>{
                let name = expr.id.string;
                let def = new Environment(name);
                this.push_context(def);
                this.visit(expr.assignments);
                this.pop_context();
                this.definitions.applyDefinition(name, def);
                return def;
            },
            // function
            Locator:  (expr)=>{
               return _.map(expr.location, 'value');
            },
            LValue:  (expr)=>{
                // TODO: Split on relative vs absolute
                return this.visit(expr.locator);
            },
            Number:  (expr)=>{
                if (expr.numbers.length == 1) {
                    return expr.numbers[0].value;
                } else {
                    // TODO: Support floats
                    return randomRangeInt(..._.map(expr.numbers, 'value'));
                }
            },
            RValue:  (expr, ctx)=>{
                let loc = this.visit(expr.locator);
                try {
                    let rval = null;
                    if(expr.reftype.symbol == tk.HASH ){
                        rval = this.definitions.get(loc);
                    } else {
                        rval = ctx.get(loc);
                    }
                    return rval; 
                } finally{
                    let rval = null;
                    if (expr.reftype.symbol == tk.HASH) {
                        rval = loc;
                    } else {
                        rval = _.concat(ctx.id, loc)
                    }
                    console.log("Pushing reference " + loc);
                    return this.push_reference(rval); 
                }
            },
            // sideEffect
            Statement: (expr)=>{
                return this.visit(expr.statements);
            },
            ExFunction: (expr)=>{
                let loc = this.visit(expr.locator); 
                return FunctionManager.applyFN(loc, this, expr.parameters);
            }
        };
    }
}