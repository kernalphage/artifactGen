"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Scanner_1 = require("./core/Scanner");
const Parser_1 = require("./core/Parser");
class ArtifactCompiler {
    constructor(ctor, source, options) {
        this.ctor = ctor;
        this.source = source;
        this.options = options;
        this.source = source;
        this.scanner = new Scanner_1.Scanner(this.source);
        if (this.scanner.errors.length > 0) {
            throw this.scanner.errors;
        }
        this.parser = new Parser_1.Parser(this.scanner.tokens);
        if (this.parser.errors.length > 0) {
            throw this.parser.errors;
        }
    }
    generate() {
        let interpreter = new this.ctor();
        let res = interpreter.execute(this.parser.definitions);
        return res;
    }
}
exports.ArtifactCompiler = ArtifactCompiler;
