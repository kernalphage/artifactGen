import { ArtifactCompiler } from "../ArtifactCompiler";
import { BasicInterpreter } from "../core/Interpreter";

test('basic compiler success', ()=>{
    let source = `
    [artifact]
    curVal = 10
    `
    
    var artGen = new ArtifactCompiler(BasicInterpreter,source, {});
    let art = artGen.generate();
    expect(art.get("artifact.curVal")).toEqual(10);
});