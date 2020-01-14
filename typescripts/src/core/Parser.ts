import { tk, Token } from "./Token";
import * as _ from "lodash";
import { Expression, Definition, Base, Statement, Assignment, Locator, LValue, RValue, ExFunction, Reftype, EXNumber } from "./Expressions";

class UnexpectedToken extends Error {
    constructor(message: string, token: Token) {
        super("Unexpected token " + token + ": " + message);
        this.name = "UnexpectedToken";
    }
}
class MissingToken extends Error {
    constructor(message: string, token: Token) {
        super("Parser error at " + token + ": " + message);
        this.name = "MissingToken";
    }
};

export class Parser {
    current = 0;
    definitions: Expression[] = [];
    readonly errors: Error[] = [];
    warnings: string[] = [];
    curDefinition: string = "";

    constructor(readonly tokens: Token[]) {
        this.parse_main();
    }

    // Parser helper functions 
    peek(): Token {
        return this.tokens[this.current];
    }
    check(symbol: tk): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().symbol == symbol;
    }
    advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }
    previous(): Token {
        return this.tokens[this.current - 1];
    }
    isAtEnd(): Boolean {
        return (this.current >= this.tokens.length) || this.peek().symbol == tk.EOF;
    }
    mustMatch(tokens: (tk | tk[]), errorMessage: string): void {
        if (!(tokens instanceof Array)) {
            tokens = [tokens];
        }
        let m = this.match(...tokens);

        if (!m) {
            let expectedTokens = "(Expected [" + _.map(tokens, (t) => t.toString()).join(", ") + "])";
            this.error(MissingToken, errorMessage + expectedTokens);
        }
    }
    match(...tokens: tk[]): boolean {
        let matched = tokens.some((t) => this.check(t));
        if (matched) {
            this.advance()
            return true;
        }
        return false;
    }
    warn(message: string): void {
        let token = this.peek();
        message = "Warning at " + token + ": " + message;
        console.log(message);
        this.warnings.push(message);
    }

    curLine():string{
        return _.filter(this.tokens, { line: this.peek().line })
            .map((t: Token) => t.string).join("");
    }
    error(ErrorType: (typeof UnexpectedToken | typeof MissingToken), message: String): never {
        let curLine =this.curLine();
        throw new ErrorType(message + " around " + curLine, this.peek());
    }
    // End parser helper functions 

    parse_main() {
        while (!this.isAtEnd()) {
            try {
                if (!this.check(tk.LEFT_BRACKET)) {
                    this.error(MissingToken, "Expecting definintion start '['");
                }
                let def = this.parse_definition();
                this.definitions.push(def);
            } catch (e) {
                this.errors.push(e);
                this.synchronize();
            }
        }
        if (this.errors.length != 0) {
            return (this.definitions = []);
        }
        return this.definitions;
    }

    // Continue until reaching a new [DEFINITION] 
    synchronize(): void {
        this.warn("Recovering from error in definition " + this.curDefinition);
        while (!this.isAtEnd() && (this.peek().symbol != tk.LEFT_BRACKET)) {
            this.advance();
        }
    }

    // TODO: parse side effect and/or math?
    // base_expr -> many(LITERAL | STRING | number_expr | rvalue | side_effect)
    parse_base_expr(): Base {
        let values = [];
        let done = false;
        while (this.peek().symbol != tk.EOF && !done) {
            let sym = this.peek();
            switch (sym.symbol) {
                case tk.LITERAL:
                    values.push(this.advance());
                    break;
                case tk.NUMBER:
                    values.push(this.parse_number());
                    break;
                case tk.HASH:
                case tk.AT:
                case tk.DOLLAR:
                    values.push(this.parse_rvalue());
                    break;
                case tk.BANG:
                    values.push(this.parse_function_expr());
                    break;
                case tk.EQUALS:
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
        return new Base(values);
    }

    // TODO: Error if a certain token is found after sepToken
    // TODO: Does this work if 0? 
    find_some<T>(parseFn: (() => T), sepToken: tk, endToken?: tk): T[];
    find_some(parseFn: tk, sepToken: tk, endToken?: tk): Token[];

    find_some(parseFn: any, sepToken: tk, endToken?: tk): any[] {
        // parsefn
        if (!(parseFn instanceof Function)) {
            let sym: tk = parseFn;
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

    // statement_expr -> list( base_expr, ",") 
    parse_statement(): Statement {
        let values = this.find_some(this.parse_base_expr, tk.COMMA, tk.BAR);
        return new Statement(values);
    }

    // number_expr -> NUMBER | list(NUMBER, ":")
    parse_number(): EXNumber {
        let vals = this.find_some(tk.NUMBER, tk.COLON);
        let nums = _.map(vals, (t:Token)=>t.value as number);
        return new EXNumber(nums);
    }

    // assignment -> list(lvalue, ",") "=" list(statement_expr, "|")
    parse_assignment(): Assignment {
        let targets = this.find_some(this.parse_lvalue, tk.COMMA, tk.EQUALS);
        this.mustMatch(tk.EQUALS, "Missing '=' in assignment definition");
        let values = this.find_some(this.parse_statement, tk.BAR, tk.SEMICOLON);

        return new Assignment(targets, values);
    }

    // hmm slashes or dots? slashes let me do @/../cousin 
    // TODO: players.0.name, or players.?.name to do... random select?
    // person.height.cm for example 
    // locator_expr -> list(LITERAL, ".")
    parse_locator(): Locator {
        let loc = this.find_some(tk.LITERAL, tk.DOT);
        let locations = _.map(loc, (t) => t.value);
        return new Locator(locations);
    }

    // definition -> "[" LITERAL "]" list(assignment, ';')
    parse_definition(): Definition {
        this.mustMatch(tk.LEFT_BRACKET, "Definitions must start with a [");

        this.mustMatch(tk.LITERAL, "Only literals are allowed in definition names");
        let name = this.curDefinition = this.peek().string;

        this.mustMatch(tk.RIGHT_BRACKET, "Missing End bracket for object definition");

        let assignments = this.find_some(this.parse_assignment, tk.SEMICOLON, tk.LEFT_BRACKET);
        let defExpr = new Definition(name, assignments);
        return defExpr;
    }

    // lvalue -> ("$")? locator_expr
    parse_lvalue(): LValue {
        let reftype: Reftype = "RELATIVE";
        if (this.check(tk.DOLLAR)) {
            reftype = "ABSOLUTE";
        }
        let locator = this.parse_locator();
        return new LValue(reftype, locator);
    }

    // rvalue -> ("#","@","$") locator_expr 
    parse_rvalue(): RValue {
        this.mustMatch([tk.AT, tk.DOLLAR, tk.HASH], "target reference should begin with @, # or $");
        let reftype: Reftype = "RELATIVE"
        switch (this.previous().symbol) {
            case tk.HASH:
            case tk.AT:
                reftype = "RELATIVE";
            case tk.DOLLAR:
                reftype = "ABSOLUTE";
        }
        var locator = this.parse_locator();
        return new RValue(reftype, locator);
    }


    // function_expr -> "!" LITERAL group_expr
    parse_function_expr(): ExFunction {
        this.mustMatch(tk.BANG, "Functions must start with an '!'");
        this.mustMatch(tk.LITERAL, "Function names must be a literal value");
        let loc = this.previous();

        this.mustMatch(tk.LEFT_PAREN, "Function parameters must start with a (");
        let params = this.find_some(this.parse_base_expr, tk.COMMA);
        this.mustMatch(tk.RIGHT_PAREN, "Function parameters must end with a )");

        return new ExFunction(loc, params);
    }
}
