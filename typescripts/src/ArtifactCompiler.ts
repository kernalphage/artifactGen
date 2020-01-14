import { I_Interpreter } from './core/I_Interpreter';
import {Scanner} from './core/Scanner';
import {Parser} from './core/Parser';
import {BasicInterpreter} from './core/Interpreter';


// TODO: make sure to change this back to I_Interpreter later
type InterpreterConstructor = {new(): BasicInterpreter};

export class ArtifactCompiler {
    scanner: Scanner;
    parser: Parser;

    constructor(readonly ctor: InterpreterConstructor, readonly source: any, readonly options: any ){
        this.source = source;

        this.scanner = new Scanner(this.source); 
        if (this.scanner.errors.length > 0) {
            throw this.scanner.errors;
        }
        this.parser = new Parser(this.scanner.tokens);
        if (this.parser.errors.length > 0) {
            throw this.parser.errors;
        }
    }

    generate(){
        let interpreter = new this.ctor();
        let res = interpreter.execute(this.parser.definitions);
        return res;
    }
}