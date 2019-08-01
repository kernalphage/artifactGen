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
      return matched;
}
// End parser helper functions 

parse_main(){
    let statements = [];
    while(this.isAtEnd()){
        statements.push(parse_statement);
    }
}
/*
// equality→ comparison(("!=" | "==") comparison) * ;
parse_equality(){
    let expr = parse_comparison();
    while(this.match(tk.EQUALS)){
        let op = this.previous();
        let right = parse_comparison();
        expr = new Expr.Binary(expr, op, right);
    }
} 
//comparison → addition ( ( ">" | ">=" | "<" | "<=" ) addition )* ;
parse_comparison(){
    let expr = parse_addition();
    while(this.match(tk.GREATER, tk.GREATER_EQUAL, tk.LESS, tk.LESS_EQUAL)){
        let op = this.previous();
        let right = parse_addition();
        expr = new Expr.Binary(expr, op, right);
    }
    return expr;
}
//primary → NUMBER | STRING | "false" | "true" | "nil"| "(" expression ")";
parse_primary(){

}
*/
 //  trailing=true todo: allow for trailing break_tokens
 //  minimum=0 todo: allow for min/max counts parse_fn
 // TODO: capture break token[s]? 
find_many(parse_fn, break_token) {
    if(!parse_fn instanceof 'Function'){
        let token = parse_fn;
        parse_fn = ()=>{
            return this.match(token);
        }
    }

    let ret = [];
    do {
        let parsed = parse_fn();
        if(parsed instanceof ParseError){ return parsed; } // i'm not a fan of these being everywhere, I might throw 
        ret.push(parsed);
    }
    while(this.match(break_token))
    return ret;
}
parse_assignment(){
    let target = parse_target();
    // PARSE ERROR? 
    if(!this.match(tk.COLON)){
        return ParseError("Missing ':' in statement definition");
    }
    let value = parse_value();
    // PARSE ERROR? 
    return AssignmentExpr(target, value);
}

parse_target(){
    if(!this.match(tk.AT, tk.DOLLAR)){
        return Parseerror("target reference should begin with @ or $");
    }
    let refType = this.previous();
    let location = this.parse_locator();
    return TargetExpr(refType, location);
}
parse_value(){

}
parse_locator(){
    return this.find_many(tk.LITERAL, tk.PERIOD);
}
parse_base_expr(){

}
parse_number(){

} 
parse_sideeffect(){

}
parse_definition_ref(){

}
parse_tag_ref(){

}
parse_function(){

}

// definition -> "[" LITERAL "]" assignment*
    parse_definition(){
        let defExpr = new DefExpr();

        if(!this.match(tk.LEFT_BRACKET)){
            return;
        } 
        if(!this.match(tk.LITERAL)){
            return ParserError("Only literals are allowd in the ")
        }
        defExpr.name = this.previous();

        if(!this.match(tk.RIGHT_BRACKET)) {
            return new ParseError("Missing End bracket for object definition");
        }
        let assignments = find_many(this.parse_assignment, tk.NEWLINE);
        return assignments;
    }
}