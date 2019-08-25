# artifactGen
Language for declaring procedural artifacts and the parameters to generate them, heavily inspired by [Tracery](http://tracery.io/), [Ortiel's Nested](https://orteil.dashnet.org/nested)  and Dwarf Fortress's markup language.

It supports string replacement & random choices/numbers for assigning to values.

My intention is to make this markup language expressive for power users, but straightforward enough for beginners to step in and make something. 

# Building / Library
My development envrionment ad-hoc (read: A mess), I'd love to hear the correct way to set this up and write it to share with other developers. 

# Language Syntax
Right now it's mostly implemented as a BNF [declaration](BNF.txt), but I'm slowly trying to describe it in human terms. 

* **Definition**: `[item]`: The name of an object and a list of properties. 
* **Assignment**: `username: kernalphage`: a property and a value that is assigned to that property
* **Assignment choices**: `coinFlip: heads | tails`: a property and a list of choices that could be assigned to that property. When you access that property for the first time, it will pick a random value, and after that it will always be the same. 
* **Number ranges**: `jellybeans: 200:400` : Sometimes you want a random number.
* **Assignment groups**: `they,them,title:he,him,Mr|she,her,Ms|they|them|Mx`: Sometimes you want random choices to be grouped together. Using a comma allows properties and their values to be grouped together. 
* **Property References**: `Greetings: "Hello, $player.title {$player.name}!"`: Finds the propery. @ starts local to the current object, $ starts globally. 

# Usage
Source file: 
```   
[item]
   description: this is a @metalColor ring with @baubles baubles that is worth @metalValue ;
   baubles : 1:10;
   metalColor, metalValue  : gold, 200 | silver, 100 | copper, 10 
````

Usage: 
```
let item = new ArtifactGenerator(itemSource).generate();
console.log(item.export());
```

Example Output: 
```
{
    description: This is a Gold ring with 4 baubles that is worth 200
    baubles: 4
    metalColor: gold
    metalValue: 200
}
```

# TODO
There's a lot of small TODOS littering the codebase, but here are some of the high-level concepts I'd like to explore: 

* QOL & Best Practices
    - Raise the code coverage for tests and example code
    - organize the project structure & class structure
    - More descriptive erors and helpful hints
    - warnings for unused properties & definitions
    - Follow a uniform coding style
* Tough Stuff & Needs Research
    - Lazy getters for properties (to support recursion)
    - Recognizing infinite dependency loops
* Nice to Haves
    - Support functions & extensions (eg, `!plural(@noun)` )
    - REPL / Intereactive examples 
    - arrays an array selectors
    - Value modifiers/inventory: (eg, `value*=5`, `inventory+="sword"`)