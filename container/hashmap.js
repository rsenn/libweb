/*
 * Copyright (c) 2011-2013 Lp digital system
 *
 * This file is part of BackBee.
 *
 * BackBee is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * BackBee is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with BackBee. If not, see <http://www.gnu.org/licenses/>.
 */
(function (window) {
    'use strict';

    var setValues = function hashMapSetValues(HashMap, values) {
            var value;

            for (value in values) {
                if (values.hasOwnProperty(value)) {
                    if (values[value] instanceof Array && 2 === values[value].length) {
                        HashMap.set(values[value][0], values[value][1]);
                    } else {
                        HashMap.set(value, values[value]);
                    }
                }
            }
        },

        defineArrayProperty = function hashMapDefineArrayProperty(obj, property_name) {
            Object.defineProperty(
                obj,
                property_name,
                {
                    value: [],
                    writable: false,
                    enumerable: false,
                    configurable: false
                }
            );
        },

        defineSizeProperty = function hashMapDefineSizeProperty(obj, property_name) {
            Object.defineProperty(
                obj,
                property_name,
                {
                    get: function hashMapDefineSizePropertyGet() {
                        return this.map_values.length;
                    },
                    set: function hashMapDefineSizePropertySet() {
                        return;
                    },
                    enumerable: false,
                    configurable: false
                }
            );
        },

        HashMap = function (values) {
            defineArrayProperty(this, 'map_keys');

            defineArrayProperty(this, 'map_values');

            defineSizeProperty(this, 'length');

            defineSizeProperty(this, 'size');

            setValues(this, values);
        };

    /**
     * HashMap accessor methods
     */
    /**
     * Sets the value for the key in the HashMap object. Returns the HashMap object.
     */
    HashMap.prototype.set = function hashMapSet(key, value) {
        this.map_keys.push(key);
        this.map_values.push(value);
        return this;
    };
    /**
     * Returns the value associated to the key, or undefined if there is none.
     */
    HashMap.prototype.get = function hashMapGet(key) {
        var value = this.map_keys.indexOf(key);

        if (value !== -1) {
            value = this.map_values[value];
        } else {
            value = undefined;
        }

        return value;
    };
    /**
     * Returns a boolean asserting whether a value has been associated to the key in the HashMap object or not.
     */
    HashMap.prototype.has = function hashMapHas(key) {
        return -1 === this.map_keys.indexOf(key);
    };

    /**
     * HashMap Mutator methods
     */
    /**
     * Removes any value associated to the key and returns the value that HashMap.prototype.has(value) would have previously returned. HashMap.prototype.has(key) will return false afterwards.
     */
    HashMap.prototype.delete = function hashMapDelete(key) {
        key = this.map_keys.indexOf(key);

        if (key !== -1) {
            delete this.map_keys[key];
            delete this.map_values[key];
            return true;
        }

        return false;
    };
    /**
     * Removes all key/value pairs from the HashMap object.
     */
    HashMap.prototype.clear = function hashMapClear() {
        while (this.map_values.length > 0) {
            this.map_values.pop();
            this.map_keys.pop();
        }
    };

    /**
     * Array Mutator methods
     */
    /**
     * Adds one element to the end of an array and returns the new length of the array.
     */
    HashMap.prototype.push = function hashMapPush(value) {
        this.map_values.push(value);
        this.map_keys.push(Array.lastIndexOf(this.map_values));
        return this.length;
    };
    /**
     * Removes the last element from an array and returns that element
     */
    HashMap.prototype.pop = function hashMapPop() {
        this.map_keys.pop();

        return this.map_values.pop();
    };
    /**
     * Removes the first element from an array and returns that element.
     */
    HashMap.prototype.shift = function hashMapShift() {
        this.map_keys.shift();

        return this.map_values.shift();
    };
    /**
     * Reverses the order of the elements of an array — the first becomes the last, and the last becomes the first.
     */
    HashMap.prototype.reverse = function hashMapReverse() {
        this.map_keys.reverse();
        this.map_values.reverse();

        return this;
    };

    /**
     * Accessor methods
     */
    /**
     * Returns the first (least) index of an element within the array equal to the specified value, or -1 if none is found.
     */
    HashMap.prototype.indexOf = function hashMapIndexOf(value) {
        var key = this.map_values.indexOf(value);

        if (key !== -1) {
            key = this.map_keys[key];
        }

        return key;
    };
    /**
     * Returns the last index of an element within the array equal to the specified value, or -1 if none is found.
     */
    HashMap.prototype.lastIndexOf = function hashMapLastIndexOf(value) {
        var key = this.map_values.lastIndexOf(value);

        if (key !== -1) {
            key = this.map_keys[key];
        }

        return key;
    };
    /**
     * Joins all elements of an array into a string.
     */
    HashMap.prototype.join = function hashMapJoin(separator) {
        return this.map_values.join(separator);
    };

    /**
     * Iteration methods
     */
    /**
     * Calls callbackFn once for each key-value pair present in the HashMap object, in insertion order. If a thisArg parameter is provided to forEach, it will be used as the this value for each callback.
     */
    HashMap.prototype.forEach = function hashMapForEach(callback, instance) {
        var key;
        if (!(instance instanceof {})) {
            instance = undefined;
        }

        for (key = 0; key < this.map_values.length; key = key + 1) {
            callback.call(instance, this.map_values[key], this.map_keys[key], this);
        }
    };
    /**
     * Returns a new Iterator object that contains the keys for each element in the HashMap object in insertion order.
     */
    HashMap.prototype.keys = function hashMapKeys() {
        return this.map_keys;
    };
    /**
     * Returns a new Iterator object that contains the values for each element in the HashMap object in insertion order.
     */
    HashMap.prototype.values = function hashMapValues() {
        return this.map_values;
    };
    /**
     * Returns returns a new Iterator object that contains an array of [key, value] for each element in the HashMap object in insertion order.
     */
    HashMap.prototype.entries = function hashMapEntries() {
        var key,
            values = [];

        for (key = 0; key < this.map_values.length; key = key + 1) {
            values.push([this.map_keys[key], this.map_values[key]]);
        }

        return values;
    };

    if (typeof define === 'function' && define.amd) {
        define('bbhashmap', [], function () {
            return HashMap;
        });
    } else {
        window.BBHashMap = HashMap;
    }
}(window));
