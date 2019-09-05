import ArtifactGenerator from "..";
let {Parser, Scanner} = ArtifactGenerator.Core;
// let Scanner = ArtifactGenerator.Core;
import{_} from 'lodash';
import { tk } from "../lib/core/Token";

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
  let scan = new Scanner(source);
  let parse = new Parser(scan.tokens);
  expect(parse.definitions.length).toBe(3);
});

test('find_some success', () => {

  let tBase     = [new Scanner("a, b, c, d"),   tk.LITERAL, tk.COMMA];
  let tTrail    = [new Scanner("a# b# c# d |"), tk.LITERAL, tk.HASH];
  let tTrail2   = [new Scanner("a, b, c, d,|"), tk.LITERAL, tk.COMMA, tk.BAR];

  let shouldSucceed = [tBase, tTrail, tTrail2];
  let parse     = new Parser([]);
  shouldSucceed.forEach(element => {
    let [tokens, ...params] = element;
    parse.reset(tokens.tokens);
    expect(parse.find_some(...params)).toBeTruthy();
  });
  parse.reset()
});

test('find_some failures', () => {

  let tTrail3 = [new Scanner("a, b, c, d,|"), tk.LITERAL, tk.COMMA];
  let tTrail4 = [new Scanner("a, b, c, d,"), tk.LITERAL, tk.COMMA];
  let tNone = [new Scanner("1"), tk.LITERAL, tk.COMMA];
  let tNone2 = [new Scanner("1,2,3"), tk.LITERAL, tk.COMMA];

  let shouldFail = [tTrail3, tTrail4, tNone, tNone2];
  let parse = new Parser([]);
  shouldFail.forEach(element => {
    let [tokens, ...params] = element;
    parse.reset(tokens.tokens);
    expect(() => {
      parse.find_some(...params)
    }).toThrow(/Parser error/);
  });
  parse.reset()
});

// TODO: need more code covereage here
test('basic parsing mixups', () => {
  let sources = [`
  [noSemicolon]
two_lines = that will @break 
without = semicolons
` , `
[noEquals]
error here; 
can you believe it
`];
let errors = [];
  sources.forEach((source)=>{
    let scan = new Scanner(source);
    let parse = new Parser(scan.tokens);
    expect(parse.definitions.length).toBe(0);
    errors.push(parse.errors);
  });
  expect(errors).toMatchSnapshot();

});
