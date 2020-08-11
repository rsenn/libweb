//'use strict';
/*var fs = require('fs');
var path = require('path');
var SafeBuffer = require('safe-buffer');
*/

export class SourceMap {
  static get getCommentRegex() {
    return /^\s*\/(?:\/|\*)[@#]\s+sourceMappingURL=data:(?:application|text)\/json;(?:charset[:=]\S+?;)?base64,(?:.*)$/gm;
  }

  static get getMapFileCommentRegex() {
    // Matches sourceMappingURL in either // or /* comment styles.
    return /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"`]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^\*]+?)[ \t]*(?:\*\/){1}[ \t]*$)/gm;
  }
  static decodeBase64(base64) {
    return SafeBuffer.Buffer.from(base64, 'base64').toString();
  }
  static stripComment(sm) {
    return sm.split(',').pop();
  }
  static readFromFileMap(sm, dir) {
    // NOTE: this will only work on the server since it attempts to read the map file

    var r = exports.mapFileCommentRegex.exec(sm);

    // for some odd reason //# .. captures in 1 and /* .. */ in 2
    var filename = r[1] || r[2];
    var filepath = path.resolve(dir, filename);

    try {
      return fs.readFileSync(filepath, 'utf8');
    } catch(e) {
      throw new Error('An error occurred while trying to read the map file at ' + filepath + '\n' + e);
    }
  }
  static Converter = class Converter {
    constructor(sm, opts) {
      opts = opts || {};

      if(opts.isFileComment) sm = readFromFileMap(sm, opts.commentFileDir);
      if(opts.hasComment) sm = stripComment(sm);
      if(opts.isEncoded) sm = decodeBase64(sm);
      if(opts.isJSON || opts.isEncoded) sm = JSON.parse(sm);

      this.sourcemap = sm;
    }

    toJSON(space) {
      return JSON.stringify(this.sourcemap, null, space);
    }

    toBase64() {
      var json = this.toJSON();
      return SafeBuffer.Buffer.from(json, 'utf8').toString('base64');
    }

    toComment(options) {
      var base64 = this.toBase64();
      var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;
      return options && options.multiline ? '/*# ' + data + ' */' : '//# ' + data;
    }

    // returns copy instead of original
    toObject() {
      return JSON.parse(this.toJSON());
    }

    addProperty(key, value) {
      if(this.sourcemap.hasOwnProperty(key)) throw new Error('property "' + key + '" already exists on the sourcemap, use set property instead');
      return this.setProperty(key, value);
    }

    setProperty(key, value) {
      this.sourcemap[key] = value;
      return this;
    }

    getProperty(key) {
      return this.sourcemap[key];
    }
  };

  static fromObject(obj) {
    return new Converter(obj);
  }

  static fromJSON(json) {
    return new Converter(json, { isJSON: true });
  }

  static fromBase64(base64) {
    return new Converter(base64, { isEncoded: true });
  }

  static fromComment(comment) {
    comment = comment.replace(/^\/\*/g, '//').replace(/\*\/$/g, '');

    return new Converter(comment, { isEncoded: true, hasComment: true });
  }

  static fromMapFileComment(comment, dir) {
    return new Converter(comment, { commentFileDir: dir, isFileComment: true, isJSON: true });
  }

  // Finds last sourcemap comment in file or returns null if none was found
  static fromSource(content) {
    var m = content.match(exports.commentRegex);
    return m ? exports.fromComment(m.pop()) : null;
  }

  // Finds last sourcemap comment in file or returns null if none was found
  static fromMapFileSource(content, dir) {
    var m = content.match(exports.mapFileCommentRegex);
    return m ? exports.fromMapFileComment(m.pop(), dir) : null;
  }

  static removeComments(src) {
    return src.replace(exports.commentRegex, '');
  }

  static removeMapFileComments(src) {
    return src.replace(exports.mapFileCommentRegex, '');
  }

  static generateMapFileComment(file, options) {
    var data = 'sourceMappingURL=' + file;
    return options && options.multiline ? '/*# ' + data + ' */' : '//# ' + data;
  }
}
