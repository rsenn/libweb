var getOpname = /(query|mutation) ?([\w\d-_]+)? ?\(.*?\)? \{/;

export function nanographql(str) {
  str = Array.isArray(str) ? str.join('') : str;
  var name = getOpname.exec(str);
  return function(variables) {
    var data = { query: str };
    if(variables) data.variables = JSON.stringify(variables);
    if(name && name.length) {
      var operationName = name[2];
      if(operationName) data.operationName = name[2];
    }
    return JSON.stringify(data);
  };
}

export default nanographql;
