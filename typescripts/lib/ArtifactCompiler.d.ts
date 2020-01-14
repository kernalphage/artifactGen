import { Scanner } from './core/Scanner';
import { Parser } from './core/Parser';
import { BasicInterpreter } from './core/Interpreter';
declare type InterpreterConstructor = {
    new (): BasicInterpreter;
};
export declare class ArtifactCompiler {
    readonly ctor: InterpreterConstructor;
    readonly source: any;
    readonly options: any;
    scanner: Scanner;
    parser: Parser;
    constructor(ctor: InterpreterConstructor, source: any, options: any);
    generate(): import("./core/Environment").Environment;
}
export {};
