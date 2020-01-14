"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const Expressions_1 = require("./Expressions");
class UnexpectedToken extends Error {
    constructor(message, token) {
        super("Unexpected token " + token + ": " + message);
        this.name = "UnexpectedToken";
    }
}
class MissingToken extends Error {
    constructor(message, token) {
        super("Parser error at " + token + ": " + message);
        this.name = "MissingToken";
    }
}
;
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
        this.definitions = [];
        this.errors = [];
        this.warnings = [];
        this.curDefinition = "";
        this.parse_main();
    }
    peek() {
        return this.tokens[this.current];
    }
    check(symbol) {
        if (this.isAtEnd())
            return false;
        return this.peek().symbol == symbol;
    }
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.previous();
    }
    previous() {
        return this.tokens[this.current - 1];
    }
    isAtEnd() {
        return (this.current >= this.tokens.length) || this.peek().symbol == 7;
    }
    mustMatch(tokens, errorMessage) {
        if (!(tokens instanceof Array)) {
            tokens = [tokens];
        }
        let m = this.match(...tokens);
        if (!m) {
            let expectedTokens = "(Expected [" + _.map(tokens, (t) => t.toString()).join(", ") + "])";
            this.error(MissingToken, errorMessage + expectedTokens);
        }
    }
    match(...tokens) {
        if (!_.every(tokens)) {
            this.error(UnexpectedToken, "One or more tokens to match are undefined! " + JSON.stringify(tokens));
        }
        let matched = tokens.some((t) => this.check(t));
        if (matched) {
            this.advance();
            return true;
        }
        return false;
    }
    warn(message) {
        let token = this.peek();
        message = "Warning at " + token + ": " + message;
        console.log(message);
        this.warnings.push(message);
    }
    error(ErrorType, message) {
        let curLine = _.filter(this.tokens, { line: this.peek().line }).join(" ");
        throw new ErrorType(message + " around " + curLine, this.peek());
    }
    parse_main() {
        while (!this.isAtEnd()) {
            try {
                if (!this.check(11)) {
                    this.error(MissingToken, "Expecting definintion start '['");
                }
                let def = this.parse_definition();
                this.definitions.push(def);
            }
            catch (e) {
                this.errors.push(e);
                this.synchronize();
            }
        }
        if (this.errors.length != 0) {
            return (this.definitions = []);
        }
        return this.definitions;
    }
    synchronize() {
        this.warn("Recovering from error in definition " + this.curDefinition);
        while (!this.isAtEnd() && (this.peek().symbol != 11)) {
            this.advance();
        }
    }
    parse_base_expr() {
        let values = [];
        let done = false;
        while (this.peek().symbol != 7 && !done) {
            let sym = this.peek();
            switch (sym.symbol) {
                case 14:
                    values.push(this.advance());
                    break;
                case 17:
                    values.push(this.parse_number());
                    break;
                case 10:
                case 0:
                case 5:
                    values.push(this.parse_rvalue());
                    break;
                case 1:
                    values.push(this.parse_function_expr());
                    break;
                case 8:
                    this.error(UnexpectedToken, "Found an unexpected character in base expression (are you missing a semicolon?) ");
                    done = true;
                    break;
                default:
                    done = true;
                    break;
            }
        }
        if (values.length == 0) {
            this.error(MissingToken, "Base expression not found");
        }
        return new Expressions_1.Base(values);
    }
    find_some(parseFn, sepToken, endToken) {
        if (!(parseFn instanceof Function)) {
            let sym = parseFn;
            parseFn = () => {
                this.mustMatch(sym, "Could not find the right token while parsing list separated by " + sepToken.toString());
                return this.previous();
            };
        }
        let ret = [];
        do {
            if (endToken && this.check(endToken)) {
                this.warn("breaking at trailing separator at " + this.peek());
                break;
            }
            let parsed = parseFn.apply(this);
            ret.push(parsed);
        } while (this.match(sepToken));
        return ret;
    }
    parse_statement() {
        let values = this.find_some(this.parse_base_expr, 4, 2);
        return new Expressions_1.Statement(values);
    }
    parse_number() {
        let vals = this.find_some(17, 3);
        return new Number(vals);
    }
    parse_assignment() {
        let targets = this.find_some(this.parse_lvalue, 4, 8);
        this.mustMatch(8, "Missing '=' in assignment definition");
        let values = this.find_some(this.parse_statement, 2, 23);
        return new Expressions_1.Assignment(targets, values);
    }
    parse_locator() {
        let loc = this.find_some(14, 6);
        let locations = _.map(loc, (t) => t.value);
        return new Expressions_1.Locator(locations);
    }
    parse_definition() {
        this.mustMatch(11, "Definitions must start with a [");
        this.mustMatch(14, "Only literals are allowed in definition names");
        let name = this.curDefinition = this.peek().string;
        this.mustMatch(20, "Missing End bracket for object definition");
        let assignments = this.find_some(this.parse_assignment, 23, 11);
        let defExpr = new Expressions_1.Definition(name, assignments);
        return defExpr;
    }
    parse_lvalue() {
        let reftype = "RELATIVE";
        if (this.check(5)) {
            reftype = "ABSOLUTE";
        }
        let locator = this.parse_locator();
        return new Expressions_1.LValue(reftype, locator);
    }
    parse_rvalue() {
        this.mustMatch([0, 5, 10], "target reference should begin with @, # or $");
        let reftype = "RELATIVE";
        switch (this.previous().symbol) {
            case 10:
            case 0:
                reftype = "RELATIVE";
            case 5:
                reftype = "ABSOLUTE";
        }
        var locator = this.parse_locator();
        return new Expressions_1.RValue(reftype, locator);
    }
    parse_function_expr() {
        this.mustMatch(1, "Functions must start with an '!'");
        this.mustMatch(14, "Function names must be a literal value");
        let loc = this.previous();
        this.mustMatch(13, "Function parameters must start with a (");
        let params = this.find_some(this.parse_base_expr, 4);
        this.mustMatch(22, "Function parameters must end with a )");
        return new Expressions_1.ExFunction(loc, params);
    }
}
exports.Parser = Parser;
