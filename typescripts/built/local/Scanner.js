"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kp_js_1 = require("./kp.js");
const Token_1 = require("./Token");
const _ = require("lodash");
const singleTokens = {
    "@": 0,
    "!": 1,
    "|": 2,
    ":": 3,
    ",": 4,
    "$": 5,
    ".": 6,
    "=": 8,
    "#": 10,
    "[": 11,
    "{": 12,
    "(": 13,
    "-": 15,
    "+": 18,
    "?": 19,
    "]": 20,
    "}": 21,
    ")": 22,
    ";": 23,
    "/": 24,
    "*": 25,
};
const literals = {
    '"': ['"', 14],
    "'": ["'", 14],
};
class ScannerError extends Error {
    constructor(message, token) {
        super("Scan error at token " + token + ": " + message);
        this.name = "ScannerError";
    }
}
class Scanner {
    constructor(source) {
        this.source = source;
        this.start = 0;
        this.current = 0;
        this.line = 1;
        this.tokens = [];
        this.errors = [];
        this._scanTokens();
    }
    _scanTokens() {
        while (!this.isAtEnd()) {
            console.log("starting scanning token " + this.peek());
            this.start = this.current;
            try {
                this.scanToken();
            }
            catch (e) {
                if (e instanceof ScannerError) {
                    this.errors.push(e);
                }
                else {
                    this.errors.push(new ScannerError("Unexpected error: " + e.message, this.peekToken()));
                }
                break;
            }
            console.log("Scanning token " + this.peek());
        }
        this.tokens.push(new Token_1.Token(7, "", this.line));
        if (this.errors.length > 0) {
            throw ("Could not parse source " + JSON.stringify(this.errors));
        }
    }
    export() {
        var out = "Source file: \n";
        out += "Lines: " + this.line + "\n";
        return _.map(this.tokens, (t) => { t.toString(); }).join("\n");
    }
    scanToken() {
        let c = this.advance();
        if (c == "\n") {
            this.line++;
        }
        if (c in literals) {
            var [terminal, token] = literals[c];
            return this.scanString(terminal, token);
        }
        if (kp_js_1.isDigit(c)) {
            return this.scanNumber();
        }
        if (kp_js_1.isLiteral(c)) {
            return this.scanLiteral();
        }
        if (c == "/" && this.peek() == "/") {
            return this.scanComment();
        }
        if (c == '\\' && (this.peek() in singleTokens)) {
            c = this.advance();
            if (c == "\n") {
                return;
            }
            this.advance();
            return this.addToken(14);
        }
        if (c in singleTokens) {
            var t = singleTokens[c];
            return this.addToken(t);
        }
    }
    scanString(boundary, tokenType) {
        while (this.peek() != boundary && !this.isAtEnd()) {
            let c = this.peek();
            switch (c) {
                case "\n":
                    this.line++;
                    break;
                case "\\":
                    break;
                case "{": {
                    this.advance();
                    let val = this.source.substring(this.start + 1, this.current - 1);
                    if (val.length > 0) {
                        this.addToken(tokenType, val);
                    }
                    while (this.peek() != "}" && !this.isAtEnd()) {
                        this.start = this.current;
                        this.scanToken();
                    }
                    this.start = this.current;
                    break;
                }
                case "@":
                case "#":
                case "$": {
                    this.advance();
                    let val = this.source.substring(this.start + 1, this.current - 1);
                    if (val.length > 0) {
                        this.addToken(tokenType, val);
                    }
                    this.addToken(singleTokens[c], c);
                    while (!(this.peek() in [" ", "\n", "\t", boundary]) && !this.isAtEnd()) {
                        this.start = this.current;
                        this.scanToken();
                    }
                    this.current--;
                    this.start = this.current;
                    break;
                }
                default:
                    break;
            }
            this.advance();
        }
        if (this.isAtEnd()) {
            throw this.error("Unterminated string, could not find boundary " + boundary);
        }
        this.advance();
        let val = this.source.substring(this.start + 1, this.current - 1);
        if (val.length > 0) {
            this.addToken(tokenType, val);
        }
    }
    scanNumber() {
        while (kp_js_1.isDigit(this.peek()))
            this.advance();
        if (this.peek() == '.' && kp_js_1.isDigit(this.peekNext())) {
            this.advance();
        }
        while (kp_js_1.isDigit(this.peek()))
            this.advance();
        return this.addToken(17, parseFloat(this.source.substring(this.start, this.current)));
    }
    isLiteraLCharacter(c) {
        if (c in singleTokens)
            return false;
        if (c in literals)
            return false;
        return true;
    }
    scanLiteral() {
        while (this.isLiteraLCharacter(this.peek()))
            this.advance();
        return this.addToken(14);
    }
    scanComment() {
        while (this.peek() != "\n" && !this.isAtEnd()) {
            this.advance();
        }
    }
    safeCharAt(str, i) {
        do {
            let c = kp_js_1.getWholeChar(str, i);
            if (c === null) {
                i++;
                console.log("safe char at" + i);
            }
            else {
                return c;
            }
        } while (true);
    }
    error(message) {
        return new ScannerError("Error at " + this.line + ":" + this.current + ": " + message, this.peekToken());
    }
    isAtEnd() {
        return this.current >= this.source.length;
    }
    advance() {
        let c = this.peek();
        do {
            this.current++;
            console.log(this.current);
        } while (kp_js_1.getWholeChar(this.source, this.current) === null);
        return c;
    }
    addToken(type, val) {
        let text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token_1.Token(type, text, this.line, val));
    }
    match(expected) {
        if (this.isAtEnd())
            return false;
        if (this.peek() != expected)
            return false;
        this.current++;
        return true;
    }
    peekToken() {
        return this.tokens[this.tokens.length - 1];
    }
    peek() {
        if (this.isAtEnd())
            return '\0';
        return this.safeCharAt(this.source, this.current);
    }
    peekNext() {
        if (this.current + 1 >= this.source.length)
            return '\0';
        return this.safeCharAt(this.source, this.current + 1);
    }
}
exports.Scanner = Scanner;
;
