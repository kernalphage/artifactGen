import { Expression, Locator, TExprString } from './Expressions';
import { I_Interpreter } from "./I_Interpreter";
import { Environment } from "./Environment";
declare class UnresolvedReference {
    readonly loc: Locator;
    tries: number;
    value: any;
    constructor(loc: Locator, value?: any);
    toString(): any;
}
export declare class BasicInterpreter extends I_Interpreter {
    env: Environment;
    toResolve: UnresolvedReference[];
    contexts: Environment[];
    visitors: Record<TExprString, Function>;
    push_context(env: Environment): void;
    peek_context(): Environment | undefined;
    pop_context(): void;
    getProperty<T, K extends keyof T>(obj: T, key: K): T[K];
    visit(expr: (Expression | Expression[])): (Expression | Expression[]);
    execute(expressions: Expression[]): Environment;
    push_reference(loc: Locator): UnresolvedReference;
    treeShake(): void;
    findRvalue(loc: Locator): Expression[] | Expression | Environment | null;
    export(): string;
    constructor();
}
export {};
