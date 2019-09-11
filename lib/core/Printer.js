import {
    _
} from "lodash";
import { I_Interpreter} from "./I_Interpreter.js";

export class Printer extends I_Interpreter{
    constructor(){
        super();
        this.visitors = {
            Assignment:  (expr)=>{
                let targets = this.visit(expr.targets);
                let values = this.visit(expr.values);
                let     out= targets.join(" ");
                out += ":=";
                out += values.join("[OR]"); 
                return out;
            },
            Base: (expr)=>{
                return this.visit(expr.value);
            },
            Definition:  (expr)=>{
                let name = expr.id.string;
                let assignments = this.visit(expr.assignments);
                return (name+"= <br>"+assignments);
            },
            // function
            Locator:  (expr)=>{
               return _.map(expr.locations, 'string').join(",");
            },
            LValue:  (expr)=>{
                return this.visit(expr.locator);
            },
            Number:  (expr)=>{
                return _.map(expr.values, 'value').join(' to ');
            },
            RValue:  (expr)=>{
                return this.visit(expr.type) + this.visit(expr.locator);
            },
            // sideEffect
            Statement: (expr)=>{
                return this.visit(expr.statements);
            },
            ExFunction: (expr)=>{
                let loc = this.visit(expr.locator);
                let params = this.visit(parameters);
                return loc + "(" + params.join(", ") + ")";
            }
        };
    }
}
