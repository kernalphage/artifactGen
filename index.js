import {tk} from "./Token.js"
import {Scanner} from "./Scanner.js"
import {log} from "./logging.js"

var idea_txt = document.getElementById("sample_text").innerText;
log(idea_txt);
var s =new Scanner(idea_txt);
s.scanTokens();
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
