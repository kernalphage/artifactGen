import {tk} from "./Token.js"
import {Scanner} from "./Scanner.js"
import {log} from "./logging.js"
import { Parser } from "./Parser.js";

var idea_txt = document.getElementById("sample_text").innerText;
var simple_text = document.getElementById("simple_example").innerText;

var s =new Scanner(simple_text);
log(s.export());
var p = new Parser(s.tokens);
p.parse_main();

console.log(p.definitions);

//log(s.export());

function addMyTag(text, klass, parent){
   text = text.replace(/\\n/g, "<br\>");
   if(klass == tk.NEWLINE){
       document.getElementById(parent).appendChild(document.createElement("br"));
      return;
   }
   let l = document.createElement("div", {class: klass.toString()});
   l.innerHTML = text;
   document.getElementById(parent).appendChild(l);
}

let tokens = s.tokens;
for(var i =0; i < tokens.length; i++){
    addMyTag(tokens[i].string, tokens[i].symbol, "tokens");
}
