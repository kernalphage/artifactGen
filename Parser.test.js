import {Scanner} from './Scanner.js';
import {Parser} from './Parser.js';


// TODO: Should these tests be mocked? Just as raw token stream
// I'm thinking no, unless I tested find_many or something directly.

test('basic definition', () => {
  let source = `
 [item]
 pi : 3.14;
 randomItem : 1:10;
 a, b : c, d | 1, 2;
 
 [Second]
 value : "special 324"
`;
  let scan = new Scanner(source);
  let parse = new Parser(scan.tokens);
  parse.parse_main();
  expect(parse.definitions.length).toBe(2);
});


test('basic reference checking', () => {
  let source = `
[constants]
math : #maths

[maths]
pi : 3.14;
alsoPi : @pi;
e : 3
`;
  let scan = new Scanner(source);
  let parse = new Parser(scan.tokens);
  parse.parse_main();
  expect(parse.definitions.length).toBe(2);
});


test('find_many', ()=>{
  
});