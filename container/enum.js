let exceptions = require('node-exceptions');
let InvalidArgumentException = exceptions.InvalidArgumentException;

/**
 * @param {string} name
 * @returns {string}
 * @see See {@link http://ecma-international.org/ecma-262/5.1/#sec-7.6} for more info.
 */
let getValidPropertyName = (name) => {
  name = name.replace(/^[^A-Za-z$_]+/, (match) => new Array(match.length + 1).join('_'));

  return name.replace(/[^a-z0-9$_]/gi, '_');
};

export class Enum {

  /**
   * @param {string} name
   * @param {string|int} value
   * @param {*} extra any extra parameter(s)
   */
  constructor(name, value, extra) {

    /**
     * @var {string}
     */
    this._name = name;

    /**
     * @var {string|int}
     */
    this._value = value;

    /**
     * @var {*}
     */
    this._extra = extra;
  }

  /**
   * @return {int}
   */
  get value() {
    return this._value;
  }

  /**
   * @return {string}
   */
  get name() {
    return this._name;
  }

  /**
   * @return {*}
   */
  get extra() {
    return this._extra;
  }

  /**
   * @param {string|int} property
   * @return {Enum}
   * @throws {InvalidArgumentException}
   */
  static valueOf(property) {
    let propertyType = typeof property;
    let propertyToEnumMap = null;

    switch (propertyType) {
    case 'string':
      let upperCasedProperty = property.toUpperCase();
      if (this.nameToEnumMap[upperCasedProperty]) {
        property = upperCasedProperty;
        propertyToEnumMap = this.nameToEnumMap;
      }
      else {
        propertyToEnumMap = this.valueToEnumMap;
      }
      break;

    case 'number':
      propertyToEnumMap = this.valueToEnumMap;
    }

    if (propertyToEnumMap && propertyToEnumMap[property]) {
      return propertyToEnumMap[property];
    }

    throw new InvalidArgumentException('No enum with specified name');
  }

  /**
   * @param {Object.<string, string|int>} items
   * @param {*[]|null} [extra] extra values stored in enums
   * @returns {{}}
   */
  static create(items, extra = null) {
    if (extra && !Array.isArray(extra)) {
      throw new InvalidArgumentException('Extra params should be an array or null');
    }

    if (Array.isArray(extra) && extra.length !== Object.keys(items).length) {
      throw new InvalidArgumentException('Extra params should be an array of the same length as enum has or null');
    }

    let newEnum = class extends this {};
    let valueToEnumMap = {};
    let nameToEnumMap = {};

    Object.keys(items).map((/** string */ name, index) => {
      let propertyName = getValidPropertyName(name.toUpperCase());
      if (newEnum.hasOwnProperty(propertyName)) {
        throw new InvalidArgumentException('Some names turn to be the same after making them valid JS IdentifierName');
      }

      let value = items[name];
      let enumInstance = new newEnum(name, value, Array.isArray(extra) ? extra[index] : null);
      newEnum[propertyName] = enumInstance;
      valueToEnumMap[value] = enumInstance;
      nameToEnumMap[name.toUpperCase()] = enumInstance;
    });

    //Define non-writable, non-enumerable properties
    Object.defineProperty(newEnum, 'valueToEnumMap', { value: valueToEnumMap });
    Object.defineProperty(newEnum, 'nameToEnumMap', { value: nameToEnumMap });

    return Object.freeze(newEnum);
  }
}

export default Enum;
