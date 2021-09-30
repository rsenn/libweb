// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function assertPath(p) {
  if(typeof p !== 'string') throw new TypeError('Path must be a string. Received ' + p);
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  let res = '';
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let code;
  for(let i = 0; i <= path.length; ++i) {
    if(i < path.length) code = path.charCodeAt(i);
    else if(code === 47 /*/*/) break;
    else code = 47 /*/*/;
    if(code === 47 /*/*/) {
      if(lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if(lastSlash !== i - 1 && dots === 2) {
        if(
          res.length < 2 ||
          lastSegmentLength !== 2 ||
          res.charCodeAt(res.length - 1) !== 46 /*.*/ ||
          res.charCodeAt(res.length - 2) !== 46 /*.*/
        ) {
          if(res.length > 2) {
            let lastSlashIndex = res.lastIndexOf('/');
            if(lastSlashIndex !== res.length - 1) {
              if(lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if(res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if(allowAboveRoot) {
          if(res.length > 0) res += '/..';
          else res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if(res.length > 0) res += '/' + path.slice(lastSlash + 1, i);
        else res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if(code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  let dir = pathObject.dir || pathObject.root;
  let base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if(!dir) {
    return base;
  }
  if(dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

export const posix = {
  // path.resolve([from ...], to)
  resolve(...args) {
    let resolvedPath = '';
    let resolvedAbsolute = false;
    let cwd = this.cwd;
    let ret;
    //console.log("resolve args:",`['${args.join("', '")}']`);

    for(let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var p;

      if(i >= 0) p = args[i];
      else {
        //   if(cwd === undefined) cwd = process.cwd();
        p = cwd;
      }
      //console.log(`resolve i=${i}, p='${p}'`);

      assertPath(p);

      // Skip empty entries
      if(p.length === 0) {
        continue;
      }

      resolvedPath = p + '/' + resolvedPath;
      resolvedAbsolute = p.charCodeAt(0) === 47 /*/*/;
    }
    //console.log("p:",p);

    // At this point the p should be resolved to a full absolute p, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the p
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
    //console.log("resolvedPath:",resolvedPath);

    if(resolvedAbsolute) {
      if(resolvedPath.length > 0) ret = '/' + resolvedPath;
      else ret = '/';
    } else if(resolvedPath.length > 0) {
      ret = resolvedPath;
    } else {
      ret = '.';
    }
    //console.log("ret:",ret);
    return ret;
  },

  normalize(path) {
    assertPath(path);

    if(path.length === 0) return '.';

    let isAbsolute = path.charCodeAt(0) === 47; /*/*/
    let trailingSeparator = path.charCodeAt(path.length - 1) === 47; /*/*/

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if(path.length === 0 && !isAbsolute) path = '.';
    if(path.length > 0 && trailingSeparator) path += '/';

    if(isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join(...args) {
    if(args.length === 0) return '.';
    let joined;
    for(let i = 0; i < args.length; ++i) {
      let arg = args[i];
      assertPath(arg);
      if(arg.length > 0) {
        if(joined === undefined) joined = arg;
        else joined += '/' + arg;
      }
    }
    if(joined === undefined) return '.';
    return posix.normalize(joined);
  },

  relative(from, to, cwd) {
    if(cwd !== undefined) this.cwd = cwd;

    assertPath(from);
    assertPath(to);
    //console.log("from:",from);
    //console.log("to:",to);

    if(from === to) return '';

    from = this.resolve(from);
    to = this.resolve(to);

    if(from === to) return '';

    // Trim any leading backslashes
    let fromStart = 1;
    for(; fromStart < from.length; ++fromStart) {
      if(from.charCodeAt(fromStart) !== 47 /*/*/) break;
    }

    let fromEnd = from.length;
    let fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    let toStart = 1;
    for(; toStart < to.length; ++toStart) {
      if(to.charCodeAt(toStart) !== 47 /*/*/) break;
    }
    let toEnd = to.length;
    let toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    let length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i) {
      if(i === length) {
        if(toLen > length) {
          if(to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if(i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if(fromLen > length) {
          if(from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if(i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      let fromCode = from.charCodeAt(fromStart + i);
      let toCode = to.charCodeAt(toStart + i);
      if(fromCode !== toCode) break;
      else if(fromCode === 47 /*/*/) lastCommonSep = i;
    }

    let out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if(i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if(out.length === 0) out += '..';
        else out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if(out.length > 0) return out + to.slice(toStart + lastCommonSep);

    toStart += lastCommonSep;
    if(to.charCodeAt(toStart) === 47 /*/*/) ++toStart;
    return to.slice(toStart);
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname(path) {
    assertPath(path);
    if(path.length === 0) return '.';
    let code = path.charCodeAt(0);
    let hasRoot = code === 47; /*/*/
    let end = -1;
    let matchedSlash = true;
    for(let i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if(code === 47 /*/*/) {
        if(!matchedSlash) {
          end = i;
          break;
        }
      } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if(end === -1) return hasRoot ? '/' : '.';
    if(hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename(path, ext) {
    if(ext !== undefined && !(typeof ext == 'string' || ext instanceof RegExp))
      throw new TypeError('"ext" argument must be a string or RegExp');
    assertPath(path);

    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;

    if(ext !== undefined /* && typeof ext == 'string' && ext.length > 0 && ext.length <= path.length*/) {
      if(typeof ext == 'string') if (ext.length === path.length && ext === path) return '';

      let extIdx = ext.length - 1;
      let firstNonSlashEnd = -1;
      for(i = path.length - 1; i >= 0; --i) {
        let code = path.charCodeAt(i);
        //console.log('basename', { code, i });
        if(code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if(!matchedSlash) {
            start = i + 1;
            break;
          }
        } else {
          if(firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }

          if(ext instanceof RegExp) {
            const tail = path.substring(i);
            const match = ext.exec(tail);
            if(match) {
              const mstart = i + match.index;
              const mend = mstart + match[0].length;

              if(mend == path.length) end = i + match.index;
            }
          } else if(extIdx >= 0) {
            // Try to match the explicit extension
            if(typeof ext == 'string' && code === ext.charCodeAt(extIdx)) {
              if(--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if(start === end) end = firstNonSlashEnd;
      else if(end === -1) end = path.length;
      return path.slice(start, end);
    }
    for(i = path.length - 1; i >= 0; --i) {
      if(path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if(!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if(end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // path component
        matchedSlash = false;
        end = i + 1;
      }
    }

    if(end === -1) return '';
    return path.slice(start, end);
  },

  extname(path) {
    assertPath(path);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    let preDotState = 0;
    for(let i = path.length - 1; i >= 0; --i) {
      let code = path.charCodeAt(i);
      if(code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if(!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if(end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if(code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if(startDot === -1) startDot = i;
        else if(preDotState !== 1) preDotState = 1;
      } else if(startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if(
      startDot === -1 ||
      end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
    ) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format(pathObject) {
    if(pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse(path) {
    assertPath(path);

    let ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if(path.length === 0) return ret;
    let code = path.charCodeAt(0);
    let isAbsolute = code === 47; /*/*/
    let start;
    if(isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    let preDotState = 0;

    // Get non-dir info
    for(; i >= start; --i) {
      code = path.charCodeAt(i);
      if(code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if(!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
      if(end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if(code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if(startDot === -1) startDot = i;
        else if(preDotState !== 1) preDotState = 1;
      } else if(startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if(
      startDot === -1 ||
      end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      (preDotState === 1 && startDot === end - 1 && startDot === startPart + 1)
    ) {
      if(end !== -1) {
        if(startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);
        else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if(startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if(startPart > 0) ret.dir = path.slice(0, startPart - 1);
    else if(isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

//posix.posix = posix;
export default posix;

export const path = (globalThis.path = posix); //{ path: posix };
