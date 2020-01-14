"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Scanner_1 = require("../core/Scanner");
const Parser_1 = require("../core/Parser");
const Interpreter_1 = require("../core/Interpreter");
test('basic json value', () => {
    let source = `
   [item]
   description = this is a @metalColor ring that is worth @metalValue;
   pi = 3.14;
   randomItem = 1:10;
   metalColor, metalValue = gold, 200 | silver, 100 | copper, 10 ;
  
   [Second]
   value = "special 324";
   value2 = "324"
  `;
    let scan = new Scanner_1.Scanner(source);
    let parse = new Parser_1.Parser(scan.tokens);
    let basic = new Interpreter_1.BasicInterpreter();
    basic.execute(parse.definitions);
    expect(basic.export()).toMatchSnapshot();
});
