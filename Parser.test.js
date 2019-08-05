import {Scanner} from './Scanner.js';
import {Parser} from './Parser.js';


test('basic definition', () => {
  let source = `
 [item]
 pi : 3.14;
 randomItem : 1:10; 
`;
  let scan = new Scanner(source);
  let parse = new Parser(scan.tokens);
  console.log(scan.export());
  parse.parse_main();
  console.log(JSON.stringify(parse.definitions));
  expect(parse.definitions.length).toBe(1);
});
