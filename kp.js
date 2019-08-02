export function makeEnum(arr){
    let obj = {};
    for (let val of arr){
        if(Array.isArray(val)){
            obj[val[0]] = [Symbol(val[0]), val.slice(1)]; 
        }
            obj[val] = Symbol(val);
    }
    return Object.freeze(obj);
}
export function isDigit(c){
    return c >= '0' && c <= '9';   
}
export function isAlpha(c){
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_';                     
}
export function isAlphaNumeric(c) {
    return isAlpha(c) || isDigit(c);
}