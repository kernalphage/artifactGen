import { isLiteral, isDigit, getWholeChar } from "./kp";
import { tk, Token } from "./Token";
import * as _ from "lodash";

const singleTokens: Record<string, tk> = {
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
    "+": tk.PLUS,
    "?": tk.QUESTION,
    "]": tk.RIGHT_BRACKET,
    "}": tk.RIGHT_CURLY,
    ")": tk.RIGHT_PAREN,
    ";": tk.SEMICOLON,
    "/": tk.SLASH,
    "*": tk.STAR,
};
// TODO: extract to a whitespace mapping list here? do I want my language to be whitespace aware?
// "\n": tk.NEWLINE,


const literals: Record<string, [string, tk]> = {
    '"': ['"', tk.LITERAL],
    "'": ["'", tk.LITERAL],
};

class ScannerError extends Error {
    constructor(message: string, token: Token) {
        super("Scan error at token " + token + ": " + message);
        this.name = "ScannerError";
    }
}

export class Scanner {
    private start: number = 0;
    private current: number = 0;
    private line: number = 1;
    readonly tokens: Token[] = [];
    readonly errors: ScannerError[] = []; // Error[]? 

    constructor(readonly source: string) {
        this._scanTokens();
    }

    _scanTokens(): void {
        while (!this.isAtEnd()) {
            this.start = this.current;
            try {
                this.scanToken();
            } catch (e) {
                if (e instanceof ScannerError) {
                    this.errors.push(e);
                } else {
                    this.errors.push(new ScannerError("Unexpected error: " + e.message, this.peekToken()));
                }
                break;
            }
        }

        this.tokens.push(new Token(tk.EOF, "", this.line));

        if (this.errors.length > 0) {
            throw ("Could not parse source " + JSON.stringify(this.errors));
        }
    }

    export(): string {
        var out = "Source file: \n";
        out += "Lines: " + this.line + "\n";
        return _.map(this.tokens,
            (t: Token) => { t.toString() }
        ).join("\n");
    }

    scanToken(): void {
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
        if (isLiteral(c)) {
            return this.scanLiteral();
        }
        if (c == "/" && this.peek() == "/") {
            return this.scanComment();
        }
/*
        // TODO: untested
        if (c == '\\' && (this.peek() in singleTokens)) {
            c = this.advance();
            if (c == "\n") { // don't include newline literals 
                return;
            }
            this.advance();
            return this.addToken(tk.LITERAL);
        }
        */
        // find tokens 
        if (c in singleTokens) {
            var t = singleTokens[c];
            return this.addToken(t);
        }

        //throw this.error("unparsed character " + c );
    }

    scanString(boundary: String, tokenType: tk): void {
        // "hero @hero.name was here" => "hero" @hero.name "was here"
        // "too many {@compound}{@word}isms" => "too many" @compound @word "isms"

        while (this.peek() != boundary && !this.isAtEnd()) {
            let c = this.peek();
            switch (c) {
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
                // parse "#interpolation"
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

    scanNumber(): void {
        while (isDigit(this.peek())) this.advance();

        if (this.peek() == '.' && isDigit(this.peekNext())) {
            this.advance();
        }

        while (isDigit(this.peek())) this.advance();
        return this.addToken(tk.NUMBER, parseFloat(this.source.substring(this.start, this.current)));
    }

    isLiteraLCharacter(c: string): boolean {
        if (c in singleTokens) return false;
        if (c in literals) return false;
        return true;
    }

    scanLiteral(): void {
        while (this.isLiteraLCharacter(this.peek())) this.advance();
        return this.addToken(tk.LITERAL);
    }

    scanComment(): void {
        while (this.peek() != "\n" && !this.isAtEnd()) {
            this.advance();
        }
    }

    // end scanning functions

    /// helper functions for moving along the source 
    safeCharAt(str: string, i: number): string {
        return str[i];
        /*
        // TODO: Add unicode back in
        do {
            let c = getWholeChar(str, i);
            if (c === null) {
                i++;
                console.log("safe char at" + i);
            } else {
                return c;
            }
        } while (true);
        */
    }

    error(message: String): ScannerError {
        return new ScannerError("Error at " + this.line + ":" + this.current + ": " + message, this.peekToken());
    }

    isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    advance(): string {
        let c:(string|null) = this.peek();

        this.current++;
        /*
        let i = 100;
        do {
            console.log(this.current);
        } while ((c = getWholeChar(this.source, this.current)) === null);
        */
        return c;
    }

    addToken(type: tk, val?: any): void {
        let text = this.source.substring(this.start, this.current);
        console.log("adding token " + type + ":" + text);
        this.tokens.push(new Token(type, text, this.line, val));
    }

    match(expected: string) {
        if (this.isAtEnd()) return false;
        if (this.peek() != expected) return false;
        this.current++;
        return true;
    }

    peekToken(): Token {
        return this.tokens[this.tokens.length - 1];
    }
    peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.safeCharAt(this.source, this.current);
    }

    peekNext(): string {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.safeCharAt(this.source, this.current + 1);
    }
    /// End scanning helper functions 
};