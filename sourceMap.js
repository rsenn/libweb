import Util from './util.js';

//const { decode: decodeBase64, encode: encodeBase64 } = Util.base64;
const [encodeBase64, decodeBase64] = [
  (s) => {
    console.log(`encode('${s}')`);
    return Util.base64.encode(s);
  },
  (s) => {
    console.log(`decode('${s}')`);
    return Util.base64.decode(s);
  }
];

export class SourceMap {
  static get commentRegex() {
    return /^\s*\/(?:\/|\*)[@#]\s+sourceMappingURL=data:(?:application|text)\/json;(?:charset[:=]\S+?;)?base64,(?:.*)$/gm;
  }

  static get mapFileCommentRegex() {
    // Matches sourceMappingURL in either // or /* comment styles.
    return /(?:\/\/[@#][ \t]+sourceMappingURL=([^\s'"`]+?)[ \t]*$)|(?:\/\*[@#][ \t]+sourceMappingURL=([^\*]+?)[ \t]*(?:\*\/){1}[ \t]*$)/gm;
  }

  static Converter = class Converter {
    constructor(sm, opts, filesystem = {}) {
      opts = opts || {};

      if(opts.isFileComment) sm = readFromFileMap(sm, opts.commentFileDir, filesystem);
      if(opts.hasComment) sm = stripComment(sm);
      if(opts.isEncoded) sm = decodeBase64(sm);
      if(opts.isJSON || opts.isEncoded) sm = JSON.parse(sm);

      this.sourcemap = sm;
    }

    toJSON(space) {
      return JSON.stringify(this.sourcemap, null, space);
    }

    toBase64() {
      let json = this.toJSON();
      return encodeBase64(json);
    }

    toComment(options) {
      let base64 = this.toBase64();
      let data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;
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

  static fromObject = (obj) => new this.Converter(obj);

  static fromJSON = (json) => new this.Converter(json, { isJSON: true });

  static fromBase64 = (base64) => new this.Converter(base64, { isEncoded: true });

  static fromComment = (comment) => new this.Converter(comment.replace(/^\/\*/g, '//').replace(/\*\/$/g, ''), { isEncoded: true, hasComment: true });

  static fromMapFileComment = (comment, dir, filesystem) => new this.Converter(comment, { commentFileDir: dir, isFileComment: true, isJSON: true }, filesystem);

  // Finds last sourcemap comment in file or returns null if none was found
  static fromSource = (content) => {
    let m = content.match(this.commentRegex);
    return m ? this.fromComment(m.pop()) : null;
  };

  // Finds last sourcemap comment in file or returns null if none was found
  static fromMapFileSource = (content, dir) => {
    let m = content.match(this.mapFileCommentRegex);
    return m ? this.fromMapFileComment(m.pop(), dir) : null;
  };

  static removeComments = (src) => src.replace(this.commentRegex, '');

  static removeMapFileComments = (src) => src.replace(this.mapFileCommentRegex, '');

  static generateMapFileComment = (file, options) => {
    let data = 'sourceMappingURL=' + file;
    return options && options.multiline ? '/*# ' + data + ' */' : '//# ' + data;
  };
}

function stripComment(sm) {
  return sm.split(',').pop();
}

function readFromFileMap(sm, dir, filesystem) {
  // NOTE: this will only work on the server since it attempts to read the map file

  let r = SourceMap.mapFileCommentRegex.exec(sm);

  console.log('r:', r, { sm });

  // for some odd reason //# .. captures in 1 and /* .. */ in 2
  let filename = r[1] || r[2];
  let filepath = dir
    .split(/[\/\\]+/g)
    .concat([filename])
    .join('/');

  try {
    return filesystem.readFile(filepath, 'utf8');
  } catch(e) {
    throw new Error('An error occurred while trying to read the map file at ' + filepath + '\n' + e);
  }
}
