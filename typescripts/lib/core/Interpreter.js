"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const I_Interpreter_1 = require("./I_Interpreter");
const kp_1 = require("./kp");
const _ = require("lodash");
const Environment_1 = require("./Environment");
class UnresolvedReference {
    constructor(loc, value) {
        this.loc = loc;
        this.tries = 0;
        this.value = value;
    }
    toString() {
        return this.value;
    }
}
;
class BasicInterpreter extends I_Interpreter_1.I_Interpreter {
    constructor() {
        super();
        this.contexts = [];
        this.visitors = {
            "SideEffect": () => { },
            "Statement": () => { },
            "Assignment": (expr, ctx) => {
                let chosenAssignment = _.sample(expr.choices);
                if (!chosenAssignment) {
                    return;
                }
                _.zip(expr.targets, chosenAssignment.statements).map((assignment) => {
                    let [target, statements] = assignment;
                    if (!target || !statements) {
                        throw new Error("Mismatched assignments at " + expr);
                        return;
                    }
                    let targetLoc = target;
                    let result = statements && this.visit(statements);
                    ctx.applyDefinition(targetLoc.locator, result);
                });
            },
            "Base": (expr) => {
                return this.visit(expr.values);
            },
            "Definition": (expr) => {
                let name = expr.id;
                let def = new Environment_1.Environment(name);
                this.push_context(def);
                this.visit(expr.assignments);
                this.pop_context();
                this.env.applyDefinition(name, def);
                return def;
            },
            "Locator": (expr) => {
                return expr;
            },
            "LValue": (expr) => {
                return this.visit(expr.locator);
            },
            "EXNumber": (expr) => {
                if (expr.numbers.length == 1) {
                    return expr.numbers[0];
                }
                else {
                    return kp_1.randomRangeInt(expr.numbers[0], expr.numbers[1]);
                }
            },
            "RValue": (expr, ctx) => {
                try {
                    let rval = null;
                    if (expr.reftype == "ABSOLUTE") {
                        rval = this.env.get(expr.locator);
                    }
                    else {
                        rval = ctx.get(expr.locator);
                    }
                    return rval;
                }
                finally {
                    let rval = null;
                    if (expr.reftype == "ABSOLUTE") {
                        rval = expr.locator;
                    }
                    else {
                        rval = expr.locator;
                    }
                    return this.push_reference(rval);
                }
            }, "ExFunction": (a) => {
                return a;
            }
        };
        this.env = new Environment_1.Environment(".");
        this.toResolve = [];
    }
    push_context(env) {
        this.contexts.push(env);
    }
    peek_context() {
        return _.last(this.contexts);
    }
    pop_context() {
        this.contexts.pop();
    }
    getProperty(obj, key) {
        return obj[key];
    }
    visit(expr) {
        if (expr instanceof Array) {
            var ret = [];
            for (var i = 0; i < expr.length; i++) {
                ret.push(this.visit(expr[i]));
            }
            return _.flatten(ret);
        }
        let fn = this.visitors[expr._exprType];
        if (fn) {
            return fn.apply(this, [expr, this.peek_context()]);
        }
        else {
            console.log("Could not find visitor for expression " + (expr._exprType).toString());
            throw new Error("Visitor function for Expresion of type " + (expr._exprType) + " does not exist");
        }
    }
    execute(expressions) {
        this.visit(expressions);
        this.treeShake();
        return this.env;
    }
    push_reference(loc) {
        let ref = new UnresolvedReference(loc);
        this.toResolve.push(ref);
        return ref;
    }
    treeShake() {
        let open = this.toResolve;
        let failsafe = 100;
        while (open.length > 0 && (failsafe-- > 0)) {
            let cur = open.pop();
            if (!cur)
                break;
            let val = this.findRvalue(cur.loc);
            if (val) {
                cur.value = val;
                console.log(JSON.stringify(cur));
            }
            else {
                cur.tries++;
                open.push(cur);
            }
        }
    }
    findRvalue(loc) {
        try {
            let cur = this.env.get(loc);
            console.log("Found rvalue " + loc + " => " + cur);
            return cur;
        }
        catch (e) {
            console.log("Error finding rvalue " + e);
            return null;
        }
    }
    export() {
        return this.env.export();
    }
}
exports.BasicInterpreter = BasicInterpreter;
