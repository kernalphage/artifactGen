import {ArtifactCompiler} from "./ArtifactCompiler"
import { BasicInterpreter } from "./core/Interpreter";

let simple_text = `
[item]
 pi = 3.14;
 randomItem = 1:10;
 metalColor, metalValue  = gold, 200 | silver, 100 | copper, 10; 
 description = this is a @metalColor ring that is worth @metalValue 

 [Second]
 math = #maths;
 value = "special 324";
 function = !fun(ction);

 [maths]
 pi = 3.14;
 alsoPi = @pi;
 e = 3
`

try {
    var artGen = new ArtifactCompiler(BasicInterpreter, simple_text, {});

    let tokens = artGen.scanner.tokens;
    for (var i = 0; i < tokens.length; i++) {
        //addMyTag(tokens[i].string, tokens[i].symbol, "tokens");
    }
    let obj = artGen.generate();
    let output = obj.export();
    console.log(output);
} catch (e) {
   // log(e.message + e.callstack, "warn");
}


/*

import _  from 'lodash';

var idea_txt = document.getElementById("sample_text").innerText;
var simple_text = document.getElementById("simple_example").innerText;



function addMyTag(text, klass, parent) {
    text = text.replace(/\\n/g, "<br\>");
    if (klass == tk.NEWLINE) {
        document.getElementById(parent).appendChild(document.createElement("br"));
        return;
    }
    let l = document.createElement("div", { class: klass.toString() });
    l.innerHTML = text;
    document.getElementById(parent).appendChild(l);
}


export function log(text, level) {
    if (!level) {
        level = "log";
    }
    if (!(text instanceof String)) {
        text = JSON.stringify(text);
    }
    text = text.replace(/\\n/g, "<br\>");
    let l = document.createElement("div", { class: level });
    l.innerHTML = text;
    document.getElementById("logger").appendChild(l);
}

*/