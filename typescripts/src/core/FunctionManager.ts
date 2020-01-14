import { Environment } from './Environment';
import * as _ from "lodash";
import { Expression, EXNumber } from './Expressions';
import { BasicInterpreter } from './Interpreter';

type FunctionDef = [Function, any];

let _functions: Record<string, FunctionDef>= {};
export function register(fnName: string, fn: Function, hints?: string[]){
    _functions[fnName] = [fn, hints];
}

export function applyFN(fnName: string, context: Environment, args: Expression[]){
    let fn = _functions[fnName][0];
    if(! fn ){
        throw new Error("Function " + fnName + " does not exist!");
    } else {
        return fn(context, ...args);
    }
}

export function getHint(fnName: string){
    return _functions[fnName][1];
}

let chooseParams = ["values:[Expression]"];
function choose(context: BasicInterpreter, ...values: any[]){
    return context.visit(_.sample(values));
}
register("c", choose, chooseParams);
register("choose", choose, chooseParams);


// TODO: saftey is a cruel mistress
function chooseNumber(context: BasicInterpreter, count: EXNumber, ...values: any[]){
    let sampleSize = context.visit(count) as EXNumber;
    let samples = _.sampleSize(values,sampleSize.numbers[0]);
    return context.visit(samples);
}
register("cn", chooseNumber);
register("chooseNumber", chooseNumber);
/*

let probablyParams = ["Chance:NumberExpression", "expr:Expression"];
function probably(context: BasicInterpreter, chance: any, expr: any){
    if(Math.random() * 100 > context.visit(chance)){
        return context.visit(expr);
    } 
    return null;
}
register("p", probably, probablyParams);
register("probably", probably, probablyParams);
*/
/*
// TODO: REpeat instead of times? 
register("times", (context: BasicInterpreter, num: any, expr: any)=>{
    let times = context.visit(num);
    let res = _.times(times, ()=>{
        return context.visit(expr);
    });
    console.log("Applying function " + times + " with many and got result " + JSON.stringify(res));
    return res;
}, ["times:NumberExpression", "expr:Expression"]);

register("join", (context: BasicInterpreter, expr: any, joiner: any)=>{
    let vals = context.visit(expr);
    console.log("vals are ", vals);
    return vals.join(context.visit(joiner));
});

register("if", (context:BasicInterpreter, predicate: any, ifCase: any, thenCase: any)=>{
    if(context.visit(predicate)){
        return context.visit(ifCase);
    }
    else {
        return context.visit(thenCase);
    }
}, ["predicate:Value", "ifCase:Expression", "thenCase:Expression"]);
*/