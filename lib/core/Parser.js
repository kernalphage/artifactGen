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
        let m = this.match(...tokens);
        return m ? m : this.error(errorMessage + "(Expected [" + _.map(tokens, (t) => t.toString()).join(", ") + "])");
    }

    match(...tokens) {
        if (!_.every(tokens)) {
            this.error("One or more tokens to match are undefined! " + JSON.stringify(tokens));
        }
        let matched = tokens.some((t) => this.check(t));
        if (matched) {
            return this.advance();
        }
        return false;
    }
    warn(message){
        let token = this.peek();
        message = "Warning at " + token + ": " + message;
        console.log(message);
        this.warnings.push(message);
    }

    error(message){
        throw new ParserError(message, this.peek());
    }
    // End parser helper functions 

    parse_main() {
        this.definitions = [];
        this.errors = [];
        this.warnings = [];
        while (!this.isAtEnd()) {
            try{
                if (!this.check(tk.LEFT_BRACKET)) {
                    this.error("Expecting definintion start '['");
                }
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

    // Continue until reaching a new [DEFINITION] 
    synchronize(){
        this.warn("Recovering from error in definition " + this.curDefinition.value);
        while(!this.isAtEnd() && (this.peek() != tk.LEFT_BRACKET)){
            this.advance();
        }
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
                case tk.BANG:
                    values.push(this.parse_function_expr());
                    break;
                case tk.EQUALS:
                    this.error("Found an unexpected character in base expression (are you missing a semicolon?) ");
                    done = true;
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

    // TODO: Error if a certain token is found after sepToken? 
    // TODO: Does this work if 0? 
    find_some(parseFn, sepToken, endToken, mustFind){

        // turn a Sym(token) into find token
        if (!(parseFn instanceof Function)) {
            let sym = parseFn;
            parseFn = () => {
                return this.mustMatch(sym, "Expecting symbol " + sym.toString());
            };
        }

        let ret = [];
        do{
            if(this.check(endToken)){
                this.warn("breaking at trailing separator at " + this.peek());
                break;
            }
            let parsed = parseFn.apply(this);
            ret.push(parsed);        
        } while(this.match(sepToken));
        return ret;
    }

    // statement_expr -> list( base_expr, ",") 
    parse_statement() {
        let values = this.find_some(this.parse_base_expr, tk.COMMA, tk.BAR);       
        return Ex(pr.Statement, values);
    }

    // number_expr -> NUMBER | list(NUMBER, ":")
    parse_number() {
        let vals = this.find_some(tk.NUMBER, tk.COLON);
        return Ex(pr.Number, vals);
    }

    // assignment -> list(lvalue, ",") "=" list(statement_expr, "|")
    parse_assignment() {
        let targets = this.find_some(this.parse_lvalue, tk.COMMA, tk.EQUALS);
        this.mustMatch(tk.EQUALS, "Missing '=' in assignment definition");
        let values = this.find_some(this.parse_statement, tk.BAR, tk.SEMICOLON);

        return Ex(pr.Assignment, targets, values);
    }

    // hmm slashes or dots? slashes let me do @/../cousin 
    // TODO: players.0.name, or players.?.name to do... random select?
    // person.height.cm for example 
    // locator_expr -> list(LITERAL, ".")
    parse_locator() {
        let loc = this.find_some(tk.LITERAL, tk.DOT);
        return Ex(pr.Locator, loc);
    }

    // definition -> "[" LITERAL "]" list(assignment, ';')
    parse_definition() {
        this.mustMatch(tk.LEFT_BRACKET, "Definitions must start with a [");
        let name = this.mustMatch(tk.LITERAL, "Only literals are allowed in definition names");
        this.curDefinition = name;
        this.mustMatch(tk.RIGHT_BRACKET, "Missing End bracket for object definition");

        let assignments = this.find_some(this.parse_assignment, tk.SEMICOLON, tk.LEFT_BRACKET);

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


    // function_expr -> "!" LITERAL group_expr
    parse_function_expr() {
        this.mustMatch(tk.BANG, "Functions must start with an '!'");
        this.mustMatch(tk.LITERAL, "Function names must be a literal value");
        let loc = this.previous();
        
        this.mustMatch(tk.LEFT_PAREN, "Function parameters must start with a (");
        let params = this.find_some(this.parse_base_expr, tk.COMMA);
        this.mustMatch(tk.RIGHT_PAREN, "Function parameters must end with a )");

        return new Ex(pr.ExFunction, loc, params);
    }
}
