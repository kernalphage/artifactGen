import {makeEnum} from "./kp.js";

export const tk = makeEnum([
    "LEFT_PAREN",
    "RIGHT_PAREN",
    "LEFT_BRACKET",
    "RIGHT_BRACKET",
    "LEFT_CURLY",
    "RIGHT_CURLY",
    "COMMA",
    "DOT",
    "MINUS",
    "PLUS",
    "SEMICOLON",
    "COlON",
    "SLASH",
    "STAR",
    "BANG",
    "AT",
    "DOLLAR",
    "HASH",
    "QUESTION",


    "COMMENT",
    "LITERAL",
    "NUMBER",
    "EOF", 
    "ERROR",
    "NEWLINE",
    "BAR",
    
]);
    


export class Token{
    constructor(symbol, string, line, value){
        this.symbol = symbol;
        this.string = string;
        this.value = value;
        this.line = line;
    }    
    toString(){
        if(this.symbol == tk.NEWLINE){
            return "newline";
        }
        let va = this.value ?  " with value " + this.value : "";
        return this.symbol.toString() + ">" + this.string + "<" + va;
    }
};

/* 

{
	name: ring
	geo: ringGeo
	value: 210
	wear: {
		val: 3,
		desc: "disgusting"
	}
		metal: {
			desc: gold,
			color: "#ff00ff",
			mat: "shiny"
		},

	}
}
*/