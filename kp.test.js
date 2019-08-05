import {_} from 'lodash';
import {makeEnum, MakeTypeclass, isAlpha, isAlphaNumeric, isDigit, isSameType} from "./kp.js";

test('basic definition', () => {

    let [MakeAnimal, AnimalTypes] = MakeTypeclass({cat:['tail'], bird:['wing']}, "Animals");
    let tweety = MakeAnimal(AnimalTypes.bird, "yellow");
    let sylvester = MakeAnimal(AnimalTypes.cat, "bushy", "sharp");
    // And then we get pattern matching! (sort of)...
    function describeAnimal(animal) {
        switch(animal.Type){
            case AnimalTypes.cat:
            case AnimalTypes.dog:
                return "mammalian";
            case AnimalTypes.bird:
                return "Avian";
            default:
                return "Unknown. Alien?";
        }
    }

    expect(isSameType(tweety, AnimalTypes.bird)).toBe(true);
    expect(isSameType(sylvester, AnimalTypes.cat)).toBe(true);
});

test("alphanumeric checks works as expected", ()=>{
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