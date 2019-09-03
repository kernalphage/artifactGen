import {isAlphaNumeric, isDigit} from "./kp.js";
import {tk, Token} from "./Token.js";
const singleTokens = {
    "@": tk.AT,
    "!": tk.BANG,
    "|": tk.BAR,
    ":": tk.COLON,
    ",": tk.COMMA,
    "$": tk.DOLLAR,
    ".": tk.DOT,
    "=": tk.EQUALS,
    "#": tk.HASH,
    "[": tk.LEFT_BRACKET,
    "{": tk.LEFT_CURLY,
    "(": tk.LEFT_PAREN,
    "-": tk.MINUS,
    // "\n": tk.NEWLINE,
    "+": tk.PLUS,
    "?": tk.QUESTION,
    "]": tk.RIGHT_BRACKET,
    "}": tk.RIGHT_CURLY,
    ")": tk.RIGHT_PAREN,
    ";": tk.SEMICOLON,
    "/": tk.SLASH,
    "*": tk.STAR,
    "\r": null,
    " ": null,
    "\t": null,
};

const literals = {
    '"': ['"', tk.LITERAL],
    "'": ["'", tk.LITERAL],
};

class ScannerError extends Error{
    constructor(message, token){
        super("Scan error at token " + token + ": " + message );
        this.name = "ScannerError";
    }
}

export class Scanner {
    constructor(source) {
        this.source = source;
        this.start = 0;
        this.current = 0;
        this.line = 1;
        this.tokens = [];
        this.scanTokens();
    }

    scanTokens() {
        this.errors = [];
        this.tokens = [];
        while (!this.isAtEnd()) {
            this.start = this.current;
            try {
                this.scanToken();
            } catch (e) {
                if (e instanceof ScannerError){
                    this.errors.push(e);
                } else {
                    this.errors.push(new ScannerError("Unexpected error: " + e.message, this.peek()));
                }
            }
        }
        this.tokens.push(new Token(tk.EOF, "", this.line));
        if (this.errors.length > 0) {
            console.log("Could not parse source " + this.source);
            this.tokens = [];
        }
        return this.errors;
    }

    export () {
        var out = "Source file: \n";
        out += "Lines: " + this.line + "\n";
        for (var i = 0; i < this.tokens.length; i++) {
            out += (this.tokens[i].toString()) + "\n";
        }
        return out;
    }

    scanToken() {
        let c = this.advance();

        if (c == "\n") {
            this.line++;
        }

        // find custom literals 
        if (c in literals) {
            var [terminal, token] = literals[c];
            return this.scanString(terminal, token);
        }
        if (isDigit(c)) {
            return this.scanNumber();
        }
        if (isAlphaNumeric(c)) {
            return this.scanLiteral();
        }
        if (c == "/" && this.peek() == "/") {
            return this.scanComment();
        }

        // TODO: untested
        if(c == '\\' && (this.peek() in singleTokens)){
            c = this.advance(); 
            if(c == "\n"){ // don't include newline literals 
                return;
            }
            this.advance();
            return this.addToken(tk.LITERAL);
        }
        // find tokens 
        if (c in singleTokens) {
            return this.addToken(singleTokens[c]);
        }

        //return this.error("unparsed character " + c );
    }

    scanString(boundary, tokenType) {
        // "hero @hero.name was here" => "hero" @hero.name "was here"
        // "too many {@compound}{@word}isms" => "too many" @compound @word "isms"

        while (this.peek() != boundary && !this.isAtEnd()) {
            let c = this.peek();
            switch(c){
                case "\n":
                    this.line++;
                    break;
                case "\\":
                    // TODO: Put string escapes here
                    break;
                // Parse {interpolation}
                case "{": {
                    this.advance();
                    let val = this.source.substring(this.start + 1, this.current - 1);
                    if(val.length > 0){
                        this.addToken(tokenType, val);
                    }
                    while(this.peek() != "}" && !this.isAtEnd()){
                        this.start = this.current;
                        this.scanToken();
                    }
                    this.start = this.current;
                        break;
                    }
                // parse "#interpolation"
                case "@":
                case "#":
                case "$":{
                    this.advance();
                    let val = this.source.substring(this.start + 1, this.current - 1);
                    if(val.length > 0){
                        this.addToken(tokenType, val);
                    }

                    this.addToken(singleTokens[c], c);
                    while(!([" ", "\n", "\t", boundary].includes(this.peek())) && !this.isAtEnd()){
                        this.start = this.current;
                        this.scanToken();
                    }
                    this.current --;
                    this.start = this.current;
                   break;
                }
                default:
                    break;
            }
            this.advance();
        }
        if (this.isAtEnd()) {
            return this.error("Unterminated string, could not find boundary " + boundary);
        }
        this.advance();
        let val = this.source.substring(this.start + 1, this.current - 1);
        if(val.length > 0){
            this.addToken(tokenType, val);
        }
    }
    scanNumber() {
        while (isDigit(this.peek())) this.advance();

        if (this.peek() == '.' && isDigit(this.peekNext())) {
            this.advance();
        }

        while (isDigit(this.peek())) this.advance();
        return this.addToken(tk.NUMBER, parseFloat(this.source.substring(this.start, this.current)));
    }

    scanLiteral() {
        while (isAlphaNumeric(this.peek())) this.advance();
        return this.addToken(tk.LITERAL);
    }

    scanComment() {
        while (this.peek() != "\n" && !this.isAtEnd()) {
            this.advance();
        }
    }

    // end scanning functions

/// helper functions for moving along the source 
    error(message) {
        throw new ScannerError("Error at " + this.line + ":" + this.current + ": " + message, this.peek());
    }
    isAtEnd() {
        return this.current >= this.source.length;
    }
    advance() {
        this.current++;
        return this.source.charAt(this.current - 1);
    }
    addToken(type, val = null) {
        if (type == null) {
            return false;
        };
        let text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, this.line, val));
        return true;
    }
    
    match(expected) {                 
        if (this.isAtEnd()) return false;                         
        if (this.source.charAt(this.current) != expected) return false;
        this.current++;                                           
        return true;
    }

    peek() {
        if (this.isAtEnd()) return '\0';
        return this.source.charAt(this.current);
    }
    peekNext() {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source.charAt(this.current + 1);
    }
/// End scanning helper functions 
};