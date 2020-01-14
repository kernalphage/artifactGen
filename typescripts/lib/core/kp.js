"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isSameType(a, b) {
    a = (a instanceof Object) ? a.Type : a;
    b = (b instanceof Object) ? b.Type : b;
    return a === b;
}
exports.isSameType = isSameType;
function isDigit(c) {
    return c >= '0' && c <= '9';
}
exports.isDigit = isDigit;
function isAlpha(c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_';
}
exports.isAlpha = isAlpha;
function isAlphaNumeric(c) {
    return isAlpha(c) || isDigit(c);
}
exports.isAlphaNumeric = isAlphaNumeric;
function isEmoji(c) {
    let filter = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/ug;
    return !!c.match(filter);
}
exports.isEmoji = isEmoji;
function isLiteral(c) {
    return isAlphaNumeric(c) || isEmoji(c);
}
exports.isLiteral = isLiteral;
function randomRangeInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
exports.randomRangeInt = randomRangeInt;
function getWholeChar(str, i) {
    var code = str.charCodeAt(i);
    if (Number.isNaN(code) || i > str.length) {
        return "";
    }
    if (code < 0xD800 || code > 0xDFFF) {
        return str.charAt(i);
    }
    if (0xD800 <= code && code <= 0xDBFF) {
        if (str.length <= (i + 1)) {
            throw 'High surrogate without following low surrogate';
        }
        var next = str.charCodeAt(i + 1);
        if (0xDC00 > next || next > 0xDFFF) {
            throw 'High surrogate without following low surrogate';
        }
        return str.charAt(i) + str.charAt(i + 1);
    }
    if (i === 0) {
        throw 'Low surrogate without preceding high surrogate';
    }
    var prev = str.charCodeAt(i - 1);
    if (0xD800 > prev || prev > 0xDBFF) {
        throw 'Low surrogate without preceding high surrogate';
    }
    return null;
}
exports.getWholeChar = getWholeChar;
