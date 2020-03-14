"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadSVGs = loadSVGs;
exports.inlineSVG = inlineSVG;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _axios = _interopRequireDefault(require("./axios.es5.js"));

var _temp;

/**
 * Process SVGs onLoad
 *
 * @returns {void} Nothing.
 */
function loadSVGs() {
  // Find our SVGs.
  var svgs = document.querySelectorAll("svg[data-url]"); // Loop and process.

  for(var i = 0; i < svgs.length; ++i) {
    // Grab the URL and delete the attribute; we no longer need it.
    var url = svgs[i].getAttribute("data-url");
    svgs[i].removeAttribute("data-url");
    inlineSVG(url, svgs[i]);
  }
}

var CacheSVG = new ((_temp = /*#__PURE__*/ (function() {
  function CacheProxy() {
    (0, _classCallCheck2["default"])(this, CacheProxy);
    this.instance = "window" in global && "caches" in window ? caches.open("svg") : null;
  }

  (0, _createClass2["default"])(CacheProxy, [
    {
      key: "get",
      value: function get(url) {
        var match;
        return _regenerator["default"].async(
          function get$(_context) {
            while(1) {
              switch ((_context.prev = _context.next)) {
                case 0:
                  if(!(this.instace !== null)) {
                    _context.next = 11;
                    break;
                  }

                  _context.t0 = _regenerator["default"];
                  _context.next = 4;
                  return _regenerator["default"].awrap(this.instance);

                case 4:
                  _context.t1 = _context.sent.match(url);
                  _context.next = 7;
                  return _context.t0.awrap.call(_context.t0, _context.t1);

                case 7:
                  match = _context.sent;

                  if(!(match && match.ok)) {
                    _context.next = 11;
                    break;
                  }

                  console.log("CacheSVG hit ", {
                    url: url,
                    match: match
                  });
                  return _context.abrupt("return", match.text());

                case 11:
                  return _context.abrupt("return", null);

                case 12:
                case "end":
                  return _context.stop();
              }
            }
          },
          null,
          this,
          null,
          Promise
        );
      }
    },
    {
      key: "put",
      value: function put(url, data) {
        if(this.instace !== null) {
          this.instance.then(function(cache) {
            return cache.put(
              url,
              new Response(data, {
                headers: {
                  "Content-Type": "image/svg+xml"
                }
              })
            );
          });
        }
      }
    }
  ]);
  return CacheProxy;
})()),
_temp)();
/**
 * Fetch an SVG
 *
 * @param {string} url URL.
 * @param {DOMElement} el Element.
 * @returns {void} Nothing.
 */

function inlineSVG(url, el) {
  var data, parser, parsed, svg, attr, attrLen, i, classes, classesLen, j;
  return _regenerator["default"].async(
    function inlineSVG$(_context2) {
      while(1) {
        switch ((_context2.prev = _context2.next)) {
          case 0:
            _context2.next = 2;
            return _regenerator["default"].awrap(CacheSVG.get(url));

          case 2:
            data = _context2.sent;

            if(data) {
              _context2.next = 9;
              break;
            }

            console.log("fetchSVG(".concat(url, ")"));
            _context2.next = 7;
            return _regenerator["default"].awrap(
              _axios["default"].get(url).then(function(response) {
                return response.data;
              })
            );

          case 7:
            data = _context2.sent;
            CacheSVG.put(url, data);

          case 9:
            // This response should be an XML document we can parse.
            parser = new DOMParser();
            parsed = parser.parseFromString(data, "image/svg+xml"); // The file might not actually begin with "<svg>", and
            // for that matter there could be none, or many.

            svg = parsed.getElementsByTagName("svg");

            if(svg.length) {
              // But we only want the first.
              svg = svg[0]; // Copy over the attributes first.

              attr = svg.attributes;
              attrLen = attr.length;

              for(i = 0; i < attrLen; ++i) {
                if(attr[i].specified) {
                  // Merge classes.
                  if(attr[i].name === "class") {
                    classes = attr[i].value
                      .replace(/\s+/g, " ")
                      .trim()
                      .split(" ");
                    classesLen = classes.length;

                    for(j = 0; j < classesLen; ++j) {
                      el.classList.add(classes[j]);
                    }
                  } // Add/replace anything else.
                  else {
                    el.setAttribute(attr[i].name, attr[i].value);
                  }
                }
              } // Now transfer over the children. Note: IE does not
              // assign an innerHTML property to SVGs, so we need to
              // go node by node.

              while(svg.childNodes.length) {
                el.appendChild(svg.childNodes[0]);
              }
            }

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    },
    null,
    null,
    null,
    Promise
  );
}

inlineSVG.cache = CacheSVG;
