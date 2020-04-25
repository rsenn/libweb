(function (factory, window) {
    "use strict";
    
    var hashmapUrl = {
        amd: "./hashmap",
        node: "hashmap",
        browser: "HashMap"
    }
    
    if(typeof define === "function" && define.amd) {
        define([hashmapUrl.amd], factory);
    }
    else if (typeof exports === "object") {
        exports.SpatialHashMap = factory( require(hashmapUrl.node).HashMap );
    }
    else {
        window.SpatialHashMap = factory( window[hashmapUrl.browser] );
    }
    
    
}(function(HashMap) {
    "use strict";
    
    
    
    /**
     * HashMap
     *
     * Changes to HashMap
     */
    
    // Same as Haskmap.get(), but stores an empty array (and returns that) when the value for the key is undefined
    HashMap.prototype.Get = function(key) {
        var data = this.get(key);
        if(!data) {
            var data = [];
            this.set(key, data);
        }
        return data;
    }
    
    
    
    
    /** 
     * UTILITIES
     *
     * Private API
     */
    
    var Key = function(cell) {
        return cell.x + ":" + cell.y;
    }
    
    var Keys = function(cells) {
        var result = [];
        for(var i = 0, len = cells.length; i < len; i++) {
            result.push(this.key(cells[i]));
        }
        
        return result;
    }
    
    var cellInArray = function(arr, item) {
        for(var i = 0, len = arr.length; i < len; i++) {
            if(arr[i].x === item.x && arr[i].y === item.y) {
                return true;
            }
        }
        
        return false;
    }
    
    var removeFromCell = function(grid, cell, obj) {
        var key = Key(cell);
        var objectsInCell = grid[key] || [];
        var index = objectsInCell.indexOf(obj);
        
        if(index > -1) {
            grid[key] = objectsInCell.splice(index, 1);
        }
    }
    
    var addToCell = function(grid, cell, obj) {
        var key = Key(cell);
        var objectsInCell = grid[key];
        if(!objectsInCell) {objectsInCell = grid[key] = [];}
        objectsInCell.push(obj);
    }
    
    var removeFromCells = function(grid, cells, obj) {
        for(var i = 0, len = cells.length; i < len; i++) {
            removeFromCell(grid, cells[i], obj);
        }
    }
    
    var addToCells = function(grid, cells, obj) {
        for(var i = 0, len = cells.length; i < len; i++) {
            addToCell(grid, cells[i], obj);
        }
    }
    
    var concat = function(orig, other) {
        Array.prototype.push.call(orig, other);
    }
    
    // Remove duplicates and specific items from an array
    var sanitize = function(arr, exclude) {
        if(!(exclude instanceof Array)) {exclude = [exclude];}
        var result = [];
        for(var i = 0, len = arr.length; i < len; i++) {
            var item = arr[i];
            if(result.indexOf(item) === -1 && exclude.indexOf(item) === -1) {
                result.push(item);
            }
        }
        
        return result;
    }
    
    // Same as sanitize, but without exclusions
    // This saves quite some (slow) indexOf() calls
    var removeDuplicates = function(arr) {
        var result = [];
        for(var i = 0, len = arr.length; i < len; i++) {
            var item = arr[i];
            if(result.indexOf(item) === -1) {
                result.push(item);
            }
        }
    }
    
    // Same as removeDuplicates, but for cells
    // Cell objects may be unequal (checked by ===),
    // But may refer to the same cell:
    // var c1 = {x:3, y:5}; var c2 = {x:3, y:5}; c1 === c2; // false, but refer to same cell
    var removeDuplicateCells = function(arr) {
        var result = [];
        for(var i = 0, len = arr.length; i < len; i++) {
            var item = arr[i];
            if(!cellInArray(result, arr[i])) {
                result.push(item);
            }
        }
    }
    
    
    
    
    
    
    /**
     * SpatialHashMap
     *
     * Public API
     */
    
    function SpatialHashMap(cellSize) {
        this.cellSize = cellSize;
        this.grid = {};
        this.objects = new HashMap();
        
        return this;
    }
    
    
    
    
    SpatialHashMap.prototype.add = function(aabb, obj) {
        var cells = this.cellsForAABB(aabb);
        
        addToCells(this.grid, cells, obj);
        this.objects.set(obj, {AABB: aabb, cells: cells});
        
        return this;
    }
    
    SpatialHashMap.prototype.remove = function(obj) {
        var cells = this.cellsForObject(obj);
        
        removeFromCells(this.grid, cells, obj);
        
        return this;
    }
    
    SpatialHashMap.prototype.moveAndResizeBy = SpatialHashMap.prototype.moveAndResize = function(diff, obj) {
        // Get the cells the object WAS in
        var object = this.objects.get(obj);
        var aabb = object.AABB;
        var oldCells = this.cellsForAABB(aabb);
        
        // Update the AABB
        aabb.x += diff.x;
        aabb.y += diff.y;
        aabb.w += diff.w;
        aabb.h += diff.w;
        
        // Get the cells the object IS in
        var newCells = this.cellsForAABB(aabb);
        
        // Make a diff: which cells should the object be removed from, and to which should it be added?
        var cellsToRemove = oldCells.map(function(cell) {
            return newCells.indexOf(cell) === -1;
        });
        var cellsToAdd = newCells.map(function(cell) {
            return oldCells.indexOf(cell) === -1;
        });
        
        // Do that
        removeFromCells(this.grid, cellsToRemove, obj);
        addToCells(this.grid, cellsToAdd, obj);
        
        // Update the object's cells attribute
        object.cells = newCells;
        
        return this;
    }
    
    SpatialHashMap.prototype.moveAndResizeTo = function(newAABB, obj) {
        var oldAABB = this.getAABB(obj);
        var diff = {x: newAABB.x - oldAABB.x,  y: newAABB.y - oldAABB.y,  w: newAABB.w - oldAABB.w,  h: newAABB.h - oldAABB.h};
        this.moveAndResizeBy(diff, obj);
        
        return this;
    }
    
    SpatialHashMap.prototype.resizeBy = function(diff, obj) {
        diff .x = 0;
        diff.y = 0;
        this.moveAndResizeBy(diff, obj);
        
        return this;
    }
    
    SpatialHashMap.prototype.resizeTo = function(newSize, obj) {
        var aabb = this.getAABB(obj);
        var diff = {x: 0, y: 0,  w: newSize.w - aabb.w,  h: newSize.h - aabb.h};
        this.moveAndResizeBy(diff, obj);
        
        return this;
    }
    
    SpatialHashMap.prototype.moveBy = SpatialHashMap.prototype.move = function(diff, obj) {
        diff.w = 0;
        diff.h = 0;
        this.moveAndResizeBy(diff, obj);
        
        return this;
    }
    
    SpatialHashMap.prototype.moveTo = function(newPos, obj) {
        var aabb = this.getAABB(obj);
        var diff = {x: newPos.x - aabb.x,   y: newPos.y - aabb.y,  w: 0,  h: 0};
        this.moveAndResizeBy(diff, obj);
        
        return this;
    }
    
    
    
    
    
    
    SpatialHashMap.prototype.getAABB = function(obj) {
        return this.objects.get(obj).AABB;
    }
    
    SpatialHashMap.prototype.getAABBs = function(objs) {
        var aabbs = [];
        for(var i = 0, len = objs.length; i < len; i++) {
            aabbs.push(this.getAABB(objs[i]));
        }
        
        return aabbs;
    }
    
    SpatialHashMap.prototype.cellForVector = function(vec) {
        var cellSize = this.cellSize;
        var x = Math.floor(vec.x / cellSize);
        var y = Math.floor(vec.y / cellSize);
        
        return {x:x, y:y};
    }
    
    SpatialHashMap.prototype.cellsForAABB = function(aabb) {
        var cellSize = this.cellSize;
        var Xmin = Math.floor(aabb.x / cellSize);
        var Xmax = Math.ceil((aabb.x + aabb.w) / cellSize);
        var Ymin = Math.floor(aabb.y / cellSize);
        var Ymax = Math.ceil((aabb.y + aabb.h) / cellSize);
        var cells = [];
        
        for(var x = Xmin; x < Xmax; x++) {
            for(var y = Ymin; y < Ymax; y++) {
                cells.push({x:x, y:y});
            }
        }
        
        return cells;
    }
    
    SpatialHashMap.prototype.cellsForAABBs = function(aabbs, raw) {
        var cells = [];
        for(var i = 0, len = aabbs.length; i < len; i++) {
            concat(cells, this.cellsForAABB(aabbs[i]));
        }
        return raw ? cells : removeDuplicateCells(cells);
    }
    
    SpatialHashMap.prototype.cellsForObject = function(obj) {
        return this.objects.get(obj).cells;
    }
    
    SpatialHashMap.prototype.cellsForObjects = function(objs, raw) {
        var cells = [];
        for(var i = 0, len = objs.length; i < len; i++) {
            concat(cells, this.cellsForObject(objs[i]));
        }
        return raw ? cells : removeDuplicateCells(cells);
    }
    
    SpatialHashMap.prototype.objectsForCell = function(cell) {
        return this.grid.Get(cell);
    }
    
    SpatialHashMap.prototype.objectsForCells = function(cells, raw) {
        var objects = [];
        for(var i = 0, len = cells.length; i < len; i++) {
            concat(objects, this.grid.Get(cells[i]));
        }
        return raw ? objects : removeDuplicates(objects);
    }
    
    SpatialHashMap.prototype.objectsForObject = function(obj, raw) {
        var cells = this.cellsForObject(obj);
        var objects = this.objectsForCells(cells, true);
        
        return raw ? objects : sanitize(objects, obj);
    }
    
    SpatialHashMap.prototype.objectsForObjects = function(objs, raw) {
        var cells = this.cellsForObjects(objs);
        var objects = this.objectsForCells(cells, true);
        
        return raw ? objects : sanitize(objects, objs);
    }
    
    SpatialHashMap.prototype.objectsForAABB = function(aabb, raw) {
        var cells = this.cellsForAABB(aabb);
        return this.objectsForCells(cells, raw);
    }
    
    SpatialHashMap.prototype.objectsForAABBs = function(aabbs, raw) {
        var cells = this.cellsForAABBs(aabbs, raw);
        return this.objectsForCells(cells, raw);
    }
    
    SpatialHashMap.prototype.AABBsForCell = function(cell) {
        var objects = this.objectsForCell(cell);
        return this.getAABBs(objects);
    }
    
    SpatialHashMap.prototype.AABBsForCells = function(cells, raw) {
        var objects = this.objectsForCells(cells, raw);
        return this.getAABBs(objects);
    }
    
    SpatialHashMap.prototype.AABBsForObject = function(obj, raw) {
        var cells = this.cellsForObject(obj, raw);
        return this.AABBsForCells(cells, raw);
    }
    
    SpatialHashMap.prototype.AABBsForObjects = function(objs, raw) {
        var cells = this.cellsForObjects(objs, raw);
        return this.AABBsForCells(cells, raw);
    }
    
    SpatialHashMap.prototype.AABBsForAABB = function(aabb, raw) {
        var cells = this.cellsForAABB(aabb, raw);
        return this.AABBsForCells(cells, raw);
    }
    
    SpatialHashMap.prototype.AABBsForAABBs = function(aabbs, raw) {
        var cells = this.cellsForAABBs(aabbs, raw);
        return this.AABBsForCells(cells, raw);
    }
    
    
    
    return SpatialHashMap;
    
    
}, window));
