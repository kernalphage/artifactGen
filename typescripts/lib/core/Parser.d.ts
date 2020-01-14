import { tk, Token } from "./Token";
import { Expression, Definition, Base, Statement, Assignment, Locator, LValue, RValue, ExFunction } from "./Expressions";
declare class UnexpectedToken extends Error {
    constructor(message: string, token: Token);
}
declare class MissingToken extends Error {
    constructor(message: string, token: Token);
}
export declare class Parser {
    readonly tokens: Token[];
    current: number;
    definitions: Expression[];
    readonly errors: Error[];
    warnings: string[];
    curDefinition: string;
    constructor(tokens: Token[]);
    peek(): Token;
    check(symbol: tk): boolean;
    advance(): Token;
    previous(): Token;
    isAtEnd(): Boolean;
    mustMatch(tokens: (tk | tk[]), errorMessage: string): void;
    match(...tokens: tk[]): boolean;
    warn(message: string): void;
    error(ErrorType: (typeof UnexpectedToken | typeof MissingToken), message: String): never;
    parse_main(): Expression[];
    synchronize(): void;
    parse_base_expr(): Base;
    find_some<T>(parseFn: (() => T), sepToken: tk, endToken?: tk): T[];
    find_some(parseFn: tk, sepToken: tk, endToken?: tk): Token[];
    parse_statement(): Statement;
    parse_number(): Number;
    parse_assignment(): Assignment;
    parse_locator(): Locator;
    parse_definition(): Definition;
    parse_lvalue(): LValue;
    parse_rvalue(): RValue;
    parse_function_expr(): ExFunction;
}
export {};
