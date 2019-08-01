import { basename } from "path";
import {_} from "lodash";

class Printer {

};


export class Interpreter {
    objState = {};

    //visitor pattern goes here
    evaluate(expr){
        return //magic;
    }

visitDefinition(expr){
    let assignments = _.map(expr.assignments, this.visitAssignment);
    this.programState[expr['id']] = {assignments};
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