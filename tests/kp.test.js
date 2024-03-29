import{_} from 'lodash';

import ArtifactGenerator from "..";
let {
    MakeTypeclass,
    isAlpha,
    isAlphaNumeric,
    isDigit,
    isSameType,
    FindFromSymbol
} = ArtifactGenerator.kp;

test('basic definition', () => {

    let [MakeAnimal, AnimalTypes] = MakeTypeclass({
        cat: ['tail'],
        bird: ['wing'],
        dog: ['tail'],
        alien: ['homePlanet']
    }, "Animals");
    let tweety = MakeAnimal(AnimalTypes.bird, "yellow");
    let sylvester = MakeAnimal(AnimalTypes.cat, "bushy", "sharp");
    // And then we get pattern matching! (sort of)...
    function describeAnimal(animal) {
        switch (animal.Type) {
            case AnimalTypes.cat:
            case AnimalTypes.dog:
                return "mammalian";
            case AnimalTypes.bird:
                return "Avian";
            default:
                return "Unknown. Alien?";
        }
    }

    function throwNonexistant() {
        return MakeAnimal(AnimalTypes.grue, "imaginary");
    }

    let [_, VehicleTypes] = MakeTypeclass({
        car: ['numWheels', 'mpg']
    });

    function throwWrongSet() {
        return MakeAnimal(VehicleTypes.car, "30");
    }

    expect(FindFromSymbol(AnimalTypes, AnimalTypes.cat)).toBe("cat");

    expect(describeAnimal(sylvester)).toBe("mammalian");
    expect(isSameType(tweety, AnimalTypes.bird)).toBe(true);
    expect(isSameType(AnimalTypes.cat, sylvester)).toBe(true);
    expect(throwNonexistant).toThrow(/Symbol does not exist!/);
    expect(throwWrongSet).toThrow(/Not in category/);

});

test("alphanumeric checks works as expected", () => {
    expect(isAlpha('a')).toBe(true);
    expect(isAlpha('A')).toBe(true);
    expect(isAlpha('2')).toBe(false);
    expect(isAlpha('@')).toBe(false);

    expect(isDigit('a')).toBe(false);
    expect(isDigit('A')).toBe(false);
    expect(isDigit('2')).toBe(true);
    expect(isDigit('@')).toBe(false);

    expect(isAlphaNumeric('a')).toBe(true);
    expect(isAlphaNumeric('A')).toBe(true);
    expect(isAlphaNumeric('2')).toBe(true);
    expect(isAlphaNumeric('@')).toBe(false);
});