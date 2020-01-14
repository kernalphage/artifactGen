export const enum tk {
    AT,
    BANG,
    BAR,
    COLON,
    COMMA,
    DOLLAR,
    DOT,
    EOF,
    EQUALS,
    ERROR,
    HASH,
    LEFT_BRACKET,
    LEFT_CURLY,
    LEFT_PAREN,
    LITERAL,
    MINUS,
    NEWLINE,
    NUMBER,
    PLUS,
    QUESTION,
    RIGHT_BRACKET,
    RIGHT_CURLY,
    RIGHT_PAREN,
    SEMICOLON,
    SLASH,
    STAR,
}

export class Token {
    readonly value: any;
    constructor(readonly symbol: tk, readonly string: string, readonly line: Number, value: any = null) {
        this.value = (value == null) ? string : value;
    }

    toString() {
        return ">" + this.string + "< (line " + this.line + ")";
    }
}