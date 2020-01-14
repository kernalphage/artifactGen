"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ArtifactCompiler_1 = require("./ArtifactCompiler");
const Interpreter_1 = require("./core/Interpreter");
let simple_text = `
// new syntax: #! Rvalue, evaluate new each time?

[cupidPerson]
name = #Name;
status = !cn(2:5, @age, @pronouns, @sign,
!c(hey, sup, whaddup) its!p(10, yaboi), !c(@name.first, @name.nicname),
!c(pro, professional, amatuer, hobbyist, "") @hobby!p(20, for life),
    Letss get !c(your number, busy, down to ~BUSINESS !p(50, to DEFEAT the HUNNS)~, to know each other),
!cn(2: 5, : peach:, : smile:, : wet:, : eggplant:, : eyes:, : okay: )
!c(looking, cruising, lookin) for !cn(0: 1, hot, smart, beautiful)!c(chicks, women, girls, bros, people);
);
pronouns = "Man/Male/Dude" | "Red/White/Blue" | "He/Him" | "M" | "Male" | "";
age = 21: 55;
sign = !StaticList(signs);

    [Picture]
location = bathroom;
pose = standing | squatting | sitting;
background = bright | dusk | etc;


[Conversation]

[Name]
//first, nicname = matt, matty | Tom, Tommy | Doug, doug | Greg, Grg
first = !StaticList(firstnames);
nicname = !map( @first, Matt, Matty,
    Tom, Tommy,
    Doug, doug,
    Greg, Grg);
last = !StaticList(lastnames);
`;
try {
    var artGen = new ArtifactCompiler_1.ArtifactCompiler(Interpreter_1.BasicInterpreter, simple_text, {});
    let tokens = artGen.scanner.tokens;
    console.log(JSON.stringify(tokens));
    console.log(JSON.stringify(artGen.scanner.errors));
    let obj = artGen.generate();
    let output = obj.export();
    console.log(output);
}
catch (e) {
}
