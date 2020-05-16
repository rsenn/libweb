import parser, { xml2json } from '../json/xml2json.js';
import Util from '../util.js';

const pinThickness = 0.1524;

const schematicLayers = [
  { id: 91, name: 'Nets' },
  { id: 92, name: 'Busses' },
  { id: 94, name: 'Symbols' },
  { id: 95, name: 'Names' },
  { id: 96, name: 'Values' },
  { id: 97, name: 'Info' }
];

const pinSizes = [
  { size: 'long', length: 7.62 },
  { size: 'middle', length: 5.08 },
  { size: 'short', length: 2.54 },
  { size: 'point', length: 0.0 }
];

function degToRad(degrees) {
  return (Number(degrees) * Math.PI) / 180.0;
}

function schematicGetColor(id) {
  if(typeof id !== 'number') return null;

  switch (id) {
    case 0:
      return '#FFFFFF';
    case 1:
      return '#4B4BA5';
    case 2:
      return '#4BA54B';
    case 3:
      return '#4BA5A5';
    case 4:
      return '#A54B4B';
    case 5:
      return '#A54BA5';
    case 6:
      return '#A5A54B';
    case 8:
      return '#E6E6E6';
    case 9:
      return '#4B4BFF';
    case 10:
      return '#4BFF4B';
    case 11:
      return '#4BFFFF';
    case 12:
      return '#FF4B4B';
    case 13:
      return '#FF4BFF';
    case 14:
      return '#FFFF4B';
    case 15:
      return '#4B4B4B';
    default:
      return '#A5A5A5';
  }
}

function schematicGetLayer(id) {
  if(typeof id !== 'number') return null;

  for(var i = 0; i < schematicLayers.length; i++) {
    if(schematicLayers[i].id === id) return schematicLayers[i];
  }

  return null;
}

function schematicGetLayers(objects) {
  if(objects == null) return null;
  if(!Array.isArray(objects)) return null;

  var layers = [];

  for(var i = 0; i < objects.length; i++) {
    if(objects[i].visible !== 'yes') continue;

    var layer = schematicGetLayer(Number(objects[i].number));
    if(layer == null) continue;

    var color = schematicGetColor(Number(objects[i].color));
    if(color == null) continue;

    layers.push({ id: layer.id, name: layer.name, color: color });
  }

  return layers;
}

function getSymbolName(symbols, part, instance, devicesets) {
  if(symbols == null) return null;
  if(part == null) return null;
  if(instance == null) return null;
  if(devicesets == null) return null;

  var deviceset = null;
  var gate = null;
  var symbol = null;

  if(Array.isArray(devicesets)) {
    deviceset = devicesets.find(x => x.name === part.deviceset).deviceset;
  } else if(devicesets.name === part.deviceset) {
    deviceset = devicesets.deviceset;
  }

  //console.log("deviceset", deviceset);

  if(Array.isArray(deviceset.gates)) {
    gate = deviceset.gates.find(x => x.name === instance.gate);
  } else if(deviceset.gates && deviceset.gates.name === instance.gate) {
    gate = deviceset.gates;
  }

  if(deviceset == null) throw new Error('No deviceset ' + part.deviceset);
  if(gate == null) throw new Error('No gate ' + instance.gate);

  if(Array.isArray(symbols)) {
    symbol = symbols.find(x => x.name === gate.symbol);
    //console.log("SYMBOL:", symbol);
    if(symbol != null) return symbol.name;
  }

  if(symbols.name === gate.symbol) {
    return symbols.name;
  }

  return null;
}

function schematicGetParts(schematic, sheet) {
  if(schematic == null) return null;
  if(sheet == null) return null;

  var libraries = schematic.libraries;
  var parts = schematic.parts;
  var instances = sheet.instances;

  var schematicParts = [];

  instances.forEach(function(instance) {
    if(instance == null) return;

    //console.log("instance:", instance);

    var part = parts.find(x => x.name === instance.part);

    if(part == null) throw new Error('No part', instance.part);

    var library = libraries.find(x => x.name === part.library);

    if(library == null) throw new Error('No library', part.library);

    var devicesets = library.library.devicesets;

    if(devicesets == null) throw new Error('No devicesets', library.library.devicesets);

    var symbols = library.library.symbols;

    //console.log("symbols:", symbols);

    if(symbols == null) throw new Error('No symbols', library.library.symbols);

    var symbolName = getSymbolName(symbols, part, instance, devicesets);
    //console.log("symbolName:", symbolName);

    if(symbolName == null) throw new Error('No symbolName' + JSON.stringify({ devicesets }));

    var value = part.value != null ? part.value : part.deviceset + part.device;

    schematicParts.push({
      designator: part.name,
      name: part.deviceset + part.device,
      value: value,
      library: part.library,
      instance: instance,
      symbol: symbolName
    });
  });

  return schematicParts;
}

function schematicGetSymbols(parts, libraries) {
  if(parts == null) return null;
  if(libraries == null) return null;

  var symbols = [];

  parts.forEach(function(part) {
    var library = libraries.find(x => x.name === part.library).library;
    if(library == null) return;

    var symbol;

    if(Array.isArray(library.symbols)) {
      symbol = library.symbols.find(x => x.name === part.symbol);
      if(symbol == null) return;
    } else {
      symbol = library.symbols;
      if(symbol == null || symbol.name !== part.symbol) return;
    }

    //console.log("symbol:", symbol);

    if(symbols.indexOf(symbol) === -1) symbols.push(symbol);
  });

  return symbols;
}

export function parseSchematic(data, callback) {
  var raw = JSON.parse(xml2json(data));
  //console.log("raw:", raw);

  if(raw == null || raw.eagle === raw) {
    callback('Error: Failed to parse schematic');
    return;
  }

  var sheet;

  // TODO: Add multi-sheet support
  if(Array.isArray(raw.eagle.drawing.schematic.sheets)) {
    sheet = raw.eagle.drawing.schematic.sheets[0];
  } else {
    sheet = raw.eagle.drawing.schematic.sheets.sheet;
  }

  var layers = schematicGetLayers(raw.eagle.drawing.layers);

  if(layers == null || layers.length < 1) {
    callback('Error: Failed to parse schematic layers');
    return;
  }
  //console.log("sheet:", sheet);

  var parts = schematicGetParts(raw.eagle.drawing.schematic, sheet);
  //console.log("raw.eagle.drawing.schematic.sheets.sheet.nets:", raw.eagle.drawing.schematic.sheets.sheet.nets);

  if(parts == null || parts.length < 1) {
    callback('Error: Failed to parse schematic parts');
    return;
  }

  var symbols = schematicGetSymbols(parts, raw.eagle.drawing.schematic.libraries);

  if(symbols == null || symbols.length < 1) {
    callback('Error: Failed to parse schematic symbols');
    return;
  }

  let nets = raw.eagle.drawing.schematic.sheets.sheet.nets;
  let obj = { layers: layers, parts: parts, symbols: symbols, nets };

  for(let [v, k, o] of Util.traverse(obj)) {
    let num = parseFloat(v);
    if(!isNaN(num) && k != 'gate') o[k] = num;
    else if(typeof v == 'string') o[k] = Util.decodeHTMLEntities(v);

    if((v === null || k == 'text') && o.type === undefined) {
      o.type = k;
      if(v === null) delete o[k];
    }
  }

  //console.log("raw.eagle:", raw.eagle);

  setTimeout(callback(raw.eagle, obj), 50);
}
