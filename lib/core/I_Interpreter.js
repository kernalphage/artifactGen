
import { FindFromSymbol } from './kp.js';
import {Token} from './Token.js';
import {_} from "lodash";
import {pr} from "./Parser.js";

export class I_Interpreter {
    constructor(){
        this.contexts = [];
    }
    push_context(env) {
        this.contexts.push(env);
    }
    peek_context() {
        return _.last(this.contexts);
    }
    pop_context() {
        return this.contexts.pop();
    }
    execute(definitions){
        return this.visit(definitions);
    }

    visit(expr){
        
        if (expr instanceof Array) {
            var ret = [];
            // re-calculating the context every time means visit can change contexts mid-run, which actually might be what I want? I'm not sure, it's an uninformed choice but I damn well am gonna make it. 
            for (var i = 0; i < expr.length; i++) {
                ret.push(this.visit(expr[i], this.peek_context()));
            }
            return ret;
        
        }
        
        if(expr instanceof Token){
            return expr.value;
        }
        
        let key = FindFromSymbol(pr, expr.Type);
        let fn = this.visitors[key];
        if(fn){
            // TODO: I could pass in recursion depth, entire tree state, lots of fun stuff
            return fn.apply(this, [expr, this.peek_context()]);
        } else {
            console.log("Could not find expression " + expr.Type.toString());
            return "UNVISITED" + JSON.stringify(expr);
            //throw this.RuntimeError("Visitor function for Expresion of type " + expr.Type.toString() + " does not exist");
        } 
    }
}
