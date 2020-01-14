export declare const enum tk {
    AT = 0,
    BANG = 1,
    BAR = 2,
    COLON = 3,
    COMMA = 4,
    DOLLAR = 5,
    DOT = 6,
    EOF = 7,
    EQUALS = 8,
    ERROR = 9,
    HASH = 10,
    LEFT_BRACKET = 11,
    LEFT_CURLY = 12,
    LEFT_PAREN = 13,
    LITERAL = 14,
    MINUS = 15,
    NEWLINE = 16,
    NUMBER = 17,
    PLUS = 18,
    QUESTION = 19,
    RIGHT_BRACKET = 20,
    RIGHT_CURLY = 21,
    RIGHT_PAREN = 22,
    SEMICOLON = 23,
    SLASH = 24,
    STAR = 25
}
export declare class Token {
    readonly symbol: tk;
    readonly string: string;
    readonly line: Number;
    readonly value: any;
    constructor(symbol: tk, string: string, line: Number, value?: any);
    toString(): string;
}
