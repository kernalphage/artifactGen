"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
let { Scanner, tk } = __1.default.Core;
console.log("what am i doing wrong");
test('Scanner finds all single-character tokens', () => {
    let source = "()[]{},.-+;:/*!@$#?=";
    let scan = new Scanner(source);
    expect(scan.tokens.length).toBe(source.length + 1);
});
test('Scanner can correctly parse comments', () => {
    let source = "WORD // That was a word, couldn't you tell?\n//one more";
    let scan = new Scanner(source);
    expect(scan.tokens.length).toBe(2);
});
test('printing works correctly', () => {
    let source = 'one_word \n 2.5 3.';
    let scan = new Scanner(source);
    expect(scan.tokens[0].toString()).toMatch(/one_word/);
    expect(scan.tokens[1].toString()).toMatch(/2.5/);
});
test('Scanner can correctly parse string literals', () => {
    let source = '"one_word" two_threefour \n "five literals\n so yeah"';
    let scan = new Scanner(source);
    expect(scan.tokens[0].value).toBe("one_word");
    expect(scan.tokens[2].value).toBeTruthy();
    source = "'literally' gone";
    scan = new Scanner(source);
    expect(scan.tokens[0].value).toBe("literally");
});
test('scanner can accurately parse numbers', () => {
    let source = "5.1512 230 0";
    let scan = new Scanner(source);
    expect(scan.tokens.length).toBe(4);
    expect(scan.tokens[1].value).toBe(230);
    expect(scan.tokens[2].value).toBe(0);
});
test('Scanner breaks on unterminated strings ', () => {
    let source = '"terminated", "unterminated';
    let scan = new Scanner(source);
    expect(scan.tokens.length).toBe(0);
});
test('Scanner breaks on incorrect characters ', () => {
    let source = '~`^';
    let scan = new Scanner(source);
    expect(scan.tokens[0].symbol).toBe(7);
});
test("string interpolation", () => {
    let source = '1 "oh {@god} what" "how @dare.you thing" "@or" you "b{close.line}" " {} "  "{}" ';
    let scan = new Scanner(source);
    console.log(scan.export());
});
test('Scanner export', () => {
    let source = `
    [item]
    pi : 3.14;
    randomItem : 1:10;
    a, b : c, d | 1, 2;
    
    [Second]
    value : "special 324"
   `;
    let scan = new Scanner(source);
    expect(scan.export()).toMatchSnapshot();
});
