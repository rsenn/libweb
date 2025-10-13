/*
 * jsondiff
 *   - simple hierarchical diff between two JSON files
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 * Copyright 2012 Joshua M. Clulow <josh@sysmgr.org>
 *
 */

export function getKeysSorted(obj) {
  let keys = [];
  for(let k in obj) {
    if(obj.hasOwnProperty(k)) keys.push(k);
  }
  return keys.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));
}

export function twoDee(m, n) {
  let c = [];
  for(let i = 0; i < m; i++) {
    c[i] = [];
    for(let j = 0; j < n; j++) c[i][j] = 0;
  }
  return c;
}

export function deepEqual(a, b) {
  if(whatis(a) !== whatis(b)) return false;
  if(whatis(a) === 'object') {
    for(var k in a) {
      if(a.hasOwnProperty(k)) if (!deepEqual(a[k], b[k])) return false;
    }
    for(var k in b) {
      if(b.hasOwnProperty(k)) if (!deepEqual(a[k], b[k])) return false;
    }
    return true;
  }
  if(whatis(a) === 'array') {
    if(a.length !== b.length) return false;
    for(let i = 0; i < a.length; i++) if(!deepEqual(a[i], b[i])) return false;
    return true;
  }
  return a === b;
}

export function makeLCSArray2(x, y) {
  /*X[1..m], Y[1..n]*/
  let c = twoDee(x.length + 1, y.length + 1);
  for(let i = 0; i < x.length; i++) {
    for(let j = 0; j < y.length; j++) {
      if(deepEqual(x[i], y[j])) {
        c[i + 1][j + 1] = c[i][j] + 1;
      } else {
        let m = Math.max(c[i + 1][j], c[i][j + 1]);
        c[i + 1][j + 1] = m;
      }
    }
  }
  return c;
}

export function makeLCSArray(x, y) {
  /*X[1..m], Y[1..n]*/
  let c = twoDee(x.length + 1, y.length + 1);
  for(let i = 0; i < x.length; i++) {
    for(let j = 0; j < y.length; j++) {
      if(x[i] === y[j]) {
        c[i + 1][j + 1] = c[i][j] + 1;
      } else {
        let m = Math.max(c[i + 1][j], c[i][j + 1]);
        c[i + 1][j + 1] = m;
      }
    }
  }
  return c;
}

export function whatis(x) {
  if(x === null) return 'null';
  if(x === undefined) return 'undefined';
  let tof = typeof x;
  if(tof === 'number' || tof === 'string' || tof === 'boolean') return 'scalar';
  if(tof === 'object') {
    if(x.constructor === Array) {
      return 'array';
    }
    return 'object';
  }
  return 'unknown';
}

export function makeArrayKeys(a) {
  let k = [];
  for(let i = 0; i < a.length; i++) k.push(i);
  return k;
}

export function arrayDiff(a, b) {
  let typeA = whatis(a);
  let typeB = whatis(b);
  let list = [];
  if(typeA !== 'array' || typeB !== 'array') {
    log('ERROR: top level types should be array');
    return null;
  }
  let cc = makeLCSArray2(a, b);

  function diffInternal(c, x, y, i, j) {
    if(i > 0 && j > 0 && deepEqual(x[i - 1], y[j - 1])) {
      diffInternal(c, x, y, i - 1, j - 1);
      var va = x[i - 1];
      var o = {
        action: 'common',
        type: whatis(va),
      };
      if(o.type === 'object') o.diff = objectDiff(va, va);
      else if(o.type === 'array') o.diff = arrayDiff(va, va);
      else o.value = va;
      list.push(o);
    } else if(j > 0 && (i === 0 || c[i][j - 1] >= c[i - 1][j])) {
      diffInternal(c, x, y, i, j - 1);
      let vb = y[j - 1];
      var o = {
        action: 'add',
        type: whatis(vb),
      };
      if(o.type === 'object') o.diff = objectDiff({}, vb);
      else if(o.type === 'array') o.diff = arrayDiff([], vb);
      else o.value = vb;
      list.push(o);
    } else if(i > 0 && (j === 0 || c[i][j - 1] < c[i - 1][j])) {
      diffInternal(c, x, y, i - 1, j);
      var va = x[i - 1];
      var o = {
        action: 'remove',
        type: whatis(va),
      };
      if(o.type === 'object') o.diff = objectDiff(va, {});
      else if(o.type === 'array') o.diff = arrayDiff(va, []);
      else o.value = va;
      list.push(o);
    }
  }
  diffInternal(cc, a, b, cc.length - 1, cc[0].length - 1);
  return list;
}

