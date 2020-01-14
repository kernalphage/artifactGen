declare namespace _default {
    export { kp };
    export { ArtifactCompiler };
    export namespace Core {
        export { tk };
        export { Token };
        export { Scanner };
        export { Parser };
        export { BasicInterpreter };
    }
}
export default _default;
import * as kp from "./core/kp.js";
import { ArtifactCompiler } from "./ArtifactCompiler.js";
import { tk } from "./core/Token.js";
import { Token } from "./core/Token.js";
import { Scanner } from "./core/Scanner.js";
import { Parser } from "./core/Parser.js";
import { BasicInterpreter } from "./core/Interpreter.js";
