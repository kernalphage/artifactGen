import {tk} from "./Token.js";
import {log} from "./logging.js";
import {ArtifactGenerator} from "./artifactGenerator.js";
import{_} from 'lodash';

var idea_txt = document.getElementById("sample_text").innerText;
var simple_text = document.getElementById("simple_example").innerText;

var artGen = new ArtifactGenerator(simple_text);
addMyTag(print.export(), "warn", "logger");

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
