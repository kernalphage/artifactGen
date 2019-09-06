import ArtifactGenerator from "..";
let ArtifactCompiler = ArtifactGenerator.ArtifactCompiler;


test('basic compiler success', ()=>{
    let source = `
    [artifact]
    curVal = 10
    `
    var artGen = new ArtifactCompiler(source);
    let art = artGen.generate();
    expect(art.get("artifact.curVal")).toEqual(10);
});