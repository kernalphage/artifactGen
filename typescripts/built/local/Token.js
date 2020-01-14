"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Token {
    constructor(symbol, string, line, value = null) {
        this.symbol = symbol;
        this.string = string;
        this.line = line;
        this.value = (value == null) ? string : value;
    }
    toString() {
        return ">" + this.string + "< (line " + this.line + ")";
    }
}
exports.Token = Token;
