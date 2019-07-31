import {makeEnum} from "./kp.js";
import { tk } from "./Token.js";
export const Expr = makeEnum([
    "A"
]);

/*
Unitary operators 


grouping operators
[] () {}

chaining operators
; | , \n :
*/



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

parse_ref(){
    if(this.match(tk.LEFT_BRACKET)){
        
    }
}
}