import {Scanner} from '../Scanner.js';
import {Parser} from '../Parser.js';
import {BasicInterpreter} from '../Interpreter.js';

class ArtifactGenerator {
    constructor( source, options ){
        this.source = source;
        this.options = options;
        this.interpreterType = BasicInterpreter;
        this._compile(); 
    }

    _compile(){
        this.scanner = new Scanner(this.source);
        this.parser = new Parser(scanner.tokens);
    }

    setInterperter(interpreter){
        this.interpreterType = interpreter;
    }

    generate(){
        this.interpreter = new this.interpreterType(this.parser.definitions);
        return this.interpreter;
    }
}