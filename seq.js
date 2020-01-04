const r = require;
const Sequelize = require('sequelize');
const Util = require('./util.es5.js');

const pad = (s, n, char = ' ') => (s.length < n ? char.repeat(n - s.length) : '');

function decamelize(str, separator) {
  separator = typeof separator === 'undefined' ? '_' : separator;

  return str
    .replace(/([a-z\d])([A-Z])/g, '$1' + separator + '$2')
    .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1' + separator + '$2')
    .toLowerCase();
}
function reduce(obj, fn, accu) {
  for(let key in obj) accu = fn(accu, obj[key], key, obj);
  return accu;
}

//const sequelize = new Sequelize('mysql://lotto:tD51o7xf@127.0.0.1:3306/lotto');

let tables = {};
tables.drawings = require('../models/drawings.js')(sequelize, Sequelize);
tables.games = require('../models/games.js')(sequelize, Sequelize);
tables.providers = require('../models/providers.js')(sequelize, Sequelize);
tables.tickets = require('../models/tickets.js')(sequelize, Sequelize);
tables.ticket_users = require('../models/ticket_users.js')(sequelize, Sequelize);
tables.user_balances = require('../models/user_balances.js')(sequelize, Sequelize);
tables.user_ip_addresses = require('../models/user_ip_addresses.js')(sequelize, Sequelize);
tables.user_profiles = require('../models/user_profiles.js')(sequelize, Sequelize);
tables.user_registration = require('../models/user_registration.js')(sequelize, Sequelize);
tables.users = require('../models/users.js')(sequelize, Sequelize);

function toString(type) {
  let ret;
  try {
    if(type.values !== undefined) {
      ret = 'ENUM(' + type.values.map(v => "'" + v + "'").join(',') + ')';
    } else ret = String(type);
  } catch(err) {
    //console.log("type: ", type);
    ret = 'err';
  }
  return ret;
}
function toObject(type) {
  let obj = {
    string: type.indexOf('CHAR') != -1 || type.indexOf('TEXT') != -1,
    float: type.startsWith('FLOAT') || type.startsWith('DOUBLE'),
    enum: type.startsWith('ENUM'),
    date: type.indexOf('DATE') != -1 || type.indexOf('TIME') != -1,
    integer: type.indexOf('INT') != -1
  };

  obj = filter(obj, (v, k, o) => v);

  let matches = /\(([0-9]*)\)/.exec(type);
  if(matches && matches[1]) obj.size = parseInt(matches[1]);
  matches = /DEFAULT '([^']*)'/.exec(type);
  if(matches && matches[1]) {
    obj.default = matches[1];
    if(obj.bool) obj.default = Boolean(obj.default);
    else if(obj.integer) obj.default = parseInt(obj.default);
    else if(obj.float) obj.default = parseFloat(obj.default);
  }

  if(/NOT.NULL/.test(type)) obj.null = false;

  if(obj.integer && obj.size == 1) {
    obj = { bool: true, default: Boolean(obj.default) };
  }

  return obj;
}
function toSource(obj) {
  let o = '';
  for(let k in obj) {
    let v = obj[k];
    if(typeof v === 'string') v = '"' + v + '"';
    if(o.length > 0) o += ', ';
    o += k + ': ' + v;
  }
  return '{' + o + '}';
}

let out = '';
for (let table in tables) {
  //console.log(table);
  let maxLen = 0;

  let fields = reduce(
    tables[table].tableAttributes,
    (acc, item, key, obj) => {
      let s = toString(item.type) + (item.allowNull ? '' : ' NOT NULL') + (typeof item.defaultValue === 'string' && item.defaultValue.length > 0 ? " DEFAULT '" + item.defaultValue + "'" : '');
      key = decamelize(key);
      if(key.length > maxLen) maxLen = key.length;
      acc[key] = s;
      return acc;
    },
    {}
  );

  //console.log(table +" ", fields);
  let model = reduce(
    fields,
    (acc, item, key) => {
      key = decamelize(key);
      //console.log(key +": "+item);
      item = toSource(toObject(item));
      acc.push(key + ':' + pad(key, maxLen + 1, ' ') + ' ' + item);
      return acc;
    },
    []
  );

  if(out.length) out += ',\n  ';
  out += table + ': {\n    ' + model.join(',\n    ') + '\n  }';
}

//console.log("{\n" + out + "}\n");

process.exit(0);
process.abort();
