
import ArtifactGenerator from "..";
let {Scanner, Parser, BasicInterpreter} = ArtifactGenerator.Core;


// TODO: folow better Jest practices for mock setup/teardown
const mockMath = Object.create(global.Math);
let seed = 1;
mockMath.random = ()=> {var x = Math.sin(seed++ *641.23523)*1782.12412; return x - Math.floor(x); };
global.Math = mockMath;
  
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
    let scan = new Scanner(source);
    let parse = new Parser(scan.tokens);
    let basic = new BasicInterpreter();
    basic.execute(parse.definitions);
    expect(basic.export()).toMatchSnapshot();
  });
  