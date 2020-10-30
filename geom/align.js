export function Align(arg) {}

Align.CENTER = 0;
Align.LEFT = 1;
Align.RIGHT = 2;

Align.MIDDLE = 0;
Align.TOP = 4;
Align.BOTTOM = 8;

Align.horizontal = alignment => alignment & (Align.LEFT | Align.RIGHT);
Align.vertical = alignment => alignment & (Align.TOP | Align.BOTTOM);

export function AlignToString(value) {
  return [['CENTER', 'LEFT', 'RIGHT'][value & 0x3], ['MIDDLE', 'TOP', 'BOTTOM'][(value >> 2) & 0x03]];
}

export const Anchor = Align;
