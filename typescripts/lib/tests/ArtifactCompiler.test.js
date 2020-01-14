"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ArtifactCompiler_1 = require("../ArtifactCompiler");
const Interpreter_1 = require("../core/Interpreter");
test('basic compiler success', () => {
    let source = `
    [artifact]
    curVal = 10
    `;
    var artGen = new ArtifactCompiler_1.ArtifactCompiler(Interpreter_1.BasicInterpreter, source, {});
    let art = artGen.generate();
    expect(art.get("artifact.curVal")).toEqual(10);
});
