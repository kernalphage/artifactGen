"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
let _functions = {};
function register(fnName, fn, hints) {
    _functions[fnName] = [fn, hints];
}
exports.register = register;
function applyFN(fnName, context, args) {
    let fn = _functions[fnName][0];
    if (!fn) {
        throw new Error("Function " + fnName + " does not exist!");
    }
    else {
        return fn(context, ...args);
    }
}
exports.applyFN = applyFN;
function getHint(fnName) {
    return _functions[fnName][1];
}
exports.getHint = getHint;
let chooseParams = ["values:[Expression]"];
function choose(context, ...values) {
    return context.visit(_.sample(values));
}
register("c", choose, chooseParams);
register("choose", choose, chooseParams);
function chooseNumber(context, count, ...values) {
    let sampleSize = context.visit(count);
    let samples = _.sampleSize(values, sampleSize.numbers[0]);
    return context.visit(samples);
}
register("cn", chooseNumber);
register("chooseNumber", chooseNumber);
