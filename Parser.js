import {makeEnum, MakeTypeclass} from "./kp.js";
import { tk } from "./Token.js";
import {_} from 'lodash';

const ExpressionData = {
    Assignment:['targets', 'values'],
    Base:['type', 'value'],
    Definition:['id', 'assignments'],
    Function:['locator', 'parameters'],
    Locator:['locations'],
    LValue: ['type', 'locator'],
    Number:['values'],
    RValue: ['type', 'locator'],
    SideEffect:['ref', 'op', 'value'],
    Statement: ['statements'],
};
// I'm so funny 
export const [Ex, pr] = MakeTypeclass(ExpressionData);

export class Parser {

    constructor(tokens){
     this.tokens = tokens;
     this.current = 0;
     }   

     ParserError(message, token){
        token = token || this.peek();
       return {
           message: message,
           token: token
       };
    }

 // Parser helper functions 
 peek(){
    return this.tokens[this.current];
 }
 check(symbol){
    if(this.isAtEnd()) return false;
    return this.peek().symbol == symbol;
 }
 advance(){
     if(!this.isAtEnd()) this.current++;
     return this.previous();
 } 
 previous(){
     return this.tokens[this.current - 1];
 }
 isAtEnd(){
    return this.peek().symbol == tk.EOF;
 }

 // i think this is the right layer to say... log if tokens is undefined or empty
  match(...tokens) {
      if(! _.every(tokens)){
          throw this.ParserError("One or more tokens to match are undefined! " + JSON.stringify(tokens));
      }
      let matched = tokens.some( (t)=>this.check(t) );
      if(matched){
          this.advance();
      }
      return matched;
}


// End parser helper functions 

parse_main(){ 
    this.definitions = [];
    while(!this.isAtEnd()){
        if(!this.check(tk.LEFT_BRACKET)){
            break;
        }
        let def = this.parse_definition();
        this.definitions.push(def);
    }
    return this.definitions;
}

 //  trailing=true todo: allow for trailing break_tokens
 //  minimum=0 todo: allow for min/max counts parse_fn
 // TODO: capture break token[s]? 
find_many(parse_fn, break_token, must_find_one = true) {
    if(!(parse_fn instanceof Function)){
        let token = parse_fn;
        parse_fn = ()=>{
            if(this.match(token))
                return this.previous();
            throw this.ParserError("Could not find token " + token.toString());
        };
    }

    let ret = [];
    do {
        let curtoken = this.current;
        try{
            let parsed = parse_fn.apply(this);
            ret.push(parsed);
        } catch(e){
            // TODO: this might cause more problems than it solves. 
            // should fix trailing commas
            this.current = curtoken;
            console.log("Ignoring message " + e.message + " and popping back to " + this.current);
            break;
        }
    }
    while (this.match(break_token, tk.EOF));
    if(must_find_one && ret.length == 0){
        throw this.ParserError("Could not find a match for find many " + break_token.toString() );
    }
    return ret;
}

// TODO: parse side effect and/or math?
// base_expr -> list(LITERAL) | STRING | number_expr | rvalue | side_effect
parse_base_expr(){
    let sym = this.peek();
    let value = null;
    let type = null;
    switch(sym.symbol){
        case tk.LITERAL:
            type = "literal";
            value = [];
            while (this.match(tk.LITERAL)) {
                value.push(this.previous());
            }
            break;
        case tk.NUMBER:
            type="number";
            //value = Ex(pr.Number,this.advance());
            value = this.parse_number();
            break;
        case tk.HASH:
        case tk.AT:
        case tk.DOLLAR:
            type="rvalue";
            value=this.parse_rvalue();
            break;
        default:
            throw this.ParserError("this is not a base expression");
    }
    // TODO: Do I need the type if value knows what to do with itself? 
    return Ex(pr.Base, type, value);
}

// TODO: should this be statement_expr -> list(base_expr*, ",")
// statement_expr -> list( base_expr, ",") 
parse_statement(){
    let ret = this.find_many(this.parse_base_expr, tk.COMMA);
    return Ex(pr.Statement, ret);
}
// number_expr -> NUMBER | list(NUMBER, ":")
parse_number(){
    let vals = this.find_many(tk.NUMBER, tk.COLON);
    return Ex(pr.Number,vals); 
}

// not sure if i want that as ":", or should it be = ?
// should lvalue lists use a ";" as well?  
// assignment -> list(lvalue, ",") ":" list(statement_expr, "|")
parse_assignment(){
    let targets = this.find_many(this.parse_lvalue, tk.COMMA);
    if(!this.match(tk.COLON)){
        throw this.ParserError("Missing ':' in assignment definition");
    }
    let values = this.find_many(this.parse_statement, tk.BAR);
    return Ex(pr.Assignment, targets, values);
}

// hmm slashes or dots? slashes let me do .. 
// person.height.cm for example 
// TODO: players.0.name, or maybe players.#.name for like... random select?

// locator_expr -> list(LITERAL, ".")
parse_locator(){
    let ret = this.find_many(tk.LITERAL, tk.DOT);
    return Ex(pr.Locator, ret);
}

// definition -> "[" LITERAL "]" list(assignment, ';')
    parse_definition(){
        if(!this.match(tk.LEFT_BRACKET)){
            throw this.ParserError("Definitions must start with a [");
        } 
        if(!this.match(tk.LITERAL)){
            throw this.ParserError("Only literals are allowd in the ");
        }
        let name = this.previous();

        if(!this.match(tk.RIGHT_BRACKET)) {
            throw this.ParserError("Missing End bracket for object definition");
        }
        let assignments = this.find_many(this.parse_assignment, tk.SEMICOLON);
        let defExpr = Ex(pr.Definition, name, assignments);
        return defExpr;
    }
    // lvalue -> ("$")? locator_expr
    parse_lvalue(){
        let type = "";
        if(this.check(tk.DOLLAR)){
            type = "ABSOLUTE";
        } else {
            type = "RELATIVE";
        } 
        let reference = this.parse_locator();
        return  Ex(pr.LValue, type, reference);
    }
    // rvalue -> ("#","@","$") locator_expr 
    parse_rvalue(){
        if(!this.match(tk.AT, tk.DOLLAR, tk.HASH)){
            throw this.ParserError("target reference should begin with @ or $");
        } 
        var type = this.previous();
        var location = this.parse_locator();
        return new Ex(pr.RValue, type, location);
    }
}

