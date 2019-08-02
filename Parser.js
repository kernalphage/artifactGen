import {makeEnum} from "./kp.js";
import { tk } from "./Token.js";

let ExpressionTypes = {
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
}

export const Expr = makeEnum([
    ExpressionTypes.keys
]);

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
     if(!this.isAtEnd()) this.current++;
     return this.previous();
 } 
 previous(){
     return this.tokens[this.current - 1];
 }
 isAtEnd(){
    return this.peek().type == tk.EOF;
 }
  match(...tokens) {
      matched = _.any(tokens, (t)=>this.check(t) );
      if(matched){
          this.advance();
      }
      return matched;    matched = _.any(tokens, (t)=>this.check(t) );
      if(matched){
          this.advance();
      }
      return matched;
} 

// this might be just list without a boundary token
match_all(...tokens){
    let ret = [];
    while(this.match(tokens)){
        ret.push(this.previous());
    }
    return ret;
}
// End parser helper functions 

parse_main(){
    let definitions = [];
    while(this.isAtEnd()){
        definitions.push(this.parse_definition);
    }
    return definitions;
}

 //  trailing=true todo: allow for trailing break_tokens
 //  minimum=0 todo: allow for min/max counts parse_fn
 // TODO: capture break token[s]? 
find_many(parse_fn, break_token) {
    if(!(parse_fn instanceof Function)){
        let token = parse_fn;
        parse_fn = ()=>{
            if(this.match(token))
                return this.previous();
            throw new ParseError("Could not find token " + token);
        };
    }

    let ret = [];
    do {
        let parsed = parse_fn();
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
    switch(sym){
        case tk.LITERAL:
            value = this.match_all(tk.LITERAL);
            break;
        case tk.STRING:
            value = this.advance();
            break;
        case tk.NUMBER:
            value = this.parse_number();
            break;
        default:
            throw new ParseError("this is not a base expression");
    }
    return new BaseExpr(value);
}

// statement_expr -> list( base_expr, ",") 
parse_statement(){
    return new Statement(this.find_many(this.parse_base_expr, ","));
}
// number_expr -> NUMBER | list(NUMBER, ":")
parse_number(){
    let vals = this.parse_numberfind_many(tk.NUMBER, ":");
    return new NumberExpression(vals); 
}
// not sure if i want that as ":", or should it be = ?
// should target lists have a ";" as well?  
// assignment -> list(lvalue, ",") ":" list(statement_expr, "|")
parse_assignment(){
    let targets = this.find_many(parse_lvalue, ",");
    if(!this.match(tk.COLON)){
        throw new ParseError("Missing ':' in statement definition");
    }
    let values = this.find_many(parse_value, "|");
    return new AssignmentExpr(targets, values);
}

parse_target(){
    if(!this.match(tk.AT, tk.DOLLAR)){
        throw new ParseError("target reference should begin with @ or $");
    }
    let refType = this.previous();
    let location = this.parse_locator();
    return TargetExpr(refType, location);
}

// hmm slashes or dots? slashes let me do .. 
// person.height.cm for example 
// TODO: players.0.name, or maybe players.#.name for like... random select?

// locator_expr -> list(LITERAL, ".")
parse_locator(){
    return this.find_many(tk.LITERAL, tk.PERIOD);
}
 
parse_definition_ref(){
    if(!this.match(tk.HASH)){
        throw new ParserError("Definition refs must start with a #");
    } 
    return new DefinitionRefExpr(this.parse_locator());
}
parse_tag_ref(){
    if(!this.match(tk.LEFT_CURLY)){
        throw new ParserError("tag references must start with {");
    }
    let loc = this.parse_locator();
    if(!this.match(tk.RIGHT_CURLY)){
        throw new ParserError("tag references must end with {");
    }
    return new TagRefExpr(loc);
}
parse_function(){
    //ugh
}

parse_sideeffect(){
    // ugh
}
// definition -> "[" LITERAL "]" list(assignment, ;)
    parse_definition(){
        let defExpr = new DefExpr();
        if(!this.match(tk.LEFT_BRACKET)){
            return;
        } 
        if(!this.match(tk.LITERAL)){
            throw new ParserError("Only literals are allowd in the ")
        }
        defExpr.name = this.previous();

        if(!this.match(tk.RIGHT_BRACKET)) {
            throw new ParseError("Missing End bracket for object definition");
        }
        defExpr.assignments = find_many(this.parse_assignment, tk.SEMICOLON);
        return defExpr;
    }
    // lvalue -> ("$")? locator_expr
    parse_lvalue(){
        let lvalue = new LValueExpr();
        if(this.check(tk.DOLLAR)){
            lvalue.type = "ABSOLUTE";
        } else {
            lvalue.type = "RELATIVE";
        } 
        lvalue.reference = this.find_many(this.parse_locator, tk.DOT);
        return lvalue;
    }
}

