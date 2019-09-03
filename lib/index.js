import {tk, Token} from "./core/Token.js";
import {Scanner} from './core/Scanner.js';
import {Parser} from './core/Parser.js';
import {BasicInterpreter, Printer} from './core/Interpreter.js';
import * as kp from './core/kp.js';
import {ArtifactCompiler} from './ArtifactCompiler.js';

export default {
    'kp':kp,
    'ArtifactCompiler': ArtifactCompiler,
    'Core':{
        tk: tk,
        Token: Token,
        Scanner: Scanner,
        Parser: Parser, 
        BasicInterpreter: BasicInterpreter,
        Printer: Printer,
    },
};