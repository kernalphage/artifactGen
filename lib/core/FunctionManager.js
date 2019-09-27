import {_} from "lodash";

let _functions = {};

function register(fnName, fn, hints){
    _functions[fnName] = [fn, hints];
}

function applyFN(fnName, context, args){
    let fn = _functions[fnName][0];
    if(! fn ){
        throw new RuntimeError("Function " + fnName + " does not exist!");
    } else {
        return fn(context, ...args);
    }
}

function getHint(fnName){
    return _functions[fnName][1];
}

let chooseParams = ["values:[Expression]"];
function choose(context, ...values){
    return context.visit(_.sample(values));
}
register("c", choose, chooseParams);
register("choose", choose, chooseParams);


function chooseNumber(context, count, ...values){
    let sampleSize = context.visit(count)[0];
    let samples = _.sampleSize(values,sampleSize);
    return context.visit(samples);
}
register("cn", chooseNumber);
register("chooseNumber", chooseNumber);


let probablyParams = ["Chance:NumberExpression", "expr:Expression"];
function probably(context, chance, expr){
    if(Math.random() * 100 > context.visit(chance)){
        return context.visit(expr);
    } 
    return null;
}
register("p", probably, probablyParams);
register("probably", probably, probablyParams);

register("times", (context, num, expr)=>{
    let times = context.visit(num);
    let res = _.times(times, ()=>{
        return context.visit(expr);
    });
    console.log("Applying function " + times + " with many and got result " + JSON.stringify(res));
    return res;
}, ["times:NumberExpression", "expr:Expression"]);

register("join", (context, expr, joiner)=>{
    let vals = context.visit(expr);
    console.log("vals are ", vals);
    return vals.join(context.visit(joiner));
});

register("if", (predicate, ifCase, thenCase)=>{
    if(context.visit(predicate)){
        return context.visit(ifCase);
    }
    else {
        return context.visit(thenCase);
    }
}, ["predicate:Value", "ifCase:Expression", "thenCase:Expression"]);

module.exports.register = register;
module.exports.applyFN = applyFN;
module.exports.getHint = getHint;