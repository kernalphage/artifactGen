import {Scanner} from './core/Scanner.js';
import {Parser} from './core/Parser.js';
import {BasicInterpreter} from './core/Interpreter.js';

export class ArtifactCompiler {
    constructor( source, options ){
        this.source = source;
        this.options = options;
        this.interpreterType = BasicInterpreter;
        this._compile(); 
    }

    _compile(){
        this.scanner = new Scanner(this.source);
        this.parser = new Parser(this.scanner.tokens);
        if (this.parser.errors.length > 0) {
            throw this.parser.errors;
        }
    }

    setInterperter(interpreter){
        this.interpreterType = interpreter;
    }

    generate(){
        let interpreter = new this.interpreterType();
        let res = interpreter.execute(this.parser.definitions);
        return res;
    }
}