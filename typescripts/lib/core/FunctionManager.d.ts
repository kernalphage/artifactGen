import { Environment } from './Environment';
import { Expression } from './Expressions';
export declare function register(fnName: string, fn: Function, hints?: string[]): void;
export declare function applyFN(fnName: string, context: Environment, args: Expression[]): any;
export declare function getHint(fnName: string): any;
