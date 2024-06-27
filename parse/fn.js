/**
 * Generate a simple string parser
 *
 * @param {String} str
 * @return {Function} parser function
 */
export function string(str) {
  let len = str.length;

  return (target, position) => {
    if(target.substring(position, position + len) === str) {
      //console.log(`position: ${position} token: `,str);

      return [true, str, position + len];
    }
    return [false, null, position];
  };
}

export function token(str) {
  let tok = str instanceof RegExp ? regex(str) : typeof str == 'string' ? string(str) : str;
  return one(concat(ignore(any(char(' \n\r\t'))), str instanceof RegExp ? regex(str) : typeof str == 'function' ? str : string(str), ignore(any(char(' \n\r\t')))));
  return one(concat(ignore(any(char(' \n\r\t'))), tok /*, ignore(any(char(' \n\r\t')))*/));
  return tok;
}

export function eof() {
  return (target, position) => {
    if(position == target.length) {
      return [true, null, position];
    }
    return [false, null, position];
  };
}

/**
 * Receives a parser and returns a string that the parser can interpret.
 * Generate a parser that can interpret repeated strings
 *
 * @param {Function} parser
 * @return {Function}
 */
export function any(parser) {
  return option(many(parser));
}

/**
 * Receives a parser and returns a string that the parser can interpret.
 * Generate a parser that can interpret repeated strings
 *
 * @param {Function} parser
 * @return {Function}
 */
export function many(parser) {
  return (target, position) => {
    let result = [];
    let success = false;

    for(;;) {
      let parsed = parser(target, position);
      //if the parser received is successful
      if(parsed[0]) {
        result.push(parsed[1]); //store the result
        position = parsed[2]; //update the reading position
        success = true;
      } else {
        break;
      }
    }

    return [success, result, position];
  };
}

/**
 * @param {Array} parsers ... Array of parsers
 * @return {Function}
 */
export function choice(...parsers) {
  return (target, position) => {
    let success = true;

    for(let i = 0; i < parsers.length; i++) {
      let parsed = parsers[i](target, position);
      //If parsing is successful, return the result as it is
      if(parsed[0]) {
        //console.log(`position: ${position} choice: `,parsed);

        return parsed;
      }
    }

    return [false, null, position];
  };
}

/**
 * @param {Array} parsers ... Array of parsers to combine
 * @return {Function} parser
 */
export function seq(...parsers) {
  return (target, position) => {
    let result = [];
    for(let i = 0; i < parsers.length; i++) {
      let parsed = parsers[i](target, position);

      if(parsed[0]) {
        //console.log(`position: ${position} i: ${i}`);

        if(parsed[1] !== null) result.push(parsed[1]);

        position = parsed[2];
      } else {
        //If even one returns a failure, this parser itself returns a failure
        return parsed;
      }
    }
    return [true, result, position];
  };
}

/**
 * @param {Array} parsers ... Array of parsers to combine
 * @return {Function} parser
 */
export function concat(...parsers) {
  return map(seq(...parsers), result => result.filter(e => e !== null));
}

/**
 * @param {Array} parsers ... Array of parsers to combine
 * @return {Function} parser
 */
export function invert(parser) {
  return (target, position) => {
    let result = parser(target, position);

    if(!result[0]) {
      return [true, target.substring(position, position + 1), position + 1];
    }
    return [false, null, position];
  };
}

/**
 * Generate the original parser from the regular expression
 *
 * @param {RegExp} regexp
 * @return {Function}
 */
export function regex(re) {
  if(typeof re == 'string') re = new RegExp('^(?:' + re.source + ')', re.ignoreCase ? 'i' : '');

  return (target, position) => {
    re.lastIndex = 0;
    let regexResult = re.exec(target.slice(position));

    if(regexResult && regexResult.index == 0) {
      //console.log(`position: ${position} regex: ${re}`, regexResult);

      position += regexResult[0].length;
      return [true, regexResult[0], position];
    }
    return [false, null, position];
  };
}

/**
 * @param {String} str
 * @param {Boolean} [inverse]
 * @return {Function}
 */
export function char(str, inverse = false) {
  let dict = {};
  for(let i = 0; i < str.length; i++) dict[str[i]] = str[i];

  return (target, position) => {
    let char = target.slice(position, 1);
    let isMatch = !!dict[char];
    if(inverse ? !isMatch : isMatch) {
      //console.log(`position: ${position} char: ${char}`);
      return [true, char, position + 1];
    }
    return [false, null, position];
  };
}

/**
 * @param {Function} fn
 * @return {Function}
 */
export function lazy(fn) {
  let parser = null;
  return (target, position) => {
    if(!parser) {
      parser = fn();
    }

    return parser(target, position);
  };
}

/**
 * @param {Function} parser
 * @return {Function}
 */
export function option(parser) {
  return (target, position) => {
    let result = parser(target, position);
    if(result[0]) {
      return result;
    }
    return [true, null, position];
  };
}

/**
 * @param {Function} parser
 * @return {Function}
 */
export function ignore(parser) {
  return map(parser, result => null /*(result instanceof Array && result.length == 0) ? null : result*/);
}

/**
 * @param {Function} parser
 * @return {Function}
 */
export function one(parser) {
  return map(parser, result => (result instanceof Array && result.length == 1 ? result[0] : result));
}

/**
 * @param {Function} parser
 * @param {Function} fn
 * @return {Function}
 */
export function map(parser, fn) {
  return (target, position) => {
    let result = parser(target, position);
    if(result[0]) {
      return [result[0], fn(result[1]), result[2]];
    }
    return result;
  };
}

/**
 * @param {Function} parser
 * @param {Function} fn
 * @return {Function}
 */
export function filter(parser, fn) {
  return (target, position) => {
    let result = parser(target, position);
    if(result[0]) {
      return [fn(result[1]), result[1], result[2]];
    }
    return result;
  };
}

export default {
  string,
  token,
  many,
  any,
  choice,
  seq,
  regex,
  char,
  lazy,
  option,
  map,
  filter,
  eof,
  ignore,
  concat,
  invert
};
