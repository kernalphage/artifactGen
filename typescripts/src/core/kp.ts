import * as _ from 'lodash';

// TODO: Clean this up with something smarter
// How does the saying go? 
// Javascript pursues other languages down alleyways to beat them unconscious and rifle their pockets for new syntax
// This is an attempt to implement typeclasses and some metarpogramming shenenagians using 
// A mixture of Symbol(), matching dictionaries, and convienent ducktyping 
// Transforms: TypeData: {cat:['tail', "teeth"], bird:['wing']} => [ 
//  {'cat':Symbol('cat'), 'bird':Symbol('bird')}      // SymbolAccessor =_.mapValues(TypeData, (v,k)=>{return Symbol(k);});
//  {Symbol('cat'):['tail'], Symbol('bird'):['wing']} // PropertyAccessor = _.mapKeys(TypeData, (v,k)=>{return Ex[k];});
// ]
// Programmer's note: I'm keeping this here for transparency but HOLY CRAP most of this went away with Typescript
// enums, Record<string, any> and  foo<T>(mapper(any)=>T):T[]  do WONDERS

export function isSameType(a:any, b:any) {
    a = (a instanceof Object) ? a.Type : a;
    b = (b instanceof Object) ? b.Type : b;
    return a === b; 
}

// Different useful functions

export function isDigit(c:string) :boolean{
    return c >= '0' && c <= '9';
}
export function isAlpha(c: string): boolean{
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_';
}
export function isAlphaNumeric(c: string): boolean {
    return isAlpha(c) || isDigit(c);
}
export function isEmoji(c: string): boolean{
    let filter = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug;
    return !!c.match(filter);
}
export function isLiteral(c: string): boolean{
    return isAlphaNumeric(c) || isEmoji(c);
}

export function randomRangeInt(min:number, max:number):number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  }


  // Support for unicode charAt
export function getWholeChar(str:string, i:number):string|null{
    var code = str.charCodeAt(i);

    if (Number.isNaN(code)) {
        return null; // Position not found
    }
    if (code < 0xD800 || code > 0xDFFF) {
        return str.charAt(i);
    }

    // High surrogate (could change last hex to 0xDB7F to treat high private
    // surrogates as single characters)
    if (0xD800 <= code && code <= 0xDBFF) {
        if (str.length <= (i + 1)) {
            throw 'High surrogate without following low surrogate';
        }
        var next = str.charCodeAt(i + 1);
        if (0xDC00 > next || next > 0xDFFF) {
            throw 'High surrogate without following low surrogate';
        }
        return str.charAt(i) + str.charAt(i + 1);
    }
    // Low surrogate (0xDC00 <= code && code <= 0xDFFF)
    if (i === 0) {
        throw 'Low surrogate without preceding high surrogate';
    }
    var prev = str.charCodeAt(i - 1);

    // (could change last hex to 0xDB7F to treat high private
    // surrogates as single characters)
    if (0xD800 > prev || prev > 0xDBFF) {
        throw 'Low surrogate without preceding high surrogate';
    }
    // We can pass over low surrogates now as the second component
    // in a pair which we have already processed
    return null;
}

// maps  normalizeArray([{a:1, val:1}, {a:2, val:1}], 'a') => {1:{val:1}, 2: {val:2}};
//  https://frontendsociety.com/how-to-cast-an-array-of-objects-into-a-dictionary-object-in-typescript-2a3b9790da81
export function normalizeArray<T>(array: Array<T>, indexKey: keyof T) {
    const normalizedObject: any = {}
    for (let i = 0; i < array.length; i++) {
        const key = array[i][indexKey]
        normalizedObject[key] = array[i]
    }
    return normalizedObject as { [key: string]: T }
}