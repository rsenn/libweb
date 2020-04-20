"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Align = Align;
exports.Anchor = void 0;

function Align(arg) {}

Align.CENTER = 0;
Align.LEFT = 1;
Align.RIGHT = 2;
Align.MIDDLE = 0;
Align.TOP = 4;
Align.BOTTOM = 8;

Align.horizontal = alignment => alignment & (Align.LEFT | Align.RIGHT);

Align.vertical = alignment => alignment & (Align.TOP | Align.BOTTOM);

const Anchor = Align;
exports.Anchor = Anchor;
