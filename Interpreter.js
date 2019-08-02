import { basename } from "path";
import {_} from "lodash";

class Printer {

};

class Environment{
    constructor(parent){
        this.defs = {};
        this.parent = parent;
    }

    define(name, value) {
        this.defs[name] = value;
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
    }

    evaluate(){
        // visitor pattern goes here
    }

visitDefinition(expr){
    let assignments = _.map(expr.assignments, this.visitAssignment);
    define(expr['id'], assignments);
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