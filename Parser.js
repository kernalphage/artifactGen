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
let [_Ex, pr] = MakeTypeclass(ExpressionData);
let Ex = function(...args){
    console.log("Creating expression " + args[0].toString() + JSON.stringify(args));
    return _Ex(...args);
} 
let myNumbers = [2,4,6,8];
let curNum = Ex(pr.Number,myNumbers); 

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
      if(! _.every(tokens)){
          throw this.ParserError("One or more tokens to match are undefined! " + JSON.stringify(tokens));
      }
      let matched = tokens.some( (t)=>this.check(t) );
      if(matched){
          this.advance();
      }
      return matched;
} 
ParserError(message, token){
    token = token || this.peek();
   return {
       message: message,
       token: token
   }
}

// End parser helper functions 

parse_main(){  console.log("entering parse_main");
    this.definitions = [];
    while(!this.isAtEnd()){
        if(!this.check(tk.LEFT_BRACKET)){
            break;
        }
        console.log("starting parse at token " + this.peek().toString());
        let def = this.parse_definition();
        this.definitions.push(def);
    }
    return this.definitions;
}

 //  trailing=true todo: allow for trailing break_tokens
 //  minimum=0 todo: allow for min/max counts parse_fn
 // TODO: capture break token[s]? 
 // TODO: Parse fails on trailing commas (like, this, example,)
find_many(parse_fn, break_token, must_find_one = true) {
    console.log("Entering find_many");
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
    console.log("exiting find_many");
    return ret;
}

// TODO: parse side effect or math?
// base_expr -> list(LITERAL) | STRING | number_expr | rvalue | side_effect
parse_base_expr(){  console.log("entering parse_base_expr");
    let sym = this.peek();
    let value = null;
    let type = null;
    switch(sym.symbol){
        case tk.LITERAL:
        case tk.STRING:
            type = "literal";
            value = [];
            while (this.match(tk.LITERAL)) {
                value.push(this.previous());
            }
            // these are quickly becoming the same thing, if I don't create string parsing
            break;
        case tk.NUMBER:
            type="number";
            //value = Ex(pr.Number,this.advance());
            value = this.parse_number();
            break;
        default:
            throw this.ParserError("this is not a base expression");
    }
    // TODO: Do I need the type if value knows what to do with itself? 
    return Ex(pr.Base, type, value);
}

// statement_expr -> list( base_expr, ",") 
parse_statement(){  console.log("entering parse_statement");
    let ret = this.find_many(this.parse_base_expr, tk.COMMA);
    console.log("exiting parse_statement");
    return Ex(pr.Statement, ret);
}
// number_expr -> NUMBER | list(NUMBER, ":")
parse_number(){  console.log("entering parse_number");
    let vals = this.find_many(tk.NUMBER, tk.COLON);
    return Ex(pr.Number,vals); 
}

// not sure if i want that as ":", or should it be = ?
// should target lists have a ";" as well?  
// assignment -> list(lvalue, ",") ":" list(statement_expr, "|")
parse_assignment(){  console.log("entering parse_assignment");
    let targets = this.find_many(this.parse_lvalue, tk.COMMA);
    if(!this.match(tk.COLON)){
        throw this.ParserError("Missing ':' in statement definition");
    }
    let values = this.find_many(this.parse_statement, tk.BAR);
    return Ex(pr.Assignment, targets, values);
}

parse_target(){  console.log("entering parse_target");
    if(!this.match(tk.AT, tk.DOLLAR)){
        throw this.ParserError("target reference should begin with @ or $");
    }
    let refType = this.previous();
    let location = this.parse_locator();
    return Ex(pr.Target, refType, location);
}

// hmm slashes or dots? slashes let me do .. 
// person.height.cm for example 
// TODO: players.0.name, or maybe players.#.name for like... random select?

// locator_expr -> list(LITERAL, ".")
parse_locator(){  console.log("entering parse_locator");
    let ret = this.find_many(tk.LITERAL, tk.DOT);
console.log("exiting parse_locator");
    return ret;
}
 
parse_definition_ref(){  console.log("entering parse_definition_ref");
    if(!this.match(tk.HASH)){
        throw this.ParserError("Definition refs must start with a #");
    } 
    return Ex(pr.DefinitionRef, this.parse_locator());
}
parse_tag_ref(){  console.log("entering parse_tag_ref");
    if(!this.match(tk.LEFT_CURLY)){
        throw this.ParserError("tag references must start with {");
    }
    let loc = this.parse_locator();
    if(!this.match(tk.RIGHT_CURLY)){
        throw this.ParserError("tag references must end with {");
    }
    return Ex(pr.TagRef, loc);
}
parse_function(){  console.log("entering parse_function");
    //ugh
}

parse_sideeffect(){  console.log("entering parse_sideeffect");
    // ugh
}
// definition -> "[" LITERAL "]" list(assignment, ;)
    parse_definition(){  console.log("entering parse_definition");
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

        console.log("exiting parse_definition");
        return defExpr;
    }
    // lvalue -> ("$")? locator_expr
    parse_lvalue(){  console.log("entering parse_lvalue");
        let type = "";
        if(this.check(tk.DOLLAR)){
            type = "ABSOLUTE";
        } else {
            type = "RELATIVE";
        } 
        let reference = this.find_many(this.parse_locator, tk.DOT);
        console.log("exiting parse_lvalue");
        return  Ex(pr.LValue, type, reference);
    }
}

