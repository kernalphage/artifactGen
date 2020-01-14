import { Expression, EnvLocation } from './Expressions';
export declare class Environment {
    defs: Record<string, Environment | Expression | Expression[]>;
    id: string;
    constructor(id: string);
    applyDefinition(location: EnvLocation, value: Expression | Environment | Expression[]): void;
    get(location: EnvLocation): Environment | Expression | Expression[];
    export(): string;
}
