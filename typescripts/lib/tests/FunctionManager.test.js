"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Scanner_1 = require("../core/Scanner");
const Parser_1 = require("../core/Parser");
const Interpreter_1 = require("../core/Interpreter");
test('basic json value', () => {
    let source = `
   [item]
   mom = hey !many(5:10, momma);
   babble = what !many(5:10, !c(what,the,hyuck,did,you,just,say) );
   randomItem = 1:10

   [thing]
   myval = hwy | what | the | fuck | did | you | just | say
  `;
    let scan = new Scanner_1.Scanner(source);
    let parse = new Parser_1.Parser(scan.tokens);
    let basic = new Interpreter_1.BasicInterpreter();
    basic.execute(parse.definitions);
    console.log(basic.export());
    expect(basic.export()).toMatchSnapshot();
});
