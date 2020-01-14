import { Expression, Assignment, Base, Definition, Locator, LValue, EXNumber, RValue, Statement, ExFunction, TExpr, ExprVisitor, TExprString, SideEffect } from './Expressions';
import { I_Interpreter } from "./I_Interpreter";
import { randomRangeInt } from './kp';
import * as _ from "lodash";
import { Environment } from "./Environment";
import { Token } from './Token';

class UnresolvedReference {
    tries = 0;
    value: any; // TODO: another "narrow this down later any
    constructor(readonly loc: Locator, value?: any) {
        this.value = value;
    }
    toString() {
        return this.value;
    }
};

type VisitResult = (Expression[] | Environment | UnresolvedReference | number | Expression | void | VisitResult[]) ;

export class BasicInterpreter extends I_Interpreter {
    env: Environment;
    toResolve: UnresolvedReference[];

    curContext: Environment = new Environment("root");

    // TODO: Ugh. this was 90% of the reason I switched to TS 
    // (okay thats a lie, it was for Environment)
    readonly visitors: Record<TExprString, (e:(any), ctx:Environment)=> VisitResult> = {
        "unknown": () => { },
        "SideEffect": () => { },
        "Statement": () => { },

        "Assignment": (expr: Assignment, ctx: Environment): void => {
            let chosenAssignment = _.sample(expr.choices);

            if (!chosenAssignment) {
                return
            }
            _.zip(expr.targets, chosenAssignment.statements).map((assignment) => {
                let [target, statements] = assignment;
                if (!target || !statements) {
                    // TODO: split into 2 for better error handling
                    throw new Error("Mismatched assignments at " + expr);
                    return;
                }
                let targetLoc = target; // TODO what am i doing anymore 
                let result = statements && this.visit(statements);
                ctx.applyDefinition(targetLoc.locator, result);
            });
        },
        "Base": (expr: Base) => {
            return this.visit(expr.values);
        },
        "Definition": (expr: Definition): Environment => {
            let name = expr.id;
            let def = new Environment(name);
            this.curContext = def;
            this.visit(expr.assignments);
            this.env.applyDefinition(name, def);
            return def;
        },
        // TODO: I don't need to parse locators! 
        // I will if i want to do weird things like $parent.child.($favoriteToy).color
        // but right now a flat list is all I need
        "Locator": (expr: Locator) => {
            return expr;
        },
        "LValue": (expr: LValue) => {
            // TODO: Split on relative vs absolute
            return this.visit(expr.locator);
        },
        "EXNumber": (expr: EXNumber) => {
            if (expr.numbers.length == 1) {
                return expr.numbers[0];
            } else {
                // TODO: Support floats
                return randomRangeInt(expr.numbers[0], expr.numbers[1]);
            }
        },
        "RValue": (expr: RValue, ctx: Environment) => {
            try {
                let rval = null;
                if (expr.reftype == "ABSOLUTE") {
                    rval = this.env.get(expr.locator);
                } else {
                    rval = ctx.get(expr.locator);
                }
                return rval;
            } finally {
                let rval = null;
                if (expr.reftype == "ABSOLUTE") {
                    rval = expr.locator;
                } else {
                    //  TODO: concat
                    rval = expr.locator; //_.concat(ctx.id, loc)
                }
                return this.push_reference(rval);
            }
        }, "ExFunction": (a: ExFunction) => {
            return a;
        }
    };

    getProperty<T, K extends keyof T>(obj: T, key: K) {
        return obj[key];
    }

    visit(expr: (Expression | Token)[] | Expression | Token): VisitResult {
        if (expr instanceof Array) {
            var ret:VisitResult[] = [];
            for (var i = 0; i < expr.length; i++) {
                let ex = expr[i];
                let v = this.visit(ex);
                ret.push(v);
            }
            return ret;
        }
        if (expr instanceof Token) {
            return expr.value;
        }
        
        let fn = this.visitors[expr._exprType];
        if (fn) {

            let ctx = this.curContext;
            // I SWEAR this works
        return fn(expr, ctx);
            // re-calculating the context every time means visit can change contexts mid-run, which actually might be what I want? 
            // I'm not sure, it's an uninformed choice but I damn well am gonna make it. 
            // TODO: I could pass in recursion depth, entire tree state, lots of fun stuff

        } else {
            console.log("Could not find visitor for expression " + (expr._exprType).toString());
            //return "UNVISITED" + JSON.stringify(expr);
            throw new Error("Visitor function for Expresion of type " + (expr._exprType) + " does not exist");
        }
    }

    execute(expressions: Expression[]): Environment {
        this.visit(expressions);
        this.treeShake();
        return this.env;
    }
    push_reference(loc: Locator): UnresolvedReference {
        let ref = new UnresolvedReference(loc);
        // TODO: cache references 
        this.toResolve.push(ref);
        return ref;
    }

    // TODO: Actual dependency resolution
    treeShake(): void {
        let open = this.toResolve;

        let failsafe = 100;
        while (open.length > 0 && (failsafe-- > 0)) {
            let cur = open.pop();
            if (!cur) break;

            let val = this.findRvalue(cur.loc);
            if (val) {
                cur.value = val;
                console.log(JSON.stringify(cur));
            } else {
                cur.tries++;
                open.push(cur);
                // tODO: shuffle before pushing? 
            }
        }
    }

    findRvalue(loc: Locator): Expression[] | Expression | Environment | null {
        try {
            let cur = this.env.get(loc);
            console.log("Found rvalue " + loc + " => " + cur);
            return cur;
        } catch (e) {
            console.log("Error finding rvalue " + e);
            return null;
        }
    }

    export() {
        return this.env.export();
    }

    constructor() {
        super();
        this.env = new Environment(".");
        this.toResolve = [];
    }
}