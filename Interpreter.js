import { basename } from "path";
import {pr} from "./Parser.js";
import { FindFromSymbol } from './kp.js';
import {Token} from './Token.js';
import {_} from "lodash";

export class Printer {
    constructor(){

        this.logState = "";
        this.tabs = 0;

        this.visitors = {
            Assignment:  (expr)=>{
                let targets = this.visitMany(expr.targets);
                let values = this.visitMany(expr.values);
                let out = targets.join(" ");
                out += ":=";
                out += values.join("[OR]"); 
                return out;
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
            Statement: (expr)=>{
                return this.visitMany(expr.statements);
            },
            Base: (expr)=>{
                return this.visitMany(expr.value);
            },
            Number:  (expr)=>{
                return _.map(expr.values, 'value').join(' to ');
            },
            Rvalue:  (expr)=>{
                
            }
        }
    }
    execute(definitions){
        return this.visitMany(definitions);
    }
    // TODO: Visit([expr])? => [val]?
    // TODO: default visit command?
    visitMany(exprs){
        var ret = [];
        if(exprs instanceof Array){
            for(var i=0; i < exprs.length; i++){
                ret.push(this.visit(exprs[i]));
            }
        
        return ret;
        }
        return [this.visit(exprs)];
    }
    visit(expr){
        this.tabs++;
        if(expr instanceof Token){
            return expr.value;
        }
        let key = FindFromSymbol(pr, expr.Type);
        let fn = this.visitors[key];
        if(fn){
            return fn.apply(this, [expr]);
        } else {
            console.log("Could not find expression " + expr.Type.toString());
            return JSON.stringify(expr);
            //throw this.RuntimeError("Visitor function for Expresion of type " + expr.Type.toString() + " does not exist");
        } 
        this.tabs--;
    }

    log(line){
        let tabs =  _.times(this.tabs, "\t").join("");
        console.log(tabs+line);
    }
};

class Environment{
    constructor(parent){
        this.defs = {};
        this.parent = parent;
    }

    applyDefinition(name, value) {
        this.defs[name] = value;
        return this.defs[name];
    }
    get(name) {
        if (name in defs) {
            return this.defs[name];
        }
        if(this.parent){
            return this.parent.get(name);
        }
        throw Error(name + " Doesn't exist");
    }
}

export class Interpreter {
    constructor(){
        this.environment = new Environment();
        this.visitors = {
            Definition:  (expr)=>{
                let name = this.visit(expr.id);
                let assignments = _.map(expr.assignments, this.visit);
                return this.applyDefinition(name, assignments);
            },
            Assignment:  (expr)=>{
                
            }
            }
    }

    visit(expr){
        let fn = this.visitors[expr.Type];
        if(fn){
            return this.apply(fn, expr);
        } else {
            throw this.RuntimeError("Visitor function for Expresion of type " + expr.Type.toString() + " does not exist");
        }
    }

visitDefinition(expr){

}

visitAssignment(expr){

}

visitTarget(expr){

}

visitLocator(expr){
    
}

visitStatement(expr){

}

visitBase(expr) {
    if (expr.literal) {
        return expr.literal;
    }
    return this.evaluate(expr.value);
}
visitNumber(expr){
    if(expr.values.length == 1){
        return expr.values[0];
    } else {
        return _getRandomInRange(expr.values);
    }
}

visitSideEffect(expr){
    //hoo boy
}

visitReference(expr){

}

visitFunction(expr){

}
};