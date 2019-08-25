import {Scanner} from '../Scanner.js';
import {Parser} from '../Parser.js';



test('basic definition', () => {
  let source = `
 [item]
 pi : 3.14;
 randomItem : 1:10;
 metalColor, metalValue  : gold, 200 | silver, 100 | copper, 10; 
 description: this is a @metalColor ring that is worth @metalValue 

 [Second]
 math : #maths;
 value : "special 324"

 [maths]
 pi : 3.14;
 alsoPi : @pi;
 e : 3
`;
  let scan = new Scanner(source);
  let parse = new Parser(scan.tokens);
  parse.parse_main();
  expect(parse.definitions.length).toBe(3);
});


// TODO: need more code covereage here
test('basic parsing mixups', () => {
  let sources = [`
  [noSemicolon]
two_lines : that will @break 
without : semicolons
` , `
[noColon]
error here; 
can you believe it
`];
let errors = [];
  sources.forEach((source)=>{
    let scan = new Scanner(source);
    let parse = new Parser(scan.tokens);
    parse.parse_main();
    console.log(parse.definitions);
    console.log(parse.errors);
    expect(parse.definitions.length).toBe(0);
    errors.push(parse.errors);
  });
  expect(errors).toMatchSnapshot();

});

// TODO: create this test as a mocked raw token stream
test('find_many', ()=>{
  
});