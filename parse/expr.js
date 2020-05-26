export function literal(lit) {
  return ({ input, ast }) => {
    if(input.indexOf(lit) === 0) {
      return { input: input.substr(lit.length), ast };
    } else {
      return {
        error: `expected ${lit}, but got ${input.substr(0, lit.length)}...`
      };
    }
  };
}

export function optional(arg) {
  return arg => {
    const result = arg(arg);
    if(result.error) {
      return arg; // as if nothing happened
    } else {
      return result;
    }
  };
}

export function seq(...args) {
  return arg => {
    let nextArg = arg;
    for(let i = 0; i < args.length; i++) {
      const arg = args[i];
      nextArg = arg(nextArg);
      if(nextArg.error) {
        return nextArg;
      }
    }
    return nextArg;
  };
}

export function or(...args) {
  return arg => {
    for(let i = 0; i < args.length; i++) {
      const arg = args[i];
      const res = arg(arg);
      if(!res.error) {
        return res;
      }
    }
    return nextArg;
  };
}

export function assoc(obj, key, val) {
  const kv = {};
  kv[key] = val;
  return Object.assign({}, obj, kv);
}

export function param(name, re = /^[a-z]+/, parse = String) {
  return ({ input, ast }) => {
    const match = re.exec(input);
    if(match) {
      return {
        input: match.input.substr(match.index + match[0].length),
        ast: assoc(ast, name, parse(match[0]))
      };
    } else {
      return { error: 'Did not match ' + re };
    }
  };
}

export function exhaustive(arg) {
  return arg => {
    const result = arg(arg);
    if(result.input.length > 0) {
      return { error: 'Was meant to be exhaustive, but look at this remainder: ' + result.input };
    } else {
      return result;
    }
  };
}

export default {
  literal,
  optional,
  seq,
  or,
  param,
  exhaustive
};
