import { basename } from "path";
import {pr} from "./Parser.js";
import {_} from "lodash";

class Printer {

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
        this.visitors = _.fromPairs(
            [pr.Definition, (expr)=>{
                let assignments = _.map(expr.assignments, this.visit);
                return this.applyDefinition(this.visit(expr.id), assignments);
            }],
            [pr.Assignment, (expr)=>{

            }]
        );
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