
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
        return this.visitMany(definitions);
    }

    // TODO: i don't like this visit vs visit_many
    // i think I had a binding issue 
    visitMany(exprs){
        let ctx = this.peek_context();
        var ret = [];
        if(exprs instanceof Array){
            for(var i=0; i < exprs.length; i++){
                ret.push(this.visit(exprs[i], ctx));
            }
            return ret;
        }
        return [this.visit(exprs, ctx)];
    }
    // TODO: preVisit() and postVisit() to push/pop state?
    visit(expr){
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
            return JSON.stringify(expr);
            //throw this.RuntimeError("Visitor function for Expresion of type " + expr.Type.toString() + " does not exist");
        } 
    }
}