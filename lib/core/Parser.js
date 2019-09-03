import {makeEnum, MakeTypeclass} from "./kp.js";
import { tk } from "./Token.js";
import {_} from 'lodash';

const ExpressionData = {
    Assignment: ['targets', 'values'],
    Base: ['value'],
    Definition: ['id', 'assignments'],
    ExFunction: ['locator', 'parameters'],
    Locator: ['location'],
    LValue: ['reftype', 'locator'],
    Number: ['values'],
    RValue: ['reftype', 'locator'],
    SideEffect: ['ref', 'op', 'value'],
    Statement: ['statements'],
};
// I'm so funny 
export const [Ex, pr] = MakeTypeclass(ExpressionData);

class ParserError extends Error {
    constructor(message, token) {
        super("Parser error at " + token + ": " + message);
        this.name = "ParserError";
    }
}
export class Parser {

    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
        this.parse_main();
    }

    // Parser helper functions 
    peek() {
        return this.tokens[this.current];
    }
    check(symbol) {
        if (this.isAtEnd()) return false;
        return this.peek().symbol == symbol;
    }
    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }
    previous() {
        return this.tokens[this.current - 1];
    }
    isAtEnd() {
        return this.peek().symbol == tk.EOF || (this.current > this.tokens.length);
    }
    mustMatch(tokens, errorMessage){
        if (!(tokens instanceof Array)){
            tokens = [tokens];
        }
        return this.match(...tokens) || this.error(errorMessage);
    }

    // i think this is the right layer to say... log if tokens is undefined or empty
    match(...tokens) {
        if (!_.every(tokens)) {
            this.error("One or more tokens to match are undefined! " + JSON.stringify(tokens));
        }
        let matched = tokens.some((t) => this.check(t));
        if (matched) {
            this.advance();
        }
        return matched;
    }


    error(message){
        throw new ParserError(message, this.peek());
    }
    // End parser helper functions 

    parse_main() {
        this.definitions = [];
        this.errors = [];
        while (!this.isAtEnd()) {
            if (!this.check(tk.LEFT_BRACKET)) {
                console.log("Breaking out of a definition because there's no [");
                break;
            }
            try{
                let def = this.parse_definition();
                this.definitions.push(def);
            } catch(e){
                this.errors.push(e);
                this.synchronize();
            }
        }
        if(this.errors.length != 0){
            return (this.definitions = []);
        }
        return this.definitions;
    }

    // Continue until reaching a [DEFINITION] 
    synchronize(){
        console.log("Recovering from error in " + this.curDefinition.value);
        while(!this.isAtEnd() && (this.peek() != tk.LEFT_BRACKET)){
            this.advance();
        }
    }


    // TODO: Should I just have an "end tokens" that signifies the end of the list? 
    find_many(parse_fn, break_token, must_find_one = true, allow_trailing = true) {
        // map tk.SYMBOL => function to find the symbol
        if (!(parse_fn instanceof Function)) {
            let token = parse_fn;
            parse_fn = () => {
                if (this.match(token))
                    return this.previous();
                this.error("Could not find token " + token.toString());
            };
        }

        let ret = [];
        do {
            let curtoken = this.current;
            if(curtoken ==  tk.EOF || curtoken == tk.NEWLINE) 
            {
                console.log("breaking out of find_many  at " + curtoken.toString());
                break;
            }

            try {
                let parsed = parse_fn.apply(this);
                ret.push(parsed);
            } catch (e) {
                if(allow_trailing && e instanceof ParserError){
                    // TODO: this might cause more problems than it solves. 
                    this.current = curtoken;
                    console.log("Ignoring message " + e.message + " and popping back to " + this.tokens[this.current].toString());
                    break;
                }
                else {
                    throw e;
                }
            }
        }
        while (this.match(break_token));
        if (must_find_one && ret.length == 0) {
            this.error("Could not find a match for find many " + break_token.toString());
        }
        return ret;
    }

    // TODO: parse side effect and/or math?
    // base_expr -> many(LITERAL | STRING | number_expr | rvalue | side_effect)
    parse_base_expr() {
        let values = [];
        let done = false;
        while(this.peek() != tk.EOF && !done){
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
                default:
                    done = true;
                    break;
            }
        }
        if(values.length == 0){
            this.error("this is not a base expression");
        }
        return Ex(pr.Base, values);
    }

    // statement_expr -> list( base_expr, ",") 
    parse_statement() {
        let ret = [this.parse_base_expr()];
        while(this.match(tk.COMMA)){
            // Allow trailing commas when followed by a bar
            if(this.peek(tk.BAR)){
                break;
            }
            ret.push(this.parse_base_expr());
        }
        
        // let ret = this.find_many(this.parse_base_expr, tk.COMMA, false, true?);
        return Ex(pr.Statement, ret);
    }
    // number_expr -> NUMBER | list(NUMBER, ":")
    parse_number() {
        let vals = [this.mustMatch(tk.NUMBER, "Numeric constants must start with a number")];
        while(tk.match(tk.COLON)){
            vals.push(this.mustMatch(tk.NUMBER, "Trailing : found in number sequence!"));
        }
        //let vals = this.find_many(tk.NUMBER, tk.COLON, true, false);
        return Ex(pr.Number, vals);
    }

    // assignment -> list(lvalue, ",") "=" list(statement_expr, "|")
    parse_assignment() {
        let targets = [this.parse_lvalue()];
        while(this.match(tk.COMMA)){
            if(tk.peek(tk.EQUALS)){
                break;
            }
            targets.push(this.parse_lvalue);
        }

        // let targets = this.find_many(this.parse_lvalue, tk.COMMA, true, true);
        this.mustMatch(tk.EQUALS, "Missing '=' in assignment definition");
        let values = this.parse_statement();
        while(this.match(tk.BAR)){
            values.push(this.parse_statement());
        }

        // let values = this.find_many(this.parse_statement, tk.BAR, true, true);
        return Ex(pr.Assignment, targets, values);
    }

    // hmm slashes or dots? slashes let me do .. 
    // person.height.cm for example 
    // TODO: players.0.name, or maybe players.#.name for like... random select?

    // locator_expr -> list(LITERAL, ".")
    parse_locator() {
        // no trailing 
        let loc = [this.mustMatch(tk.LITERAL, "No literal found for locator")];
        while(this.match(tk.DOT)){
            let l = this.mustMatch(tk.LITERAL, "No literal found after '.' in locator expression");
            loc.push(l);
        }
        // let ret = this.find_many(tk.LITERAL, tk.DOT, true, false);
        return Ex(pr.Locator, ret);
    }

    // definition -> "[" LITERAL "]" list(assignment, ';')
    parse_definition() {
        this.mustMatch(tk.LEFT_BRACKET, "Definitions must start with a [");
        this.mustMatch(tk.LITERAL, "Only literals are allowd in definition names");

        let name = this.previous();
        this.curDefinition = name;

        this.mustMatch(tk.RIGHT_BRACKET, "Missing End bracket for object definition");

        let assignments = [this.parse_assignment];
        while(this.match(tk.SEMICOLON)){
            // Allow trailing semocolons when followed a [
            if(this.peek(tk.LEFT_BRACKET)){
                break;
            }
            let curAssignment = this.parse_assignment();
            assignments.push(curAssignment);
        }
        //let assignments = this.find_many(this.parse_assignment, tk.SEMICOLON);
        let defExpr = Ex(pr.Definition, name, assignments);
        return defExpr;
    }
    // lvalue -> ("$")? locator_expr
    parse_lvalue() {
        let reftype = "";
        if (this.check(tk.DOLLAR)) {
            reftype = "ABSOLUTE";
        } else {
            reftype = "RELATIVE";
        }
        let reference = this.parse_locator();
        return Ex(pr.LValue, reftype, reference);
    }
    // rvalue -> ("#","@","$") locator_expr 
    parse_rvalue() {
        this.mustMatch([tk.AT, tk.DOLLAR, tk.HASH], "target reference should begin with @, # or $");
        var reftype = this.previous();
        var location = this.parse_locator();
        return new Ex(pr.RValue, reftype, location);
    }

    parse_function_expr() {
        this.mustMatch(tk.BANG, "Functions must start with an '!'");
        this.mustMatch(tk.LITERAL, "Function names must be a literal value");
        let loc = this.previous();
        
        this.mustMatch(tk.LEFT_PAREN, "Function parameters must start with a (");
        let params = [this.parse_base_expr()];
        while(this.match(tk.COMMA)){
            if(this.peek(tk.RIGHT_PAREN)){
                this.error("No trailing commas allowed in function expressions!");
            }
            params.push(this.parse_base_expr());
        }
        // let params = this.find_many(this.parse_base_expr, tk.COMMA, false, true);
        this.mustMatch(tk.RIGHT_PAREN, "Function parameters must end with a )");

        return new Ex(pr.ExFunction, loc, params);
    }
}
