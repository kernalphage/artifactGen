import {makeEnum} from "./kp.js";
export const Expr = makeEnum([

]);


export class Parser {
 constructor(tokens){
     this.tokens = tokens;
     this.current = 0;
 }   
 peek(){

 }
 check(){

 }
 advance(){
     
 } 
 previous(){
     
 }
 isAtEnd(){

 }
  match(...tokens) {
      matched = _.any(tokens, (t)=>this.check(t) );
      if(matched){
          this.advance();
      }
      return matched;
} 

}