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
    }

    setInterperter(interpreter){
        this.interpreterType = interpreter;
    }

    generate(){
        let interpreter = new this.interpreterType();
        return interpreter.execute(this.parser.definitions);
    }
}