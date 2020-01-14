"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
class Base {
    constructor(values) {
        this.values = values;
        this._exprType = "Base";
    }
}
exports.Base = Base;
class Assignment {
    constructor(targets, choices) {
        this.targets = targets;
        this.choices = choices;
        this._exprType = "Assignment";
    }
}
exports.Assignment = Assignment;
class Definition {
    constructor(id, assignments) {
        this.id = id;
        this.assignments = assignments;
        this._exprType = "Definition";
    }
}
exports.Definition = Definition;
class ExFunction {
    constructor(locator, parameters) {
        this.locator = locator;
        this.parameters = parameters;
        this._exprType = "ExFunction";
    }
}
exports.ExFunction = ExFunction;
class Locator {
    constructor(location) {
        this.location = location;
        this._exprType = "Locator";
    }
    static AppendLocations(a, b) {
        a = this.normalizeLocation(a);
        b = this.normalizeLocation(b);
        return new Locator(a.concat(b));
    }
    static normalizeLocation(target) {
        if (target instanceof Locator) {
            return target.location;
        }
        else if (target instanceof Array) {
            return target;
        }
        else {
            return target.split(".");
        }
    }
}
exports.Locator = Locator;
class LValue {
    constructor(reftype, locator) {
        this.reftype = reftype;
        this.locator = locator;
        this._exprType = "LValue";
    }
}
exports.LValue = LValue;
class EXNumber {
    constructor(numbers) {
        this.numbers = numbers;
        this._exprType = "EXNumber";
    }
}
exports.EXNumber = EXNumber;
class RValue {
    constructor(reftype, locator) {
        this.reftype = reftype;
        this.locator = locator;
        this._exprType = "RValue";
    }
}
exports.RValue = RValue;
class Statement {
    constructor(statements) {
        this.statements = statements;
        this._exprType = "Statement";
    }
}
exports.Statement = Statement;
class SideEffect {
    constructor(ref, op, value) {
        this.ref = ref;
        this.op = op;
        this.value = value;
        this._exprType = "SideEffect";
    }
}
exports.SideEffect = SideEffect;
