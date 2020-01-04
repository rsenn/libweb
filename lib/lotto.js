import Util from "./util.js";

export function LottoNumbers() {
  let args = [...arguments];
  let ret = this instanceof LottoNumbers ? this : new Array();
  /*  if(!(this instanceof LottoNumbers))
   */
  if(ret.add === undefined) ret.add = ret.push;
  if(args.length == 1) {
    if(args[0] && args[0].length !== undefined) args = args[0];
    else if(typeof args[0] === "number") args = Util.bitsToNumbers(args[0]);
  }
  LottoNumbers.prototype.add.apply(ret, args);
  /*  for(let i = 0; i < args.length; i++)
    ret.add(args[i]);
*/
  if(!(this instanceof LottoNumbers)) return Object.assign(ret, LottoNumbers.prototype);
}

LottoNumbers.prototype = new Array();

LottoNumbers.prototype.add = function() {
  const args = [...arguments];
  for(let i = 0; i < args.length; i++) {
    if(this.indexOf(args[i]) == -1) this.push(args[i]);
  }
  this.sort(function(a, b) {
    return a - b;
  });
  return this;
};

LottoNumbers.prototype.toBits = function() {
  let bit = Math.max.apply(Math, [...this]);
  let bin = "";
  for(let i = 0; i < bit; i++) {
    bin = (this.indexOf(i + 1) != -1 ? "1" : "0") + bin;
  }
  return bin;
};

LottoNumbers.prototype.isEmpty = function() {
  return this.length == 0;
};

LottoNumbers.prototype.toBitArray = function() {
  let bitarr = this.toBits().split("");
  bitarr.reverse();
  return bitarr.map(str => parseInt(str));
};

LottoNumbers.prototype.toArray = function() {
  return [...this];
};
LottoNumbers.prototype.toString = function() {
  return this.join(",");
};
LottoNumbers.prototype.toSource = function() {
  return "[" + this.join(",") + "]";
};

export function parseLottoNumbers(arg) {
  //console.log("parseLottoNumbers: ", arg);
  if(arg instanceof LottoNumbers) return arg;
  if(arg instanceof Array) return new LottoNumbers(arg);
  if(/^[0-9]+$/.test(arg)) return new LottoNumbers(parseFloat(arg));
  if(arg && arg.replace) {
    arg = arg.replace(/.*\[([^\]]*)\].*/, "$1");
    let matches = [...arg.matchAll(/[0-9]+/g)];
    return new LottoNumbers(matches.map(m => parseFloat(m)));
  }
  return null;
}

export function arrayToLottoNumber(arr) {
  let numbers = [];
  for(let i = 0; i < arr.length; i++) {
    const number = i + 1;
    if(arr[i]) numbers.push(number);
  }
  const ln = new LottoNumbers(numbers);
  console.log("arr: ", { arr, ln });
  return ln;
}

export function LottoBet(numbers, stars) {
  let ret = this instanceof LottoBet ? this : [[], []];
  let args = [...arguments];

  while(ret.length < 2) ret.push(new LottoNumbers());

  if(args.length == 1 && typeof args[0] === "object") {
    const arg = args[0];

    if(arg.numbers !== undefined && arg.stars !== undefined) {
      ret[0] = new LottoNumbers(arg.numbers);
      ret[1] = new LottoNumbers(arg.stars);
    }
  } else {
    ret[0] = new LottoNumbers(numbers);
    ret[1] = new LottoNumbers(stars);
  }

  if(!(this instanceof LottoBet)) return Object.assign(ret, LottoBet.prototype);
}

LottoBet.prototype = new Array();

Object.defineProperty(LottoBet.prototype, "numbers", {
  get: function() {
    return this[0];
  },
  enumerable: false
});
Object.defineProperty(LottoBet.prototype, "stars", {
  get: function() {
    return this[1];
  },
  enumerable: false
});

Object.assign(LottoBet.prototype, {
  isEmpty() {
    const haveNumbers = this.numbers && this.numbers.length > 0;
    const haveStars = this.stars && this.stars.length > 0;

    return !(haveNumbers || haveStars);
  },

  toArray() {
    return [this[0], this[1]];
  },
  toString() {
    return this.toArray()
      .map(nums => nums.join(","))
      .join("|");
  },
  toSource() {
    return `new LottoBet([${this[0]}],[${this[1]}])`;
  },
  /*
   * (new LottoBet(rs.getBet(0))).toBitArray()
   *
   * cho de
   */
  toBitArray() {
    return this.toArray().map(nums => nums.toBitArray());
  },
  toBitString() {
    return (
      "[" +
      this.toArray()
        .map(nums => "[" + nums.toBitArray().join(",") + "]")
        .join(",") +
      "]"
    );
  }
});

LottoBet.empty = bet => bet[0].length == 0 && bet[1].length == 0;

/*export function BetList() {
  let ret = this instanceof BetList ? this : [];
  let args = [...arguments];


}*/
