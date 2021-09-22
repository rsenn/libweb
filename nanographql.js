var getOpname = /(query|mutation)\s+([^\s{]*)\s*{/;

export function nanographql(str) {
  str = Array.isArray(str) ? str.join('') : str;
  var name = getOpname.exec(str);
  return function(variables) {
    var data = { query: str };
    data.variables = variables ? JSON.stringify(variables) : null;
    if(name && name.length) {
      var operationName = name[2];
      if(operationName) data.operationName = name[2];
    }
    return JSON.stringify(data);
  };
}

export default nanographql;