export function objectDiff(a, b) {
  let keysA, keysB;
  let typeA = whatis(a);
  let typeB = whatis(b);
  let list = [];

  if(typeA !== typeB) {
    log('ERROR: top level types should be the same: had ' + typeA + ' and ' + typeB);
    return null;
  }

  if(typeA === 'array') return arrayDiff(a, b);

  keysA = getKeysSorted(a);
  keysB = getKeysSorted(b);
  let cc = makeLCSArray(keysA, keysB);

  function diffInternal(c, x, y, i, j) {
    if(i > 0 && j > 0 && x[i - 1] === y[j - 1]) {
      diffInternal(c, x, y, i - 1, j - 1);
      var key = x[i - 1];
      let va = a[key];
      let vb = b[key];
      let wva = whatis(va);
      let wvb = whatis(vb);
      if(wva === wvb && (wva === 'object' || wva === 'array')) {
        list.push({
          key,
          type: wva,
          action: 'common',
          diff: objectDiff(va, vb),
        });
      } else if(va === vb) {
        list.push({
          action: 'common',
          key,
          type: wva,
          value: va,
        });
      } else {
        let orem = {
          action: 'remove',
          key,
          type: wva,
          value: va,
        };
        if(orem.type === 'object') orem.diff = objectDiff(orem.value, {});
        else if(orem.type === 'array') orem.diff = objectDiff(orem.value, []);
        list.push(orem);

        let oadd = {
          action: 'add',
          key,
          type: wvb,
          value: vb,
        };
        if(oadd.type === 'object') oadd.diff = objectDiff({}, oadd.value);
        else if(oadd.type === 'array') oadd.diff = objectDiff([], oadd.value);
        list.push(oadd);
      }
    } else if(j > 0 && (i === 0 || c[i][j - 1] >= c[i - 1][j])) {
      diffInternal(c, x, y, i, j - 1);
      var key = y[j - 1];
      var o = {
        action: 'add',
        key,
        type: whatis(b[key]),
      };
      if(o.type === 'object') o.diff = objectDiff({}, b[key]);
      else if(o.type === 'array') o.diff = objectDiff([], b[key]);
      else o.value = b[key];
      list.push(o);
    } else if(i > 0 && (j === 0 || c[i][j - 1] < c[i - 1][j])) {
      diffInternal(c, x, y, i - 1, j);
      var key = x[i - 1];
      var o = {
        action: 'remove',
        key,
        type: whatis(a[key]),
      };
      if(o.type === 'object') o.diff = objectDiff(a[key], {});
      else if(o.type === 'array') o.diff = objectDiff(a[key], []);
      else o.value = a[key];
      list.push(o);
    }
  }
  diffInternal(cc, keysA, keysB, cc.length - 1, cc[0].length - 1);
  return list;
}

/*

function printDiff(a, topType) {
  var ind = 1;
  function indent() {
    var s = '';
    while(s.length < ind * 2)
      s += ' ';
    return s;
  }

  function recurs(a, k) {
    for(var i = 0; i < a.length; i++) {
      function comma() { return ((i + 1 < a.length) ? ',' : ''); }
      var o = a[i];
      var ch = o.action === 'add'    ? '+' :
               o.action === 'remove' ? '-' : ' ';
      if(o.type === 'object' || o.type === 'array') {
        var del = o.type === 'object' ? ['{', '}'] : ['[', ']'];
        log(ch + indent() + (k ? o.key + ': ' : '') + del[0]);
        ind++;
        recurs(o.diff, o.type === 'object');
        ind--;
        log(ch + indent() + del[1] + comma());
      } else {
        log(ch + indent() + (k ? o.key + ': ' : '') +
          JSON.stringify(o.value) + comma());
      }
    }
  }

  log(topType === 'object' ? '{' : '[');
  recurs(a, topType === 'object');
  log(topType === 'object' ? '}' : ']');
}

*/
/**************************************************************************
 * MAIN PROGRAM                                                           *
 **************************************************************************/
/*
var fs = require('fs');
var util = require('util');
var log = console.log;
var exit = process.exit;
var ins = util.inspect;

if(process.argv.length !== 4) {
  log('Usage: ' + process.argv[1] + ' <jsonfile1> <jsonfile2>');
  exit(1);
}

try {
  var left = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  var right = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
} catch(err) {
  log('ERROR: while reading input files: ' + err.message);
  exit(2);
}

var od = objectDiff(left, right);
  printDiff(od, whatis(left));
exit(0);*/
