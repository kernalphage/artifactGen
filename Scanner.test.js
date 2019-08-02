import {Scanner} from './Scanner.js';

test('Scanner finds all single-character tokens', () => {
  let source = "()[]{},.-+;:/*!@$#?=";
  let scan = new Scanner(source);
  expect(scan.tokens.length).toBe(source.length);
});

test('Scanner can correctly parse comments', () => {
    let source = "WORD // That was a word, couldn't you tell?\n//one more";
    let scan = new Scanner(source);
    console.log(scan.export());
    expect(scan.tokens.length).toBe(2); // WORD and \n
});

test('Scanner can correctly parse literals', ()=>{
    let source = 'one_word two-threefour "five literals so yeah"';
    let scan = new Scanner(source);
});