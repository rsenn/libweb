"use strict";

function peg$subclass(child, parent) {
  function ctor() {
    this.constructor = child;
  }

  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
}

function peg$SyntaxError(message, expected, found, location) {
  this.message = message;
  this.expected = expected;
  this.found = found;
  this.location = location;
  this.name = "SyntaxError";

  if (typeof Error.captureStackTrace === "function") {
    Error.captureStackTrace(this, peg$SyntaxError);
  }
}

peg$subclass(peg$SyntaxError, Error);

peg$SyntaxError.buildMessage = function (expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
    literal: function (expectation) {
      return '"' + literalEscape(expectation.text) + '"';
    },
    class: function (expectation) {
      var escapedParts = "",
          i;

      for (i = 0; i < expectation.parts.length; i++) {
        escapedParts += expectation.parts[i] instanceof Array ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1]) : classEscape(expectation.parts[i]);
      }

      return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
    },
    any: function (expectation) {
      return "any character";
    },
    end: function (expectation) {
      return "end of input";
    },
    other: function (expectation) {
      return expectation.description;
    }
  };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function (ch) {
      return "\\x0" + hex(ch);
    }).replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) {
      return "\\x" + hex(ch);
    });
  }

  function classEscape(s) {
    return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function (ch) {
      return "\\x0" + hex(ch);
    }).replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) {
      return "\\x" + hex(ch);
    });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = new Array(expected.length),
        i,
        j;

    for (i = 0; i < expected.length; i++) {
      descriptions[i] = describeExpectation(expected[i]);
    }

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }

      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
    }
  }

  function describeFound(found) {
    return found ? '"' + literalEscape(found) + '"' : "end of input";
  }

  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};

