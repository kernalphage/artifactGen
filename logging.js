
export function log(text, level){
    if(!level){
        level = "log";
    }
    if(!( text instanceof String)){
        text = JSON.stringify(text);
    }
    text = text.replace(/\\n/g, "<br\>");
    let l = document.createElement("pre", {class: level});
    l.innerHTML = text;
    document.getElementById("logger").appendChild(l);
}