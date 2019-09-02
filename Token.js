import { makeEnum } from "./kp.js";
// maybe makeEnum should return a function, making all my calls tk("LEFT PAREN"); 
// i think the extra quotes are worth some type safety
export const tk = makeEnum([
    "AT",
    "BANG",
    "BAR",
    "COLON",
    "COMMA",
    "DOLLAR",
    "DOT",
    "EOF",
    "EQUALS",
    "ERROR",
    "HASH",
    "LEFT_BRACKET",
    "LEFT_CURLY",
    "LEFT_PAREN",
    "LITERAL",
    "MINUS",
    "NEWLINE",
    "NUMBER",
    "PLUS",
    "QUESTION",
    "RIGHT_BRACKET",
    "RIGHT_CURLY",
    "RIGHT_PAREN",
    "SEMICOLON",
    "SLASH",
    "STAR",

]);



export class Token {
    constructor(symbol, string, line, value) {
        this.symbol = symbol;
        this.string = string;
        this.value = (value == null) ? string : value;
        this.line = line;
    }

    toString() {
        return this.symbol.toString() + ">" + this.string + "< with value " + this.value;
    }
}