function peg$parse(input, options) {
  options = options !== void 0 ? options : {};

  var peg$FAILED = {},
      peg$startRuleFunctions = {
    svg_path: peg$parsesvg_path
  },
      peg$startRuleFunction = peg$parsesvg_path,
      peg$c0 = function (data) {
    if (!data) return [];

    for (var cmds = [], i = 0; i < data.length; i++) cmds = cmds.concat.apply(cmds, data[i]);

    var first = cmds[0];

    if (first && first.code == "m") {
      delete first.relative;
      first.code = "M";
    }

    return cmds;
  },
      peg$c1 = function (first, more) {
    return merge(first, more);
  },
      peg$c2 = /^[Mm]/,
      peg$c3 = peg$classExpectation(["M", "m"], false, false),
      peg$c4 = function (c, first, more) {
    var move = commands(c, [first]);
    if (more) move = move.concat(commands(c == "M" ? "L" : "l", more[1]));
    return move;
  },
      peg$c5 = /^[Zz]/,
      peg$c6 = peg$classExpectation(["Z", "z"], false, false),
      peg$c7 = function () {
    return commands("Z");
  },
      peg$c8 = /^[Ll]/,
      peg$c9 = peg$classExpectation(["L", "l"], false, false),
      peg$c10 = function (c, args) {
    return commands(c, args);
  },
      peg$c11 = /^[Hh]/,
      peg$c12 = peg$classExpectation(["H", "h"], false, false),
      peg$c13 = function (c, args) {
    return commands(c, args.map(function (x) {
      return {
        x: x
      };
    }));
  },
      peg$c14 = /^[Vv]/,
      peg$c15 = peg$classExpectation(["V", "v"], false, false),
      peg$c16 = function (c, args) {
    return commands(c, args.map(function (y) {
      return {
        y: y
      };
    }));
  },
      peg$c17 = /^[Cc]/,
      peg$c18 = peg$classExpectation(["C", "c"], false, false),
      peg$c19 = function (a, b, c) {
    return {
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      x: c.x,
      y: c.y
    };
  },
      peg$c20 = /^[Ss]/,
      peg$c21 = peg$classExpectation(["S", "s"], false, false),
      peg$c22 = function (b, c) {
    return {
      x2: b.x,
      y2: b.y,
      x: c.x,
      y: c.y
    };
  },
      peg$c23 = /^[Qq]/,
      peg$c24 = peg$classExpectation(["Q", "q"], false, false),
      peg$c25 = function (a, b) {
    return {
      x1: a.x,
      y1: a.y,
      x: b.x,
      y: b.y
    };
  },
      peg$c26 = /^[Tt]/,
      peg$c27 = peg$classExpectation(["T", "t"], false, false),
      peg$c28 = /^[Aa]/,
      peg$c29 = peg$classExpectation(["A", "a"], false, false),
      peg$c30 = function (rx, ry, xrot, large, sweep, xy) {
    return {
      rx: rx,
      ry: ry,
      xAxisRotation: xrot,
      largeArc: large,
      sweep: sweep,
      x: xy.x,
      y: xy.y
    };
  },
      peg$c31 = function (x, y) {
    return {
      x: x,
      y: y
    };
  },
      peg$c32 = function (n) {
    return n * 1;
  },
      peg$c33 = function (parts) {
    return parts.join("") * 1;
  },
      peg$c34 = /^[01]/,
      peg$c35 = peg$classExpectation(["0", "1"], false, false),
      peg$c36 = function (bit) {
    return bit == "1";
  },
      peg$c37 = function () {
    return "";
  },
      peg$c38 = ",",
      peg$c39 = peg$literalExpectation(",", false),
      peg$c40 = function (parts) {
    return parts.join("");
  },
      peg$c41 = ".",
      peg$c42 = peg$literalExpectation(".", false),
      peg$c43 = /^[eE]/,
      peg$c44 = peg$classExpectation(["e", "E"], false, false),
      peg$c45 = /^[+\-]/,
      peg$c46 = peg$classExpectation(["+", "-"], false, false),
      peg$c47 = /^[0-9]/,
      peg$c48 = peg$classExpectation([["0", "9"]], false, false),
      peg$c49 = function (digits) {
    return digits.join("");
  },
      peg$c50 = /^[ \t\n\r]/,
      peg$c51 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false),
      peg$currPos = 0,
      peg$savedPos = 0,
      peg$posDetailsCache = [{
    line: 1,
    column: 1
  }],
      peg$maxFailPos = 0,
      peg$maxFailExpected = [],
      peg$silentFails = 0,
      peg$result;

  if ("startRule" in options) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + '".');
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }

  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }

  function expected(description, location) {
    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos);
    throw peg$buildStructuredError([peg$otherExpectation(description)], input.substring(peg$savedPos, peg$currPos), location);
  }

  function error(message, location) {
    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos);
    throw peg$buildSimpleError(message, location);
  }

  function peg$literalExpectation(text, ignoreCase) {
    return {
      type: "literal",
      text: text,
      ignoreCase: ignoreCase
    };
  }

  function peg$classExpectation(parts, inverted, ignoreCase) {
    return {
      type: "class",
      parts: parts,
      inverted: inverted,
      ignoreCase: ignoreCase
    };
  }

  function peg$anyExpectation() {
    return {
      type: "any"
    };
  }

  function peg$endExpectation() {
    return {
      type: "end"
    };
  }

  function peg$otherExpectation(description) {
    return {
      type: "other",
      description: description
    };
  }

  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos],
        p;

    if (details) {
      return details;
    } else {
      p = pos - 1;

      while (!peg$posDetailsCache[p]) {
        p--;
      }

      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;
      return details;
    }
  }

  function peg$computeLocation(startPos, endPos) {
    var startPosDetails = peg$computePosDetails(startPos),
        endPosDetails = peg$computePosDetails(endPos);
    return {
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
  }

  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) {
      return;
    }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected);
  }

  function peg$buildSimpleError(message, location) {
    return new peg$SyntaxError(message, null, null, location);
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(peg$SyntaxError.buildMessage(expected, found), expected, found, location);
  }

  function peg$parsesvg_path() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parsewsp();

    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parsewsp();
    }

    if (s1 !== peg$FAILED) {
      s2 = peg$parsemoveTo_drawTo_commandGroups();

      if (s2 === peg$FAILED) {
        s2 = null;
      }

      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parsewsp();

        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parsewsp();
        }

        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c0(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsemoveTo_drawTo_commandGroups() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsemoveTo_drawTo_commandGroup();

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = [];
      s5 = peg$parsewsp();

      while (s5 !== peg$FAILED) {
        s4.push(s5);
        s5 = peg$parsewsp();
      }

      if (s4 !== peg$FAILED) {
        s5 = peg$parsemoveTo_drawTo_commandGroup();

        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = [];
        s5 = peg$parsewsp();

        while (s5 !== peg$FAILED) {
          s4.push(s5);
          s5 = peg$parsewsp();
        }

        if (s4 !== peg$FAILED) {
          s5 = peg$parsemoveTo_drawTo_commandGroup();

          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }

      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsemoveTo_drawTo_commandGroup() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsemoveto();

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = [];
      s5 = peg$parsewsp();

      while (s5 !== peg$FAILED) {
        s4.push(s5);
        s5 = peg$parsewsp();
      }

      if (s4 !== peg$FAILED) {
        s5 = peg$parsedrawto_command();

        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = [];
        s5 = peg$parsewsp();

        while (s5 !== peg$FAILED) {
          s4.push(s5);
          s5 = peg$parsewsp();
        }

        if (s4 !== peg$FAILED) {
          s5 = peg$parsedrawto_command();

          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }

      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsedrawto_command() {
    var s0;
    s0 = peg$parseclosepath();

    if (s0 === peg$FAILED) {
      s0 = peg$parselineto();

      if (s0 === peg$FAILED) {
        s0 = peg$parsehorizontal_lineto();

        if (s0 === peg$FAILED) {
          s0 = peg$parsevertical_lineto();

          if (s0 === peg$FAILED) {
            s0 = peg$parsecurveto();

            if (s0 === peg$FAILED) {
              s0 = peg$parsesmooth_curveto();

              if (s0 === peg$FAILED) {
                s0 = peg$parsequadratic_bezier_curveto();

                if (s0 === peg$FAILED) {
                  s0 = peg$parsesmooth_quadratic_bezier_curveto();

                  if (s0 === peg$FAILED) {
                    s0 = peg$parseelliptical_arc();
                  }
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parsemoveto() {
    var s0, s1, s2, s3, s4, s5, s6;
    s0 = peg$currPos;

    if (peg$c2.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c3);
      }
    }

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parsecoordinate_pair();

        if (s3 !== peg$FAILED) {
          s4 = peg$currPos;
          s5 = peg$parsecomma_wsp();

          if (s5 === peg$FAILED) {
            s5 = null;
          }

          if (s5 !== peg$FAILED) {
            s6 = peg$parselineto_argument_sequence();

            if (s6 !== peg$FAILED) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }

          if (s4 === peg$FAILED) {
            s4 = null;
          }

          if (s4 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c4(s1, s3, s4);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseclosepath() {
    var s0, s1;
    s0 = peg$currPos;

    if (peg$c5.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c6);
      }
    }

    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c7();
    }

    s0 = s1;
    return s0;
  }

  function peg$parselineto() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;

    if (peg$c8.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c9);
      }
    }

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parselineto_argument_sequence();

        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c10(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parselineto_argument_sequence() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsecoordinate_pair();

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsecomma_wsp();

      if (s4 === peg$FAILED) {
        s4 = null;
      }

      if (s4 !== peg$FAILED) {
        s5 = peg$parsecoordinate_pair();

        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parsecomma_wsp();

        if (s4 === peg$FAILED) {
          s4 = null;
        }

        if (s4 !== peg$FAILED) {
          s5 = peg$parsecoordinate_pair();

          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }

      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsehorizontal_lineto() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;

    if (peg$c11.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c12);
      }
    }

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parsecoordinate_sequence();

        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c13(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecoordinate_sequence() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsenumber();

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsecomma_wsp();

      if (s4 === peg$FAILED) {
        s4 = null;
      }

      if (s4 !== peg$FAILED) {
        s5 = peg$parsenumber();

        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parsecomma_wsp();

        if (s4 === peg$FAILED) {
          s4 = null;
        }

        if (s4 !== peg$FAILED) {
          s5 = peg$parsenumber();

          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }

      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsevertical_lineto() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;

    if (peg$c14.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c15);
      }
    }

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parsecoordinate_sequence();

        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c16(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecurveto() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;

    if (peg$c17.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c18);
      }
    }

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parsecurveto_argument_sequence();

        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c10(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecurveto_argument_sequence() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsecurveto_argument();

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsecomma_wsp();

      if (s4 === peg$FAILED) {
        s4 = null;
      }

      if (s4 !== peg$FAILED) {
        s5 = peg$parsecurveto_argument();

        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parsecomma_wsp();

        if (s4 === peg$FAILED) {
          s4 = null;
        }

        if (s4 !== peg$FAILED) {
          s5 = peg$parsecurveto_argument();

          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }

      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecurveto_argument() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsecoordinate_pair();

    if (s1 !== peg$FAILED) {
      s2 = peg$parsecomma_wsp();

      if (s2 === peg$FAILED) {
        s2 = null;
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parsecoordinate_pair();

        if (s3 !== peg$FAILED) {
          s4 = peg$parsecomma_wsp();

          if (s4 === peg$FAILED) {
            s4 = null;
          }

          if (s4 !== peg$FAILED) {
            s5 = peg$parsecoordinate_pair();

            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c19(s1, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsesmooth_curveto() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;

    if (peg$c20.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c21);
      }
    }

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parsesmooth_curveto_argument_sequence();

        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c10(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsesmooth_curveto_argument_sequence() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsesmooth_curveto_argument();

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsecomma_wsp();

      if (s4 === peg$FAILED) {
        s4 = null;
      }

      if (s4 !== peg$FAILED) {
        s5 = peg$parsesmooth_curveto_argument();

        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parsecomma_wsp();

        if (s4 === peg$FAILED) {
          s4 = null;
        }

        if (s4 !== peg$FAILED) {
          s5 = peg$parsesmooth_curveto_argument();

          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }

      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsesmooth_curveto_argument() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parsecoordinate_pair();

    if (s1 !== peg$FAILED) {
      s2 = peg$parsecomma_wsp();

      if (s2 === peg$FAILED) {
        s2 = null;
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parsecoordinate_pair();

        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c22(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsequadratic_bezier_curveto() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;

    if (peg$c23.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c24);
      }
    }

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parsequadratic_bezier_curveto_argument_sequence();

        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c10(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsequadratic_bezier_curveto_argument_sequence() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsequadratic_bezier_curveto_argument();

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsecomma_wsp();

      if (s4 === peg$FAILED) {
        s4 = null;
      }

      if (s4 !== peg$FAILED) {
        s5 = peg$parsequadratic_bezier_curveto_argument();

        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parsecomma_wsp();

        if (s4 === peg$FAILED) {
          s4 = null;
        }

        if (s4 !== peg$FAILED) {
          s5 = peg$parsequadratic_bezier_curveto_argument();

          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }

      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsequadratic_bezier_curveto_argument() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parsecoordinate_pair();

    if (s1 !== peg$FAILED) {
      s2 = peg$parsecomma_wsp();

      if (s2 === peg$FAILED) {
        s2 = null;
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parsecoordinate_pair();

        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c25(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsesmooth_quadratic_bezier_curveto() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;

    if (peg$c26.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c27);
      }
    }

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parsesmooth_quadratic_bezier_curveto_argument_sequence();

        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c10(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsesmooth_quadratic_bezier_curveto_argument_sequence() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parsecoordinate_pair();

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsecomma_wsp();

      if (s4 === peg$FAILED) {
        s4 = null;
      }

      if (s4 !== peg$FAILED) {
        s5 = peg$parsecoordinate_pair();

        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parsecomma_wsp();

        if (s4 === peg$FAILED) {
          s4 = null;
        }

        if (s4 !== peg$FAILED) {
          s5 = peg$parsecoordinate_pair();

          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }

      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseelliptical_arc() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;

    if (peg$c28.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c29);
      }
    }

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parsewsp();

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parsewsp();
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parseelliptical_arc_argument_sequence();

        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c10(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseelliptical_arc_argument_sequence() {
    var s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parseelliptical_arc_argument();

    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parsecomma_wsp();

      if (s4 === peg$FAILED) {
        s4 = null;
      }

      if (s4 !== peg$FAILED) {
        s5 = peg$parseelliptical_arc_argument();

        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }

      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parsecomma_wsp();

        if (s4 === peg$FAILED) {
          s4 = null;
        }

        if (s4 !== peg$FAILED) {
          s5 = peg$parseelliptical_arc_argument();

          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }

      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseelliptical_arc_argument() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;
    s0 = peg$currPos;
    s1 = peg$parsenonnegative_number();

    if (s1 !== peg$FAILED) {
      s2 = peg$parsecomma_wsp();

      if (s2 === peg$FAILED) {
        s2 = null;
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parsenonnegative_number();

        if (s3 !== peg$FAILED) {
          s4 = peg$parsecomma_wsp();

          if (s4 === peg$FAILED) {
            s4 = null;
          }

          if (s4 !== peg$FAILED) {
            s5 = peg$parsenumber();

            if (s5 !== peg$FAILED) {
              s6 = peg$parsecomma_wsp();

              if (s6 !== peg$FAILED) {
                s7 = peg$parseflag();

                if (s7 !== peg$FAILED) {
                  s8 = peg$parsecomma_wsp();

                  if (s8 === peg$FAILED) {
                    s8 = null;
                  }

                  if (s8 !== peg$FAILED) {
                    s9 = peg$parseflag();

                    if (s9 !== peg$FAILED) {
                      s10 = peg$parsecomma_wsp();

                      if (s10 === peg$FAILED) {
                        s10 = null;
                      }

                      if (s10 !== peg$FAILED) {
                        s11 = peg$parsecoordinate_pair();

                        if (s11 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$c30(s1, s3, s5, s7, s9, s11);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$FAILED;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsecoordinate_pair() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$parsenumber();

    if (s1 !== peg$FAILED) {
      s2 = peg$parsecomma_wsp();

      if (s2 === peg$FAILED) {
        s2 = null;
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parsenumber();

        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c31(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parsenonnegative_number() {
    var s0, s1;
    s0 = peg$currPos;
    s1 = peg$parsefloating_point_constant();

    if (s1 === peg$FAILED) {
      s1 = peg$parsedigit_sequence();
    }

    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c32(s1);
    }

    s0 = s1;
    return s0;
  }

  function peg$parsenumber() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parsesign();

    if (s2 === peg$FAILED) {
      s2 = null;
    }

    if (s2 !== peg$FAILED) {
      s3 = peg$parsefloating_point_constant();

      if (s3 !== peg$FAILED) {
        s2 = [s2, s3];
        s1 = s2;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }

    if (s1 === peg$FAILED) {
      s1 = peg$currPos;
      s2 = peg$parsesign();

      if (s2 === peg$FAILED) {
        s2 = null;
      }

      if (s2 !== peg$FAILED) {
        s3 = peg$parsedigit_sequence();

        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    }

    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c33(s1);
    }

    s0 = s1;
    return s0;
  }

  function peg$parseflag() {
    var s0, s1;
    s0 = peg$currPos;

    if (peg$c34.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c35);
      }
    }

    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c36(s1);
    }

    s0 = s1;
    return s0;
  }

  function peg$parsecomma_wsp() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parsewsp();

    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsewsp();
      }
    } else {
      s1 = peg$FAILED;
    }

    if (s1 !== peg$FAILED) {
      s2 = peg$parsecomma();

      if (s2 === peg$FAILED) {
        s2 = null;
      }

      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parsewsp();

        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parsewsp();
        }

        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$parsecomma();

      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parsewsp();

        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parsewsp();
        }

        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }

      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c37();
      }

      s0 = s1;
    }

    return s0;
  }

  function peg$parsecomma() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 44) {
      s0 = peg$c38;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c39);
      }
    }

    return s0;
  }

  function peg$parsefloating_point_constant() {
    var s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parsefractional_constant();

    if (s2 !== peg$FAILED) {
      s3 = peg$parseexponent();

      if (s3 === peg$FAILED) {
        s3 = null;
      }

      if (s3 !== peg$FAILED) {
        s2 = [s2, s3];
        s1 = s2;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }

    if (s1 === peg$FAILED) {
      s1 = peg$currPos;
      s2 = peg$parsedigit_sequence();

      if (s2 !== peg$FAILED) {
        s3 = peg$parseexponent();

        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    }

    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c40(s1);
    }

    s0 = s1;
    return s0;
  }

  function peg$parsefractional_constant() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$parsedigit_sequence();

    if (s2 === peg$FAILED) {
      s2 = null;
    }

    if (s2 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 46) {
        s3 = peg$c41;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;

        if (peg$silentFails === 0) {
          peg$fail(peg$c42);
        }
      }

      if (s3 !== peg$FAILED) {
        s4 = peg$parsedigit_sequence();

        if (s4 !== peg$FAILED) {
          s2 = [s2, s3, s4];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }

    if (s1 === peg$FAILED) {
      s1 = peg$currPos;
      s2 = peg$parsedigit_sequence();

      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 46) {
          s3 = peg$c41;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c42);
          }
        }

        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    }

    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c40(s1);
    }

    s0 = s1;
    return s0;
  }

  function peg$parseexponent() {
    var s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$currPos;

    if (peg$c43.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c44);
      }
    }

    if (s2 !== peg$FAILED) {
      s3 = peg$parsesign();

      if (s3 === peg$FAILED) {
        s3 = null;
      }

      if (s3 !== peg$FAILED) {
        s4 = peg$parsedigit_sequence();

        if (s4 !== peg$FAILED) {
          s2 = [s2, s3, s4];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$FAILED;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }

    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c40(s1);
    }

    s0 = s1;
    return s0;
  }

  function peg$parsesign() {
    var s0;

    if (peg$c45.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c46);
      }
    }

    return s0;
  }

  function peg$parsedigit_sequence() {
    var s0, s1, s2;
    s0 = peg$currPos;
    s1 = [];

    if (peg$c47.test(input.charAt(peg$currPos))) {
      s2 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s2 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c48);
      }
    }

    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);

        if (peg$c47.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c48);
          }
        }
      }
    } else {
      s1 = peg$FAILED;
    }

    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c49(s1);
    }

    s0 = s1;
    return s0;
  }

  function peg$parsewsp() {
    var s0, s1;
    s0 = peg$currPos;

    if (peg$c50.test(input.charAt(peg$currPos))) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;

      if (peg$silentFails === 0) {
        peg$fail(peg$c51);
      }
    }

    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c37();
    }

    s0 = s1;
    return s0;
  }

  function merge(first, more) {
    if (!more) return [first];

    for (var a = [first], i = 0, l = more.length; i < l; i++) a[i + 1] = more[i][1];

    return a;
  }

  var cmds = {
    m: "moveto",
    l: "lineto",
    h: "horizontal lineto",
    v: "vertical lineto",
    c: "curveto",
    s: "smooth curveto",
    q: "quadratic curveto",
    t: "smooth quadratic curveto",
    a: "elliptical arc",
    z: "closepath"
  };

  for (var code in cmds) cmds[code.toUpperCase()] = cmds[code];

  function commands(code, args) {
    if (!args) args = [{}];

    for (var i = args.length; i--;) {
      var cmd = {
        code: code,
        command: cmds[code]
      };
      if (code == code.toLowerCase()) cmd.relative = true;

      for (var k in args[i]) cmd[k] = args[i][k];

      args[i] = cmd;
    }

    return args;
  }

  peg$result = peg$startRuleFunction();

  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
  }
}

export const SyntaxError = peg$SyntaxError;
export const parse = peg$parse;
export const parseSVG = peg$parse;
export const makeAbsolute = function makeSVGPathCommandsAbsolute(commands) {
  var subpathStart,
      prevCmd = {
    x: 0,
    y: 0
  };
  var attr = {
    x: "x0",
    y: "y0",
    x1: "x0",
    y1: "y0",
    x2: "x0",
    y2: "y0"
  };
  commands.forEach(function (cmd) {
    if (cmd.command === "moveto") subpathStart = cmd;
    cmd.x0 = prevCmd.x;
    cmd.y0 = prevCmd.y;

    for (var a in attr) if (a in cmd) cmd[a] += cmd.relative ? cmd[attr[a]] : 0;

    if (!("x" in cmd)) cmd.x = prevCmd.x;
    if (!("y" in cmd)) cmd.y = prevCmd.y;
    cmd.relative = false;
    cmd.code = cmd.code.toUpperCase();

    if (cmd.command == "closepath") {
      cmd.x = subpathStart.x;
      cmd.y = subpathStart.y;
    }

    prevCmd = cmd;
  });
  return commands;
};
