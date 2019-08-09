import {makeEnum} from "./kp.js";
// maybe makeEnum should return a function, making all my calls tk("LEFT PAREN"); 
// i think the extra quotes are worth some type safety
export const tk = makeEnum([
    "LEFT_PAREN",
    "RIGHT_PAREN",
    "LEFT_BRACKET",
    "RIGHT_BRACKET",
    "LEFT_CURLY",
    "RIGHT_CURLY",
    "COMMA",
    "DOT",
    "MINUS",
    "PLUS",
    "SEMICOLON",
    "COLON",
    "SLASH",
    "STAR",
    "BANG",
    "AT",
    "DOLLAR",
    "HASH",
    "QUESTION",
    "EQUALS",

    "COMMENT",
    "LITERAL",
    "NUMBER",
    "EOF", 
    "ERROR",
    "BAR",
    
]);
    


export class Token{
    constructor(symbol, string, line, value){
        this.symbol = symbol;
        this.string = string;
        this.value = (value == null) ? string : value;
        this.line = line;
    }    

    toString(){
        let va = " with value " + this.value;
        return this.symbol.toString() + ">" + this.string + "<" + va;
    }
};