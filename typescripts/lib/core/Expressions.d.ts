import { Environment } from './Environment';
export interface Expression {
    readonly _exprType: TExprString;
}
export declare class Base implements Expression {
    readonly values: any[];
    readonly _exprType: "Base";
    constructor(values: any[]);
}
export declare class Assignment implements Expression {
    readonly targets: LValue[];
    readonly choices: Statement[];
    readonly _exprType: "Assignment";
    constructor(targets: LValue[], choices: Statement[]);
}
export declare class Definition implements Expression {
    readonly id: string;
    readonly assignments: Assignment[];
    readonly _exprType: "Definition";
    constructor(id: string, assignments: Assignment[]);
}
export declare class ExFunction implements Expression {
    readonly locator: any;
    readonly parameters: Base[];
    readonly _exprType: "ExFunction";
    constructor(locator: any, parameters: Base[]);
}
export declare type EnvLocation = string | string[] | Locator;
export declare class Locator implements Expression {
    readonly location: string[];
    readonly _exprType: "Locator";
    constructor(location: string[]);
    static AppendLocations(a: EnvLocation, b: EnvLocation): Locator;
    static normalizeLocation(target: EnvLocation): string[];
}
export declare type Reftype = "ABSOLUTE" | "RELATIVE";
export declare class LValue implements Expression {
    readonly reftype: Reftype;
    readonly locator: Locator;
    readonly _exprType: "LValue";
    constructor(reftype: Reftype, locator: Locator);
}
export declare class EXNumber implements Expression {
    readonly numbers: number[];
    readonly _exprType: "EXNumber";
    constructor(numbers: number[]);
}
export declare class RValue implements Expression {
    readonly reftype: Reftype;
    readonly locator: Locator;
    readonly _exprType: "RValue";
    constructor(reftype: Reftype, locator: Locator);
}
export declare class Statement implements Expression {
    readonly statements: Base[];
    readonly _exprType: "Statement";
    constructor(statements: Base[]);
}
export declare type TExpr = (Assignment | Base | Definition | ExFunction | Locator | LValue | EXNumber | RValue | SideEffect | Statement);
export declare type TExprString = "Assignment" | "Base" | "Definition" | "ExFunction" | "Locator" | "LValue" | "EXNumber" | "RValue" | "SideEffect" | "Statement";
export declare type ExprVisitor<T extends Expression, U extends Expression> = (a: T, c: Environment) => (U | void);
export declare class SideEffect implements Expression {
    readonly ref: any;
    readonly op: any;
    readonly value: any;
    readonly _exprType: "SideEffect";
    constructor(ref: any, op: any, value: any);
}
