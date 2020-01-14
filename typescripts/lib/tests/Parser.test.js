"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Scanner_1 = require("../core/Scanner");
const Parser_1 = require("../core/Parser");
test('basic definition', () => {
    let source = `
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
`;
    let scan = new Scanner_1.Scanner(source);
    let parse = new Parser_1.Parser(scan.tokens);
    expect(parse.definitions.length).toBe(3);
});
function _test(a, b) { }
;
_test('basic parsing mixups', () => {
    let sources = [`
  [noSemicolon]
two_lines = that will @break 
without = semicolons
`, `
[noEquals]
error here; 
can you believe it
`];
    let errors = [];
    sources.forEach((source) => {
        let scan = new Scanner_1.Scanner(source);
        let parse = new Parser_1.Parser(scan.tokens);
        expect(parse.definitions.length).toBe(0);
        errors.push(parse.errors);
    });
    expect(errors).toMatchSnapshot();
});
