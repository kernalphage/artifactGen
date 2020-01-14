import { Scanner } from "../core/Scanner";
import { Parser } from "../core/Parser";
import { BasicInterpreter } from "../core/Interpreter";

// TODO: folow better Jest practices for mock setup/teardown
/*
const mockMath = Object.create(global.Math);
let seed = 1;
mockMath.random = ()=> {var x = Math.sin(seed++ *641.23523)*1782.12412; return x - Math.floor(x); };
global.Math = mockMath;
  */
  test('basic json value', () => {
    let source = `
   [item]
   mom = hey !many(5:10, momma);
   babble = what !many(5:10, !c(what,the,hyuck,did,you,just,say) );
   randomItem = 1:10

   [thing]
   myval = hwy | what | the | fuck | did | you | just | say
  `;
    let scan = new Scanner(source);
    let parse = new Parser(scan.tokens);
    let basic = new BasicInterpreter();
    basic.execute(parse.definitions);
    console.log(basic.export());
    expect(basic.export()).toMatchSnapshot();
  });
  