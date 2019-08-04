import {_} from 'lodash';
 
export function makeEnum(arr){
    let obj = {};
    for (let val of arr){
        obj[val] = Symbol(val);
    }
    return Object.freeze(obj);
} 

// TODO: Clean this up with something smarter
// How does the saying go? 
// Javascript pursues other languages down alleyways to beat them unconscious and rifle their pockets for new syntax
// This is an attempt to implement typeclasses and some metarpogramming shenenagians using 
// A mixture of Symbol(), matching dictionaries, and convienent ducktyping 
// Transforms: TypeData: {cat:['tail', "teeth"], bird:['wing']} => [ 
//  {'cat':Symbol('cat'), 'bird':Symbol('bird')}      // SymbolAccessor =_.mapValues(TypeData, (v,k)=>{return Symbol(k);});
//  {Symbol('cat'):['tail'], Symbol('bird'):['wing']} // PropertyAccessor = _.mapKeys(TypeData, (v,k)=>{return Ex[k];});
// ]

// SymbolAccessor: string => symbol, 
// PropertyAccessor: symbol => properties

function TypeFactory(Typeclass, ClassName){
    // Creates an expression of type Symbol, and populates it if possible
    return function (symbol, ...args){
        if(!( _.has(Typeclass, symbol))){
            throw new Error("Symbol " + symbol.toString() + " Not in category " + ClassName);
        }
        let obj = _.zipObject(Typeclass[symbol], args); 
            obj.Type = symbol;
            obj.Klass = ClassName;  // Not sure if this is needed but hey, why not
        return obj;
    };
}

export function MakeTypeclass(TypeData, ClassName){
    let SymbolAccessor =_.mapValues(TypeData, (v,k)=>{return Symbol(k);});
    let PropertyAccessor = _.mapKeys(TypeData, (v,k)=>{return SymbolAccessor[k];});
    return [TypeFactory(PropertyAccessor, ClassName), SymbolAccessor];
}

export function isSameType(a, b){
    a = (a instanceof Symbol) ? a : a.Type;
    b = (b instanceof Symbol) ? b : b.Type;
    return a == b; // TODO: Triple equals? 
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

let [MakeAnimal, AnimalTypes] = MakeTypeclass({cat:['tail'], bird:['wing']}, "Animals");
let tweety = MakeAnimal(AnimalTypes.bird, "yellow");
let sylvester = MakeAnimal(AnimalTypes.cat, "bushy", "sharp");
// And then we get pattern matching! (sort of)...
function describeAnimal(animal) {
   switch(animal.Type){
    case AnimalTypes.cat:
    case AnimalTypes.dog:
         return "mammalian";
    case AnimalTypes.bird:
         return "Avian";
    default:
         return "Unknown. Alien?";
   }
}