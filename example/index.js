import ArtifactGenerator from "..";
let tk = ArtifactGenerator.Core.tk;
let ArtifactCompiler = ArtifactGenerator.ArtifactCompiler;

import{_} from 'lodash';

var idea_txt = document.getElementById("sample_text").innerText;
var simple_text = document.getElementById("simple_example").innerText;


try{
var artGen = new ArtifactCompiler(simple_text);

    let tokens = artGen.scanner.tokens;
    for (var i = 0; i < tokens.length; i++) {
        addMyTag(tokens[i].string, tokens[i].symbol, "tokens");
    }
    let obj = artGen.generate();
        let output = obj.export();
        log(output, "success");    
} catch(e){
    log(e.message + e.callstack, "warn");
}


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


export function log(text, level){
    if(!level){
        level = "log";
    }
    if(!( text instanceof String)){
        text = JSON.stringify(text);
    }
    text = text.replace(/\\n/g, "<br\>");
    let l = document.createElement("div", {class: level});
    l.innerHTML = text;
    document.getElementById("logger").appendChild(l);
}