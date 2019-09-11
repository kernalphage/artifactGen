import {I_Interpreter} from "./I_Interpreter.js";
import {tk } from "./Token.js";
import { randomRangeInt } from './kp.js';
import {_} from "lodash";
import {Environment} from "./Environment.js";
import { kMaxLength } from "buffer";

export class BasicInterpreter extends I_Interpreter {
    execute(expressions){
        super.execute(expressions);
        this.treeShake();
        return this.definitions;
    }
    push_reference(loc){
        let ref = {loc: loc, value: null, tries: 0, toString:()=>{return "ASDF" + this.value;}};
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
                let chosenAssignment = _.sample(expr.values);
                let out = _.zip(expr.targets, chosenAssignment.statements).map((assignment) => {
                    let [target, statements] = assignment;
                    target = target && this.visit(target);
                    console.log("target is " + JSON.stringify(target));
                    statements = statements && this.visitMany(statements);
                    let result = _.sample(statements);
                    console.log(JSON.stringify(result));
                    console.log("statement is " + result);
                    ctx.applyDefinition(target, result);
                });
                return out;
            },
            Base: (expr)=>{                
                return this.visitMany(expr.values);
            },
            Definition:  (expr)=>{
                let name = expr.id.string;
                let def = new Environment(name);
                this.push_context(def);
                this.visitMany(expr.assignments);
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
                if(expr.values.length == 1){
                    return expr.values[0].value;
                } else {
                    // TODO: Support floats
                    return randomRangeInt(... _.map(expr.values, 'value'));
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
                    return this.push_reference(rval); 
                }
            },
            // sideEffect
            Statement: (expr)=>{
                return this.visitMany(expr.statements);
            },
            ExFunction: (expr)=>{
                let loc = this.visit(expr.locator);
                let params = this.visitMany(expr.parameters);
                return loc + "(" + params.join(", ") + ")";
            }
        };
    }
}