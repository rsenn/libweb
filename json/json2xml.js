/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.10
	Author:  Stefan Goessner/2006, Henrik Ingo/2013
	Web:     https://github.com/henrikingo/xml2json
*/
function json2xml_translator() {
  var X = {
    toXml(v, name, ind, mySiblingAttrs) {
      if(typeof name == 'undefined') name = null;
      if(typeof ind == 'undefined') ind = '';
      if(typeof mySiblingAttrs == 'undefined') mySiblingAttrs = {};

      let xml = '';

      if(v instanceof Array) {
        xml += ind + '<' + name;
        //Since we are dealing with an Array, there cannot be child attributes,
        //but there can be sibling attributes passed by caller
        for(var m in mySiblingAttrs) {
          xml += ' ' + m + '="' + mySiblingAttrs[m].toString() + '"';
        }
        xml += '>\n';
        for(let i = 0, n = v.length; i < n; i++) {
          if(v[i] instanceof Array) {
            //TODO: Honestly, I have no idea what this does, nor what it should do... (nested lists, what does that even mean in xml?)
            xml += ind + X.toXml(v[i], name, ind + '\t') + '\n';
          } else if(typeof v[i] == 'object') {
            xml += X.toXml(v[i], null, ind);
          } else {
            xml += ind + '\t' + v[i].toString();
            xml += xml.charAt(xml.length - 1) == '\n' ? '' : '\n';
          }
        }
        if(name != null) {
          xml += (xml.charAt(xml.length - 1) == '\n' ? ind : '') + '</' + name + '>\n';
        }
      } else if(typeof v == 'object') {
        let hasChild = false;
        if(name === null) {
          //root element
          //note: for convenience, if the top level in json has multiple elements, we'll just output multiple xml documents after each other
          //... this space intentionally left blank ...
        } else {
          xml += ind + '<' + name;
        }
        //Before doing anything else, check for and separate those that
        //are attributes of the "sibling attribute" type (see below)
        let newSiblingAttrs = {};
        for(var m in v) {
          if(m.search('@') >= 1) {
            //@ exists, but is not the first character
            let parts = m.split('@');
            if(typeof newSiblingAttrs[parts[0]] == 'undefined') newSiblingAttrs[parts[0]] = {};
            newSiblingAttrs[parts[0]][parts[1]] = v[m];
            delete v[m];
          }
        }
        for(var m in v) {
          //For backward compatibility we allow both forms. An attribute can
          //either be a child, like so: {e : {@attribute : value}} or a
          //sibling, like so: {e : ..., e@attribute : value }
          //This test for the child (legacy)
          if(m.charAt(0) == '@') xml += ' ' + m.substr(1) + '="' + v[m].toString() + '"';
          else hasChild = true;
        }
        //Now add sibling attributes (passed by caller)
        for(var m in mySiblingAttrs) {
          xml += ' ' + m + '="' + mySiblingAttrs[m].toString() + '"';
        }
        if(name != null) {
          xml += hasChild ? '' : '/';
          xml += '>\n';
        }
        if(hasChild) {
          for(var m in v) {
            //legacy form
            if(m == '#text') xml += v[m];
            else if(m == '#cdata') xml += '<![CDATA[' + v[m] + ']]>';
            else if(m.charAt(0) != '@') xml += X.toXml(v[m], m, ind + '\t', newSiblingAttrs[m]) + '\n';
          }
          if(name != null) {
            xml += (xml.charAt(xml.length - 1) == '\n' ? ind : '') + '</' + name + '>\n';
          }
        }
      } else {
        //string or number value
        xml += ind + '<' + name;
        //Add sibling attributes (passed by caller)
        for(var m in mySiblingAttrs) {
          xml += ' ' + m + '="' + mySiblingAttrs[m].toString() + '"';
        }
        xml += '>';
        xml += v.toString() + '</' + name + '>\n';
      }
      return xml;
    },
    parseJson(jsonString) {
      //console.log('parseJSON:', jsonString);
      let obj = typeof jsonString == 'string' ? JSON.parse(jsonString) : jsonString;
      return obj;
    }
  };
  return X;
}

export function json2xml(json, tab) {
  let X = json2xml_translator();
  let xml = X.toXml(X.parseJson(json));
  //If tab given, do pretty print, otherwise remove white space
  return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t/g, '');
}

export const json2xmlTranslator = json2xml_translator();

export default json2xml;
