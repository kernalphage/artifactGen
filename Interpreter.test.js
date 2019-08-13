import {Scanner} from './Scanner.js';
import {Parser} from './Parser.js';
import {Printer, BasicInterpreter} from './Interpreter.js';


test('basic definition', () => {
    let source = `
   [item]
   pi : 3.14;
   randomItem : 1:10;
   metalColor, metalValue  : gold, 200 | silver, 100 | copper, 10 
   description: this is a @metalColor ring, that is worth @metalValue 
  
   [Second]
   value : "special 324"
  `;
  // TODO: it's time to bundle scan/parse/interpret into a "program" class
  // and decide if things shoud automagically parse on construction
    let scan = new Scanner(source);
    let parse = new Parser(scan.tokens);
    let print = new Printer();
    parse.parse_main();
    let result = print.execute(parse.definitions);
    expect(result).toMatchSnapshot();
  });
  
  test('basic json value', () => {
    let source = `
   [item]
   pi : 3.14;
   randomItem : 1:10;
   metalColor, metalValue  : gold, 200 | silver, 100 | copper, 10 
   description: this is a @metalColor ring, that is worth @metalValue 
  
   [Second]
   value : "special 324";
   value2 : "324"
  `;
  // TODO: oh god am I going to have to mock random? or just seed it
    let scan = new Scanner(source);
    let parse = new Parser(scan.tokens);
    let basic = new BasicInterpreter();
    parse.parse_main();
    basic.execute(parse.definitions);
    console.log(basic.export());
    expect(basic.export()).toBe("Broken");
  });
  