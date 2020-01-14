import { tk, Token } from "./Token";
declare class ScannerError extends Error {
    constructor(message: string, token: Token);
}
export declare class Scanner {
    readonly source: string;
    private start;
    private current;
    private line;
    readonly tokens: Token[];
    readonly errors: ScannerError[];
    constructor(source: string);
    _scanTokens(): void;
    export(): string;
    scanToken(): void;
    scanString(boundary: String, tokenType: tk): void;
    scanNumber(): void;
    isLiteraLCharacter(c: string): boolean;
    scanLiteral(): void;
    scanComment(): void;
    safeCharAt(str: string, i: number): string;
    error(message: String): ScannerError;
    isAtEnd(): boolean;
    advance(): string;
    addToken(type: tk, val?: any): void;
    match(expected: string): boolean;
    peekToken(): Token;
    peek(): string;
    peekNext(): string;
}
export {};
