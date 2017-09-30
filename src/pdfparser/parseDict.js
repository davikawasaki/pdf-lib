import parseNull from './parseNull';
import parseIndirectRef from './parseIndirectRef';
import parseString from './parseString';
import parseHexString from './parseHexString';
import parseName from './parseName';
import parseBool from './parseBool';
import parseNumber from './parseNumber';
import parseArray from './parseArray';

const parseDict = (input, parseHandlers) => {
  const obj = {};
  const trimmed = input.trim();
  if (trimmed.substring(0, 2) !== '<<') return null;

  let remainder = trimmed.substring(2).trim(); // Remove starting '<<'
  while (remainder.substring(0, 2) !== '>>' && remainder.length > 0) {
    // Parse the key for this entry
    const { pdfObject: key, remainder: r1 } = parseName(remainder, parseHandlers);
    remainder = r1;

    // Parse the value for this entry
    const { pdfObject, remainder: r2 } =
      parseNull(remainder, parseHandlers)        ||
      parseIndirectRef(remainder, parseHandlers) ||
      parseString(remainder, parseHandlers)      ||
      parseHexString(remainder, parseHandlers)   ||
      parseName(remainder, parseHandlers)        ||
      parseBool(remainder, parseHandlers)        ||
      parseNumber(remainder, parseHandlers)      ||
      parseArray(remainder, parseHandlers)       ||
      parseDict(remainder, parseHandlers);

    obj[key] = pdfObject;
    remainder = r2;
  }
  if (remainder.substring(0, 2) !== '>>') throw new Error('Mismatched brackets!');
  remainder = remainder.substring(2).trim(); // Remove ending '>>' pair

  const { onParseDict=() => {} } = parseHandlers;
  return { pdfObject: onParseDict(obj) || obj, remainder };
}

export default parseDict;
