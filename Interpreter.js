import { basename } from "path";
import {pr} from "./Parser.js";
import { FindFromSymbol,randomRangeInt } from './kp.js';
import {Token} from './Token.js';
import {_} from "lodash";

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

export class Printer extends I_Interpreter{
    constructor(){
        super();
        this.visitors = {
            Assignment:  (expr)=>{
                let targets = this.visitMany(expr.targets);
                let values = this.visitMany(expr.values);
                let     out= targets.join(" ");
                out += ":=";
                out += values.join("[OR]"); 
                return out;
            },
            Base: (expr)=>{
                return this.visitMany(expr.value);
            },
            Definition:  (expr)=>{
                let name = expr.id.string;
                let assignments = this.visitMany(expr.assignments);
                return (name+": <br>"+assignments);
            },
            // function
            Locator:  (expr)=>{
               return _.map(expr.locations, 'string').join(",");
            },
            LValue:  (expr)=>{
                return this.visit(expr.locator);
            },
            Number:  (expr)=>{
                return _.map(expr.values, 'value').join(' to ');
            },
            RValue:  (expr)=>{
                return this.visit(expr.type) + this.visit(expr.locator);
            },
            // sideEffect
            Statement: (expr)=>{
                return this.visitMany(expr.statements);
            },
        };
    }
}

class Environment{
    constructor(id){
        this.defs = {};
        this.id = id;
    }
    applyDefinition(target, value) {
        console.log("Assigning definition " + target + " = " + value);
        // TODO: split some of this into a "findTarget" function
        if(!(target instanceof Array)){
            target = [target];
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
            target = [target];
        }
        // 
        let cur = this;
        _.forEach(target, (loc) => {
            if(!(loc in cur.defs)){
                throw Error(name + " Doesn't exist");
            }
            cur = cur.defs[loc];
        });
        return cur;
    }
    export(){
        let output =  _.map(this.defs, (value, key)=>{
            let out = key+":";
            if(value instanceof Environment){
                out += value.export();
            } else {
                out += _.flatMap(value, (v)=>{return v.value? v.value : v;}).join(" ");
            }
            return out;
        }).join("\n");
        console.log(output);
        return output;
    }
}

export class BasicInterpreter extends I_Interpreter {
    execute(expressions){
        let res = super.execute(expressions);
        this.treeShake();
        return res;
    }
    push_reference(loc){
        let ref = {loc: loc, value: null, tries: 0};
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
            let cur = this.definitions[val[0]];
            return cur.get(val.slice(1));
        } catch(e) {
            return null;
        }
    }

    export(){
        let output = ""; 
        _.forIn(this.definitions, (v,k)=> {
            output += k+": \n" + v.export();
        }).join("\n");
        return output;
    }
    constructor(){
        super();
        this.definitions = [];
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
                    console.log("statement is " + result);
                    ctx.applyDefinition(target, result);
                });
                return out;
            },
            Base: (expr)=>{                
                if (expr.literal) {
                    return expr.literal.value;
                }
                return this.visitMany(expr.value);
            },
            Definition:  (expr)=>{
                let name = expr.id.string;
                let def = new Environment(name);
                this.push_context(def);
                this.visitMany(expr.assignments);
                this.pop_context();
                this.definitions[name] = def;
                return def;
            },
            // function
            Locator:  (expr)=>{
               return _.map(expr.location, 'value');
            },
            LValue:  (expr)=>{
                return this.visit(expr.locator);
            },
            Number:  (expr)=>{
                if(expr.values.length == 1){
                    return expr.values[0].value;
                } else {
                    return randomRangeInt(... _.map(expr.values, 'value'));
                }
            },
            RValue:  (expr, ctx)=>{
                // todo: tree shaking?
                let loc = this.visit(expr.locator);
                try {
                    let rval = ctx.get(loc);
                    if(rval){
                        return rval;
                    } 
                } finally{
                    return this.push_reference(_.concat(ctx.id, loc)); 
                }
            },
            // sideEffect
            Statement: (expr)=>{
                return this.visitMany(expr.statements);
            },
        };
    }
}