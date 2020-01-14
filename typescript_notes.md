# Typescript gotchas and wats that might be useful: 

## Classes and Types
https://www.typescriptlang.org/docs/handbook/interfaces.html#optional-properties
optional members in interfaces: 

```
interface SquareConfig {
    color?: string;
    width?: number;
}
```

https://www.typescriptlang.org/docs/handbook/interfaces.html#indexable-types

indexable types: operator overload for dict['key'] or arr_ish[idx]
```
interface StringArray {
    [index: number]: string;
}

let myArray: StringArray;
myArray = ["Bob", "Fred"];

let myStr: string = myArray[0];
```

https://www.typescriptlang.org/docs/handbook/interfaces.html#function-types
```
interface SearchFunc {
    (source: string, subString: string): boolean;
}
```
https://www.typescriptlang.org/docs/handbook/classes.html#parameter-properties

readonly parameter properties are great for POD classes
```
class Octopus {
    readonly numberOfLegs: number = 8;
    constructor(readonly name: string) {
    }
}
```

https://www.typescriptlang.org/docs/handbook/classes.html#accessors
getters/setters might be useful, works like c#
```
 class Employee {
    private _fullName: string;

    get fullName(): string {
        return this._fullName;
    }

    set fullName(newName: string) {
        if (newName && newName.length > fullNameMaxLength) {
            throw new Error("fullName has a max length of " + fullNameMaxLength);
        }
        
        this._fullName = newName;
    }
}
```

https://www.typescriptlang.org/docs/handbook/classes.html#constructor-functions
static constructor functions
I can see this being useful for dependency injection 
```
let greeterMaker: typeof Greeter = Greeter;
greeterMaker.standardGreeting = "Hey there!";
let greeter2: Greeter = new greeterMaker();
```
for something like "what to do in this situation" injection


--- 
## Types 

https://www.typescriptlang.org/docs/handbook/functions.html#this

Im gonna have to read this later

wait except for this magic: 
```
interface Card {
    suit: string;
    card: number;
}
interface Deck {
    suits: string[];
    cards: number[];
    createCardPicker(this: Deck): () => Card;
}
let deck: Deck = {
    suits: ["hearts", "spades", "clubs", "diamonds"],
    cards: Array(52),
    // NOTE: The function now explicitly specifies that its callee must be of type Deck
    createCardPicker: function(this: Deck) {
        return () => {
            let pickedCard = Math.floor(Math.random() * 52);
            let pickedSuit = Math.floor(pickedCard / 13);

            return {suit: this.suits[pickedSuit], card: pickedCard % 13};
        }
    }
}

let cardPicker = deck.createCardPicker();
let pickedCard = cardPicker();

alert("card: " + pickedCard.card + " of " + pickedCard.suit);
```

Function overloading 
https://www.typescriptlang.org/docs/handbook/functions.html#this

Note that the function pickCard(x): any piece is not part of the overload list, so it only has two overloads: one that takes an object and one that takes a number. Calling pickCard with any other parameter types would cause an error.

```
let suits = ["hearts", "spades", "clubs", "diamonds"];

function pickCard(x: {suit: string; card: number; }[]): number;
function pickCard(x: number): {suit: string; card: number; };
function pickCard(x): any {
    // Check to see if we're working with an object/array
    // if so, they gave us the deck and we'll pick the card
    if (typeof x == "object") {
        let pickedCard = Math.floor(Math.random() * x.length);
        return pickedCard;
    }
    // Otherwise just let them pick the card
    else if (typeof x == "number") {
        let pickedSuit = Math.floor(x / 13);
        return { suit: suits[pickedSuit], card: x % 13 };
    }
}
```



```
class GenericNumber<T> {
    zeroValue: T;
    add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function(x, y) { return x + y; };
```
This is a pretty literal use of the GenericNumber class, but you may have noticed that nothing is restricting it to only use the number type. We could have instead used string or even more complex objects.
```
let stringNumeric = new GenericNumber<string>();
stringNumeric.zeroValue = "";
stringNumeric.add = function(x, y) { return x + y; };

console.log(stringNumeric.add(stringNumeric.zeroValue, "test"));
```

```
function loggingIdentity<T extends Lengthwise>(arg: T): T {
```

yooooo 
```
function getProperty<T, K extends keyof T>(obj: T, key: K) {
```


https://www.typescriptlang.org/docs/handbook/advanced-types.html#intersection-types

this seems... powerful but I'm not sure how 