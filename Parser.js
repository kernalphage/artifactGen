import {makeEnum, MakeTypeclass} from "./kp.js";
import { tk } from "./Token.js";
import {_} from 'lodash';

const ExpressionData = {
    Definition:['id', 'assignments'],
    Assignment:['targets', 'values'],
    Target:['reftype', 'locator'],
    Locator:['locations'],
    Statement: ['statements'],
    Base:['type', 'value'],
    Number:['values'],
    SideEffect:['ref', 'op', 'value'],
    Reference:['type', 'locator'], // might need definition and tag ref??
    Function:['locator', 'parameters'],
    LValue: ['type', 'locator'],
};
// I'm so funny 
const [Ex, pr] = MakeTypeclass(ExpressionData);
let myNumbers = [2,4,6,8];
let curNum = Ex(pr.Number,myNumbers); 


class ParserError {
    constructor(message, token){
        this.message = message;
        this.token = token;
    }
}

export class Parser {
 constructor(tokens){
     this.tokens = tokens;
     this.current = 0;
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
     console.log("advancing past " + this.peek());
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
        console.log("starting parse at token " + this.peek().toString());
        let def = this.parse_definition();
        this.definitions.push(def);
    }
    return this.definitions;
}

 //  trailing=true todo: allow for trailing break_tokens
 //  minimum=0 todo: allow for min/max counts parse_fn
 // TODO: capture break token[s]? 
 // TODO: Bindings can suck my dick
 
find_many(parse_fn, break_token) {
    if(!(parse_fn instanceof Function)){
        let token = parse_fn;
        parse_fn = ()=>{
            if(this.match(token))
                return this.previous();
            throw new ParserError("Could not find token " + token);
        };
    }

    let ret = [];
    do {
        let parsed = parse_fn.apply(this);
        ret.push(parsed);
    }
    while(this.match(break_token));
    return ret;
}

// TODO: parse side effect or math?
// base_expr -> list(LITERAL) | STRING | number_expr | rvalue | side_effect
parse_base_expr(){
    let sym = this.peek();
    let value = null;
    let type = null;
    switch(sym.symbol){
        case tk.LITERAL:
        case tk.STRING:
            type = "literal";
            value = [];
            while(this.match(tk.STRING, tk.LITERAL)){
                value.push(this.previous());
            }
            // these are quickly becoming the same thing, if I don't create string parsing
            break;
        case tk.NUMBER:
            type="number";
            value = Ex(pr.Number,this.advance());
            // value = this.parse_number();
            break;
        default:
            throw new ParserError("this is not a base expression");
    }
    // TODO: Do I need the type if value knows what to do with itself? 
    return Ex(pr.Base, type, value);
}

// statement_expr -> list( base_expr, ",") 
parse_statement(){
    return Ex(pr.Statement, this.find_many(this.parse_base_expr, tk.COMMA));
}
// number_expr -> NUMBER | list(NUMBER, ":")
parse_number(){
  //  let vals = this.find_many(tk.NUMBER, tk.COLON);
  //  return Ex(pr.Number,vals); 
}
// not sure if i want that as ":", or should it be = ?
// should target lists have a ";" as well?  
// assignment -> list(lvalue, ",") ":" list(statement_expr, "|")
parse_assignment(){
    let targets = this.find_many(this.parse_lvalue, tk.COMMA);
    if(!this.match(tk.COLON)){
        throw new ParserError("Missing ':' in statement definition");
    }
    let values = this.find_many(this.parse_statement, tk.BAR);
    return Ex(pr.Assignment, targets, values);
}

parse_target(){
    if(!this.match(tk.AT, tk.DOLLAR)){
        throw new ParserError("target reference should begin with @ or $");
    }
    let refType = this.previous();
    let location = this.parse_locator();
    return Ex(pr.Target, refType, location);
}

// hmm slashes or dots? slashes let me do .. 
// person.height.cm for example 
// TODO: players.0.name, or maybe players.#.name for like... random select?

// locator_expr -> list(LITERAL, ".")
parse_locator(){
    return this.find_many(tk.LITERAL, tk.DOT);
}
 
parse_definition_ref(){
    if(!this.match(tk.HASH)){
        throw new ParserError("Definition refs must start with a #");
    } 
    return Ex(pr.DefinitionRef, this.parse_locator());
}
parse_tag_ref(){
    if(!this.match(tk.LEFT_CURLY)){
        throw new ParserError("tag references must start with {");
    }
    let loc = this.parse_locator();
    if(!this.match(tk.RIGHT_CURLY)){
        throw new ParserError("tag references must end with {");
    }
    return Ex(pr.TagRef, loc);
}
parse_function(){
    //ugh
}

parse_sideeffect(){
    // ugh
}
// definition -> "[" LITERAL "]" list(assignment, ;)
    parse_definition(){
        if(!this.match(tk.LEFT_BRACKET)){
            throw new ParserError("Definitions must start with a [");
        } 
        if(!this.match(tk.LITERAL)){
            throw new ParserError("Only literals are allowd in the ");
        }
        let name = this.previous();

        if(!this.match(tk.RIGHT_BRACKET)) {
            throw new ParserError("Missing End bracket for object definition");
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
        let reference = this.find_many(this.parse_locator, tk.DOT);
        return  Ex(pr.LValue, type, reference);;
    }
}

