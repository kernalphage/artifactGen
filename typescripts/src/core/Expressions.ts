import { I_Interpreter } from './I_Interpreter';
import { Environment } from './Environment';
import { Token } from './Token';

//interface Expression {
////type Expression = Square | Rectangle | Circle;
export interface Expression {
    readonly _exprType: TExprString;
};


export class Base implements Expression {
   readonly _exprType="Base" as "Base"
    constructor(readonly values: (Token | Expression)[]) { } // TODO: not happy about this any
}
export class Assignment implements Expression {
   readonly _exprType="Assignment" as "Assignment"
    constructor(readonly targets: LValue[], readonly choices: Statement[]) { }
}
export class Definition implements Expression {
   readonly _exprType="Definition" as "Definition"
    constructor(readonly id: string, readonly assignments: Assignment[]) { }
}
export class ExFunction implements Expression {
   readonly _exprType="ExFunction" as "ExFunction"
    constructor(readonly locator: any, readonly parameters: Base[]) { }
}

// TODO: unpack these tokens to a normalized format?

export type EnvLocation = string | string[] | Locator;
export class Locator implements Expression {
   readonly _exprType="Locator" as "Locator"
    constructor(readonly location: string[]) { }

    static AppendLocations(a:EnvLocation, b:EnvLocation): Locator {
        a = this.normalizeLocation(a);
        b = this.normalizeLocation(b);
        return new Locator(a.concat(b));
    }
    static normalizeLocation(target: EnvLocation): string[] {
        if (target instanceof Locator) {
            return target.location;
        }
        else if (target instanceof Array) {
            return target;
        }
        else {
            return target.split(".");
        }
    }
}

// TODO: Take another stab at pulling reftype into Location again
export type Reftype = "ABSOLUTE" | "RELATIVE";
export class LValue implements Expression {
   readonly _exprType="LValue" as "LValue"
    constructor(readonly reftype: Reftype, readonly locator: Locator) { }
}

export class EXNumber implements Expression {
   readonly _exprType="EXNumber" as "EXNumber"
    constructor(readonly numbers: number[]) { }
}
export class RValue implements Expression {
   readonly _exprType="RValue" as "RValue"
    constructor(readonly reftype: Reftype, readonly locator: Locator) { }
}
export class Statement implements Expression {
   readonly _exprType="Statement" as "Statement"
    constructor(readonly statements: Base[]) { }
}

export type TExpr = (Assignment | Base | Definition | ExFunction | Locator | LValue | EXNumber | RValue | SideEffect | Statement);
export type TExprString = "unknown" | "Assignment" | "Base" | "Definition" | "ExFunction" | "Locator" | "LValue" | "EXNumber" | "RValue" | "SideEffect" | "Statement"
//     <T>(arg: T): T;
export type ExprVisitor<T extends Expression,
    U extends Expression> =
    (a: T, c: Environment) => (U | void)

// ========== TO IMPLEMENT ===========

export class SideEffect implements Expression {
   readonly _exprType="SideEffect" as "SideEffect"
    constructor(readonly ref: any, readonly op: any, readonly value: any) { }
}