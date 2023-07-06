import { h, Component, Fragment, useEffect } from '../preact.mjs';

export const MiscFixedSC613 = props =>
  h(
    'font',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      id: 'MiscFixedSC613',
      'horiz-adv-x': '500'
    },
    [
      h('font-face', {
        'font-family': 'MiscFixedSC613',
        'font-weight': '400',
        'font-stretch': 'normal',
        'units-per-em': '1000',
        'panose-1': '0 0 4 0 0 0 0 0 0 0',
        ascent: '800',
        descent: '-200',
        'x-height': '498',
        'cap-height': '747',
        bbox: '0 -166 498 913',
        'underline-thickness': '83',
        'underline-position': '-123',
        'unicode-range': 'U+0020-2592'
      }),
      h('missing-glyph', {
        d: 'M63 0v833h375v-833h-375zM125 63h250v708h-250v-708z'
      }),
      h('glyph', {
        'glyph-name': '.notdef',
        d: 'M63 0v833h375v-833h-375zM125 63h250v708h-250v-708z'
      }),
      h('glyph', {
        'glyph-name': '.null',
        'horiz-adv-x': '0'
      }),
      h('glyph', {
        'glyph-name': 'nonmarkingreturn'
      }),
      h('glyph', {
        'glyph-name': 'space',
        unicode: ' '
      }),
      h('glyph', {
        'glyph-name': 'exclam',
        unicode: '!',
        d: 'M166 747h83v-581h-83v581zM166 83h83v-83h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'quotedbl',
        unicode: '&quot;',
        d: 'M83 747h83v-249h-83v249zM249 747h83v-249h-83v249z'
      }),
      h('glyph', {
        'glyph-name': 'numbersign',
        unicode: '#',
        d: 'M83 664h83v-166h83v166h83v-166h83v-83h-83v-83h83v-83h-83v-166h-83v166h-83v-166h-83v166h-83v83h83v83h-83v83h83v166zM166 415v-83h83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'dollar',
        unicode: '$',
        d: 'M166 747h83v-83h166v-83h-166v-166h83v-83h83v-166h-83v-83h-83v-83h-83v83h-166v83h166v166h-83v83h-83v166h83v83h83v83zM83 581v-166h83v166h-83zM249 332v-166h83v166h-83z'
      }),
      h('glyph', {
        'glyph-name': 'percent',
        unicode: '%',
        d: 'M83 747h83v-83h83v-83h83v166h83v-166h-83v-166h-83v-83h-83v-166h83v83h83v-83h83v-83h-83v-83h-83v83h-83v83h-83v-166h-83v166h83v166h83v83h83v166h-83v-83h-83v83h-83v83h83v83zM83 664v-83h83v83h-83zM249 166v-83h83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'ampersand',
        unicode: '&amp;',
        d: 'M83 664h83v-83h83v-166h-83v-83h83v-83h166v-83h-83v-83h83v-83h-83v83h-83v-83h-166v83h-83v249h83v83h-83v166h83v83zM83 581v-166h83v166h-83zM83 332v-249h166v166h-83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'quotesingle',
        unicode: "'",
        d: 'M166 747h83v-249h-83v249z'
      }),
      h('glyph', {
        'glyph-name': 'parenleft',
        unicode: '(',
        d: 'M249 830h83v-83h-83v-166h-83v-415h83v-166h83v-83h-83v83h-83v166h-83v415h83v166h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'parenright',
        unicode: ')',
        d: 'M83 830h83v-83h83v-166h83v-415h-83v-166h-83v-83h-83v83h83v166h83v415h-83v166h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'asterisk',
        unicode: '*',
        d: 'M166 664h83v-166h83v83h83v-166h-83v-83h83v-166h-83v83h-83v-166h-83v166h-83v-83h-83v166h83v83h-83v166h83v-83h83v166z'
      }),
      h('glyph', {
        'glyph-name': 'plus',
        unicode: '+',
        d: 'M166 581h83v-166h166v-83h-166v-166h-83v166h-166v83h166v166z'
      }),
      h('glyph', {
        'glyph-name': 'comma',
        unicode: ',',
        d: 'M166 166h166v-83h-83v-83h-83v-83h-83v83h83v166z'
      }),
      h('glyph', {
        'glyph-name': 'hyphen',
        unicode: '-',
        d: 'M0 415h415v-83h-415v83z'
      }),
      h('glyph', {
        'glyph-name': 'hyphen',
        unicode: '‐',
        d: 'M0 415h415v-83h-415v83z'
      }),
      h('glyph', {
        'glyph-name': 'period',
        unicode: '.',
        d: 'M166 166h83v-83h83v-83h-83v-83h-83v83h-83v83h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'slash',
        unicode: '/',
        d: 'M332 747h83v-166h-83v-166h-83v-83h-83v-166h-83v-166h-83v166h83v166h83v83h83v166h83v166z'
      }),
      h('glyph', {
        'glyph-name': 'zero',
        unicode: '0',
        d: 'M166 747h83v-83h83v-83h83v-415h-83v-83h-83v-83h-83v83h-83v83h-83v415h83v83h83v83zM166 664v-83h-83v-415h83v-83h83v83h83v415h-83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'one',
        unicode: '1',
        d: 'M166 747h83v-664h166v-83h-415v83h166v498h-83v-83h-83v83h83v83h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'two',
        unicode: '2',
        d: 'M83 747h249v-83h83v-249h-83v-83h-83v-83h-83v-83h-83v-83h332v-83h-415v166h83v83h83v83h83v83h83v249h-249v-166h-83v166h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'three',
        unicode: '3',
        d: 'M0 747h415v-166h-83v-83h-83v-83h83v-83h83v-249h-83v-83h-249v83h-83v83h83v-83h249v249h-249v83h83v83h83v83h83v83h-332v83z'
      }),
      h('glyph', {
        'glyph-name': 'four',
        unicode: '4',
        d: 'M249 747h83v-498h83v-83h-83v-166h-83v166h-249v166h83v166h83v83h83v166zM166 498v-166h-83v-83h166v249h-83z'
      }),
      h('glyph', {
        'glyph-name': 'five',
        unicode: '5',
        d: 'M0 747h415v-83h-332v-249h83v83h166v-83h83v-332h-83v-83h-249v83h-83v83h83v-83h249v332h-166v-83h-166v415z'
      }),
      h('glyph', {
        'glyph-name': 'six',
        unicode: '6',
        d: 'M83 747h249v-83h83v-83h-83v83h-249v-249h249v-83h83v-249h-83v-83h-249v83h-83v581h83v83zM83 332v-249h249v249h-249z'
      }),
      h('glyph', {
        'glyph-name': 'seven',
        unicode: '7',
        d: 'M0 747h415v-166h-83v-166h-83v-166h-83v-249h-83v249h83v166h83v166h83v83h-332v83z'
      }),
      h('glyph', {
        'glyph-name': 'eight',
        unicode: '8',
        d: 'M83 747h249v-83h83v-249h-83v-83h83v-249h-83v-83h-249v83h-83v249h83v83h-83v249h83v83zM83 664v-249h249v249h-249zM83 332v-249h249v249h-249z'
      }),
      h('glyph', {
        'glyph-name': 'nine',
        unicode: '9',
        d: 'M83 747h249v-83h83v-581h-83v-83h-249v83h-83v83h83v-83h249v249h-249v83h-83v249h83v83zM83 664v-249h249v249h-249z'
      }),
      h('glyph', {
        'glyph-name': 'colon',
        unicode: ':',
        d: 'M166 581h83v-83h83v-83h-83v-83h-83v83h-83v83h83v83zM166 166h83v-83h83v-83h-83v-83h-83v83h-83v83h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'semicolon',
        unicode: ';',
        d: 'M166 581h83v-83h83v-83h-83v-83h-83v83h-83v83h83v83zM166 166h166v-83h-83v-83h-83v-83h-83v83h83v166z'
      }),
      h('glyph', {
        'glyph-name': 'less',
        unicode: '&lt;',
        d: 'M332 747h83v-83h-83v-83h-83v-83h-83v-83h-83v-83h83v-83h83v-83h83v-83h83v-83h-83v83h-83v83h-83v83h-83v83h-83v83h83v83h83v83h83v83h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'equal',
        unicode: '=',
        d: 'M0 498h415v-83h-415v83zM0 249h415v-83h-415v83z'
      }),
      h('glyph', {
        'glyph-name': 'greater',
        unicode: '&gt;',
        d: 'M0 747h83v-83h83v-83h83v-83h83v-83h83v-83h-83v-83h-83v-83h-83v-83h-83v-83h-83v83h83v83h83v83h83v83h83v83h-83v83h-83v83h-83v83h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'question',
        unicode: '?',
        d: 'M83 747h249v-83h83v-249h-83v-83h-83v-166h-83v166h83v83h83v249h-249v-166h-83v166h83v83zM166 83h83v-83h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'at',
        unicode: '@',
        d: 'M83 747h249v-83h83v-415h-83v-83h-166v249h83v83h83v166h-249v-581h332v-83h-332v83h-83v581h83v83zM249 415v-166h83v166h-83z'
      }),
      h('glyph', {
        'glyph-name': 'A',
        unicode: 'A',
        d: 'M166 747h83v-83h83v-83h83v-581h-83v249h-249v-249h-83v581h83v83h83v83zM166 664v-83h-83v-249h249v249h-83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'B',
        unicode: 'B',
        d: 'M0 747h332v-83h83v-249h-83v-83h83v-249h-83v-83h-332v83h83v581h-83v83zM166 664v-249h166v249h-166zM166 332v-249h166v249h-166z'
      }),
      h('glyph', {
        'glyph-name': 'C',
        unicode: 'C',
        d: 'M83 747h249v-83h83v-83h-83v83h-249v-581h249v83h83v-83h-83v-83h-249v83h-83v581h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'D',
        unicode: 'D',
        d: 'M0 747h332v-83h83v-581h-83v-83h-332v83h83v581h-83v83zM166 664v-581h166v581h-166z'
      }),
      h('glyph', {
        'glyph-name': 'E',
        unicode: 'E',
        d: 'M0 747h415v-83h-332v-249h249v-83h-249v-249h332v-83h-415v747z'
      }),
      h('glyph', {
        'glyph-name': 'F',
        unicode: 'F',
        d: 'M0 747h415v-83h-332v-249h249v-83h-249v-332h-83v747z'
      }),
      h('glyph', {
        'glyph-name': 'G',
        unicode: 'G',
        d: 'M83 747h249v-83h83v-83h-83v83h-249v-581h249v166h-83v83h166v-249h-83v-83h-249v83h-83v581h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'H',
        unicode: 'H',
        d: 'M0 747h83v-332h249v332h83v-747h-83v332h-249v-332h-83v747z'
      }),
      h('glyph', {
        'glyph-name': 'I',
        unicode: 'I',
        d: 'M83 747h249v-83h-83v-581h83v-83h-249v83h83v581h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'J',
        unicode: 'J',
        d: 'M166 747h249v-83h-83v-581h-83v-83h-166v83h-83v83h83v-83h166v581h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'K',
        unicode: 'K',
        d: 'M0 747h83v-332h83v83h83v83h83v166h83v-166h-83v-83h-83v-83h-83v-83h83v-83h83v-83h83v-166h-83v166h-83v83h-83v83h-83v-332h-83v747z'
      }),
      h('glyph', {
        'glyph-name': 'L',
        unicode: 'L',
        d: 'M0 747h83v-664h332v-83h-415v747z'
      }),
      h('glyph', {
        'glyph-name': 'M',
        unicode: 'M',
        d: 'M0 747h83v-166h83v-83h83v83h83v166h83v-747h-83v498h-83v-166h-83v166h-83v-498h-83v747z'
      }),
      h('glyph', {
        'glyph-name': 'N',
        unicode: 'N',
        d: 'M0 747h83v-83h83v-166h83v-166h83v415h83v-747h-83v166h-83v166h-83v166h-83v-498h-83v747z'
      }),
      h('glyph', {
        'glyph-name': 'O',
        unicode: 'O',
        d: 'M83 747h249v-83h83v-581h-83v-83h-249v83h-83v581h83v83zM83 664v-581h249v581h-249z'
      }),
      h('glyph', {
        'glyph-name': 'P',
        unicode: 'P',
        d: 'M0 747h332v-83h83v-249h-83v-83h-249v-332h-83v747zM83 664v-249h249v249h-249z'
      }),
      h('glyph', {
        'glyph-name': 'Q',
        unicode: 'Q',
        d: 'M83 747h249v-83h83v-581h-83v-83h83v-83h-83v83h-249v83h-83v581h83v83zM83 664v-581h83v83h83v-83h83v581h-249z'
      }),
      h('glyph', {
        'glyph-name': 'R',
        unicode: 'R',
        d: 'M0 747h332v-83h83v-249h-83v-83h-83v-83h83v-83h83v-166h-83v166h-83v83h-83v83h-83v-332h-83v747zM83 664v-249h249v249h-249z'
      }),
      h('glyph', {
        'glyph-name': 'S',
        unicode: 'S',
        d: 'M83 747h249v-83h83v-83h-83v83h-249v-249h249v-83h83v-249h-83v-83h-249v83h-83v83h83v-83h249v249h-249v83h-83v249h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'T',
        unicode: 'T',
        d: 'M0 747h415v-83h-166v-664h-83v664h-166v83z'
      }),
      h('glyph', {
        'glyph-name': 'U',
        unicode: 'U',
        d: 'M0 747h83v-664h249v664h83v-664h-83v-83h-249v83h-83v664z'
      }),
      h('glyph', {
        'glyph-name': 'V',
        unicode: 'V',
        d: 'M0 747h83v-332h83v-249h83v249h83v332h83v-332h-83v-249h-83v-166h-83v166h-83v249h-83v332z'
      }),
      h('glyph', {
        'glyph-name': 'W',
        unicode: 'W',
        d: 'M0 747h83v-664h83v332h83v-332h83v664h83v-664h-83v-83h-83v83h-83v-83h-83v83h-83v664z'
      }),
      h('glyph', {
        'glyph-name': 'X',
        unicode: 'X',
        d: 'M0 747h83v-166h83v-166h83v166h83v166h83v-166h-83v-166h-83v-83h83v-166h83v-166h-83v166h-83v166h-83v-166h-83v-166h-83v166h83v166h83v83h-83v166h-83v166z'
      }),
      h('glyph', {
        'glyph-name': 'Y',
        unicode: 'Y',
        d: 'M0 747h83v-166h83v-166h83v166h83v166h83v-166h-83v-166h-83v-415h-83v415h-83v166h-83v166z'
      }),
      h('glyph', {
        'glyph-name': 'Z',
        unicode: 'Z',
        d: 'M0 747h415v-166h-83v-166h-83v-83h-83v-166h-83v-83h332v-83h-415v166h83v166h83v83h83v166h83v83h-332v83z'
      }),
      h('glyph', {
        'glyph-name': 'bracketleft',
        unicode: '[',
        d: 'M83 830h249v-83h-166v-747h166v-83h-249v913z'
      }),
      h('glyph', {
        'glyph-name': 'backslash',
        unicode: '\\',
        d: 'M0 747h83v-166h83v-166h83v-83h83v-166h83v-166h-83v166h-83v166h-83v83h-83v166h-83v166z'
      }),
      h('glyph', {
        'glyph-name': 'bracketright',
        unicode: ']',
        d: 'M83 830h249v-913h-249v83h166v747h-166v83z'
      }),
      h('glyph', {
        'glyph-name': 'asciicircum',
        unicode: '^',
        d: 'M166 747h83v-83h83v-83h83v-83h-83v83h-83v83h-83v-83h-83v-83h-83v83h83v83h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'underscore',
        unicode: '_',
        d: 'M0 0h415v-83h-415v83z'
      }),
      h('glyph', {
        'glyph-name': 'grave',
        unicode: '`',
        d: 'M166 830h83v-83h83v-83h-83v83h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'a',
        unicode: 'a',
        d: 'M83 498h249v-83h83v-415h-83v83h-83v-83h-166v83h-83v166h83v83h249v83h-249v83zM83 249v-166h166v83h83v83h-249z'
      }),
      h('glyph', {
        'glyph-name': 'b',
        unicode: 'b',
        d: 'M0 747h83v-249h249v-83h83v-332h-83v-83h-332v747zM83 415v-332h249v332h-249z'
      }),
      h('glyph', {
        'glyph-name': 'c',
        unicode: 'c',
        d: 'M83 498h249v-83h83v-83h-83v83h-249v-332h249v83h83v-83h-83v-83h-249v83h-83v332h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'd',
        unicode: 'd',
        d: 'M332 747h83v-747h-332v83h-83v332h83v83h249v249zM83 415v-332h249v332h-249z'
      }),
      h('glyph', {
        'glyph-name': 'e',
        unicode: 'e',
        d: 'M83 498h249v-83h83v-166h-332v-166h249v83h83v-83h-83v-83h-249v83h-83v332h83v83zM83 415v-83h249v83h-249z'
      }),
      h('glyph', {
        'glyph-name': 'f',
        unicode: 'f',
        d: 'M166 747h166v-83h83v-83h-83v83h-166v-249h166v-83h-166v-332h-83v332h-83v83h83v249h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'g',
        unicode: 'g',
        d: 'M83 498h249v-83h83v-498h-83v-83h-249v83h-83v83h83v-83h249v166h-249v83h-83v249h83v83zM83 415v-249h249v249h-249z'
      }),
      h('glyph', {
        'glyph-name': 'h',
        unicode: 'h',
        d: 'M0 747h83v-332h83v83h166v-83h83v-415h-83v415h-166v-83h-83v-332h-83v747z'
      }),
      h('glyph', {
        'glyph-name': 'i',
        unicode: 'i',
        d: 'M166 664h83v-83h-83v83zM83 498h166v-415h83v-83h-249v83h83v332h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'j',
        unicode: 'j',
        d: 'M249 664h83v-83h-83v83zM166 498h166v-581h-83v-83h-166v83h-83v166h83v-166h166v498h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'k',
        unicode: 'k',
        d: 'M0 747h83v-415h83v83h83v83h83v-83h-83v-83h-83v-83h83v-83h83v-83h83v-83h-83v83h-83v83h-83v83h-83v-249h-83v747z'
      }),
      h('glyph', {
        'glyph-name': 'l',
        unicode: 'l',
        d: 'M83 747h166v-664h83v-83h-249v83h83v581h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'm',
        unicode: 'm',
        d: 'M0 498h166v-83h83v83h83v-83h83v-415h-83v415h-83v-332h-83v332h-83v-415h-83v498z'
      }),
      h('glyph', {
        'glyph-name': 'n',
        unicode: 'n',
        d: 'M0 498h83v-83h83v83h166v-83h83v-415h-83v415h-166v-83h-83v-332h-83v498z'
      }),
      h('glyph', {
        'glyph-name': 'o',
        unicode: 'o',
        d: 'M83 498h249v-83h83v-332h-83v-83h-249v83h-83v332h83v83zM83 415v-332h249v332h-249z'
      }),
      h('glyph', {
        'glyph-name': 'p',
        unicode: 'p',
        d: 'M0 498h332v-83h83v-249h-83v-83h-249v-249h-83v664zM83 415v-249h249v249h-249z'
      }),
      h('glyph', {
        'glyph-name': 'q',
        unicode: 'q',
        d: 'M83 498h332v-664h-83v249h-249v83h-83v249h83v83zM83 415v-249h249v249h-249z'
      }),
      h('glyph', {
        'glyph-name': 'r',
        unicode: 'r',
        d: 'M0 498h83v-83h83v83h166v-83h83v-83h-83v83h-166v-83h-83v-332h-83v498z'
      }),
      h('glyph', {
        'glyph-name': 's',
        unicode: 's',
        d: 'M83 498h249v-83h83v-83h-83v83h-249v-83h166v-83h83v-83h83v-83h-83v-83h-249v83h-83v83h83v-83h249v83h-83v83h-166v83h-83v83h83v83z'
      }),
      h('glyph', {
        'glyph-name': 't',
        unicode: 't',
        d: 'M83 664h83v-166h166v-83h-166v-332h166v83h83v-83h-83v-83h-166v83h-83v332h-83v83h83v166z'
      }),
      h('glyph', {
        'glyph-name': 'u',
        unicode: 'u',
        d: 'M0 498h83v-415h166v83h83v332h83v-498h-83v83h-83v-83h-166v83h-83v415z'
      }),
      h('glyph', {
        'glyph-name': 'v',
        unicode: 'v',
        d: 'M0 498h83v-249h83v-166h83v166h83v249h83v-249h-83v-166h-83v-83h-83v83h-83v166h-83v249z'
      }),
      h('glyph', {
        'glyph-name': 'w',
        unicode: 'w',
        d: 'M0 498h83v-415h83v249h83v-249h83v415h83v-415h-83v-83h-83v83h-83v-83h-83v83h-83v415z'
      }),
      h('glyph', {
        'glyph-name': 'x',
        unicode: 'x',
        d: 'M0 498h83v-83h83v-83h83v83h83v83h83v-83h-83v-83h-83v-166h83v-83h83v-83h-83v83h-83v83h-83v-83h-83v-83h-83v83h83v83h83v166h-83v83h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'y',
        unicode: 'y',
        d: 'M0 498h83v-332h166v83h83v249h83v-581h-83v-83h-249v83h-83v83h83v-83h249v249h-83v-83h-166v83h-83v332z'
      }),
      h('glyph', {
        'glyph-name': 'z',
        unicode: 'z',
        d: 'M0 498h415v-83h-83v-83h-83v-83h-83v-83h-83v-83h332v-83h-415v166h83v83h83v83h83v83h-249v83z'
      }),
      h('glyph', {
        'glyph-name': 'braceleft',
        unicode: '{',
        d: 'M249 830h166v-83h-166v-332h-83v-83h83v-332h166v-83h-166v83h-83v332h-166v83h166v332h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'bar',
        unicode: '|',
        d: 'M166 747h83v-747h-83v747z'
      }),
      h('glyph', {
        'glyph-name': 'braceright',
        unicode: '}',
        d: 'M0 830h166v-83h83v-332h166v-83h-166v-332h-83v-83h-166v83h166v332h83v83h-83v332h-166v83z'
      }),
      h('glyph', {
        'glyph-name': 'asciitilde',
        unicode: '~',
        d: 'M83 747h83v-83h83v-83h83v166h83v-166h-83v-83h-83v83h-83v83h-83v-166h-83v166h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'exclamdown',
        unicode: '¡',
        d: 'M166 747h83v-83h-83v83zM166 581h83v-581h-83v581z'
      }),
      h('glyph', {
        'glyph-name': 'cent',
        unicode: '¢',
        d: 'M166 747h83v-83h83v-83h83v-83h-83v83h-83v-332h83v83h83v-83h-83v-83h-83v-83h-83v83h-83v83h-83v332h83v83h83v83zM83 581v-332h83v332h-83z'
      }),
      h('glyph', {
        'glyph-name': 'sterling',
        unicode: '£',
        d: 'M166 747h166v-83h83v-83h-83v83h-166v-249h83v-83h-83v-249h166v83h83v-83h-83v-83h-166v83h-83v-83h-83v83h83v249h-83v83h83v249h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'currency',
        unicode: '¤',
        d: 'M0 581h83v-83h249v83h83v-83h-83v-332h83v-83h-83v83h-249v-83h-83v83h83v332h-83v83zM166 415v-166h83v166h-83z'
      }),
      h('glyph', {
        'glyph-name': 'yen',
        unicode: '¥',
        d: 'M0 747h83v-166h83v-166h83v166h83v166h83v-166h-83v-166h83v-83h-166v-83h166v-83h-166v-166h-83v166h-166v83h166v83h-166v83h83v166h-83v166z'
      }),
      h('glyph', {
        'glyph-name': 'brokenbar',
        unicode: '¦',
        d: 'M166 747h83v-332h-83v332zM166 332h83v-332h-83v332z'
      }),
      h('glyph', {
        'glyph-name': 'section',
        unicode: '§',
        d: 'M166 830h166v-83h83v-83h-83v83h-166v-166h166v-83h83v-166h-83v-83h83v-166h-83v-83h-166v83h-83v83h83v-83h166v166h-166v83h-83v166h83v83h-83v166h83v83zM166 498v-166h166v166h-166z'
      }),
      h('glyph', {
        'glyph-name': 'dieresis',
        unicode: '¨',
        d: 'M83 830h83v-166h-83v166zM249 830h83v-166h-83v166z'
      }),
      h('glyph', {
        'glyph-name': 'copyright',
        unicode: '©',
        d: 'M83 830h249v-83h83v-581h-83v-83h-249v83h-83v581h83v83zM83 747v-166h83v-249h-83v-166h249v166h-83v83h83v83h-83v83h83v166h-249zM166 664h83v-83h-83v83zM166 332h83v-83h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'ordfeminine',
        unicode: 'ª',
        d: 'M83 747h249v-83h83v-332h-332v83h-83v83h83v83h249v83h-249v83zM83 498v-83h249v83h-249zM0 249h415v-83h-415v83z'
      }),
      h('glyph', {
        'glyph-name': 'guillemotleft',
        unicode: '«',
        d: 'M166 581h83v-83h83v83h83v-83h-83v-83h-83v-166h83v-83h83v-83h-83v83h-83v-83h-83v83h-83v83h-83v166h83v83h83v83zM166 498v-83h-83v-166h83v-83h83v83h-83v166h83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'logicalnot',
        unicode: '¬',
        d: 'M0 415h415v-249h-83v166h-332v83z'
      }),
      h('glyph', {
        'glyph-name': 'registered',
        unicode: '®',
        d: 'M83 830h249v-83h83v-581h-83v-83h-249v83h-83v581h83v83zM83 747v-83h166v-83h-83v-166h83v-83h-83v-83h-83v-83h249v83h-83v83h83v83h-83v166h83v166h-249z'
      }),
      h('glyph', {
        'glyph-name': 'macron',
        unicode: '¯',
        d: 'M0 747h415v-83h-415v83z'
      }),
      h('glyph', {
        'glyph-name': 'macron',
        unicode: 'ˉ',
        d: 'M0 747h415v-83h-415v83z'
      }),
      h('glyph', {
        'glyph-name': 'degree',
        unicode: '°',
        d: 'M166 747h166v-83h83v-166h-83v-83h-166v83h-83v166h83v83zM166 664v-166h166v166h-166z'
      }),
      h('glyph', {
        'glyph-name': 'plusminus',
        unicode: '±',
        d: 'M166 664h83v-166h166v-83h-166v-166h-83v166h-166v83h166v166zM0 166h415v-83h-415v83z'
      }),
      h('glyph', {
        'glyph-name': 'twosuperior',
        unicode: '²',
        d: 'M83 830h83v-83h83v-166h-83v-83h83v-83h-249v83h83v83h83v166h-83v-83h-83v83h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'threesuperior',
        unicode: '³',
        d: 'M83 830h83v-83h83v-83h-83v-83h83v-83h-83v-83h-166v83h166v83h-83v83h-83v83h83v83zM83 747v-83h83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'acute',
        unicode: '´',
        d: 'M249 830h83v-83h-83v-83h-83v83h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'mu',
        unicode: 'µ',
        d: 'M0 498h83v-415h166v83h83v332h83v-498h-83v83h-83v-83h-166v-166h-83v664z'
      }),
      h('glyph', {
        'glyph-name': 'mu',
        unicode: 'μ',
        d: 'M0 498h83v-415h166v83h83v332h83v-498h-83v83h-83v-83h-166v-166h-83v664z'
      }),
      h('glyph', {
        'glyph-name': 'paragraph',
        unicode: '¶',
        d: 'M83 747h332v-747h-83v664h-83v-664h-83v249h-83v83h-83v332h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'periodcentered',
        unicode: '·',
        d: 'M166 415h166v-83h-166v83z'
      }),
      h('glyph', {
        'glyph-name': 'periodcentered',
        unicode: '∙',
        d: 'M166 415h166v-83h-166v83z'
      }),
      h('glyph', {
        'glyph-name': 'cedilla',
        unicode: '¸',
        d: 'M249 0h83v-83h-83v-83h-83v83h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'onesuperior',
        unicode: '¹',
        d: 'M83 830h83v-332h83v-83h-249v83h83v166h-83v83h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'ordmasculine',
        unicode: 'º',
        d: 'M83 747h249v-83h83v-249h-83v-83h-249v83h-83v249h83v83zM83 664v-249h249v249h-249zM0 249h415v-83h-415v83z'
      }),
      h('glyph', {
        'glyph-name': 'guillemotright',
        unicode: '»',
        d: 'M0 581h83v-83h83v83h83v-83h83v-83h83v-166h-83v-83h-83v-83h-83v83h-83v-83h-83v83h83v83h83v166h-83v83h-83v83zM166 498v-83h83v-166h-83v-83h83v83h83v166h-83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'onequarter',
        unicode: '¼',
        d: 'M83 830h83v-332h83v-83h-249v83h83v166h-83v83h83v83zM332 415h83v-415h-83v83h-166v166h83v83h83v83zM249 249v-83h83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'onehalf',
        unicode: '½',
        d: 'M83 830h83v-332h83v-83h83v-83h83v-166h-83v-83h83v-83h-249v83h83v83h83v166h-83v-83h-83v83h83v83h-249v83h83v166h-83v83h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'threequarters',
        unicode: '¾',
        d: 'M83 830h83v-83h83v-83h-83v-83h83v-166h-83v-83h-83v83h-83v83h83v-83h83v166h-83v83h-83v83h83v83zM83 747v-83h83v83h-83zM332 415h83v-415h-83v83h-166v166h83v83h83v83zM249 249v-83h83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'questiondown',
        unicode: '¿',
        d: 'M166 747h83v-83h-83v83zM166 581h83v-166h-83v-83h-83v-249h249v166h83v-166h-83v-83h-249v83h-83v249h83v83h83v166z'
      }),
      h('glyph', {
        'glyph-name': 'Agrave',
        unicode: 'À',
        d: 'M83 830h83v-83h83v-83h-83v83h-83v83zM166 581h83v-83h83v-83h83v-415h-83v166h-249v-166h-83v415h83v83h83v83zM166 498v-83h-83v-166h249v166h-83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'Aacute',
        unicode: 'Á',
        d: 'M249 830h83v-83h-83v-83h-83v83h83v83zM166 581h83v-83h83v-83h83v-415h-83v166h-249v-166h-83v415h83v83h83v83zM166 498v-83h-83v-166h249v166h-83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'Acircumflex',
        unicode: 'Â',
        d: 'M166 830h166v-83h83v-83h-83v83h-166v-83h-83v83h83v83zM166 581h83v-83h83v-83h83v-415h-83v166h-249v-166h-83v415h83v83h83v83zM166 498v-83h-83v-166h249v166h-83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'Atilde',
        unicode: 'Ã',
        d: 'M166 830h83v-83h83v83h83v-83h-83v-83h-83v83h-83v-83h-83v83h83v83zM166 581h83v-83h83v-83h83v-415h-83v166h-249v-166h-83v415h83v83h83v83zM166 498v-83h-83v-166h249v166h-83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'Adieresis',
        unicode: 'Ä',
        d: 'M83 830h83v-166h-83v166zM249 830h83v-166h-83v166zM166 581h83v-83h83v-83h83v-415h-83v166h-249v-166h-83v415h83v83h83v83zM166 498v-83h-83v-166h249v166h-83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'Aring',
        unicode: 'Å',
        d: 'M166 830h83v-83h83v-83h-83v-166h83v-83h83v-415h-83v166h-249v-166h-83v415h83v83h83v166h-83v83h83v83zM166 747v-83h83v83h-83zM166 498v-83h-83v-166h249v166h-83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'AE',
        unicode: 'Æ',
        d: 'M83 747h83v-83h83v83h166v-83h-166v-249h83v-83h-83v-249h166v-83h-249v249h-83v-249h-83v664h83v83zM83 664v-332h83v332h-83z'
      }),
      h('glyph', {
        'glyph-name': 'Ccedilla',
        unicode: 'Ç',
        d: 'M83 747h249v-83h83v-83h-83v83h-249v-581h249v83h83v-83h-83v-83h-83v-83h-83v-83h-83v83h83v83h-83v83h-83v581h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'Egrave',
        unicode: 'È',
        d: 'M83 830h83v-83h83v-83h-83v83h-83v83zM0 581h415v-83h-332v-166h249v-83h-249v-166h332v-83h-415v581z'
      }),
      h('glyph', {
        'glyph-name': 'Eacute',
        unicode: 'É',
        d: 'M249 830h83v-83h-83v-83h-83v83h83v83zM0 581h415v-83h-332v-166h249v-83h-249v-166h332v-83h-415v581z'
      }),
      h('glyph', {
        'glyph-name': 'Ecircumflex',
        unicode: 'Ê',
        d: 'M166 830h166v-83h83v-83h-83v83h-166v-83h-83v83h83v83zM0 581h415v-83h-332v-166h249v-83h-249v-166h332v-83h-415v581z'
      }),
      h('glyph', {
        'glyph-name': 'Edieresis',
        unicode: 'Ë',
        d: 'M83 830h83v-166h-83v166zM249 830h83v-166h-83v166zM0 581h415v-83h-332v-166h249v-83h-249v-166h332v-83h-415v581z'
      }),
      h('glyph', {
        'glyph-name': 'Igrave',
        unicode: 'Ì',
        d: 'M83 830h83v-83h83v-83h-83v83h-83v83zM83 581h249v-83h-83v-415h83v-83h-249v83h83v415h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'Iacute',
        unicode: 'Í',
        d: 'M249 830h83v-83h-83v-83h-83v83h83v83zM83 581h249v-83h-83v-415h83v-83h-249v83h83v415h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'Icircumflex',
        unicode: 'Î',
        d: 'M166 830h166v-83h83v-83h-83v83h-166v-83h-83v83h83v83zM83 581h249v-83h-83v-415h83v-83h-249v83h83v415h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'Idieresis',
        unicode: 'Ï',
        d: 'M83 830h83v-166h-83v166zM249 830h83v-166h-83v166zM83 581h249v-83h-83v-415h83v-83h-249v83h83v415h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'Eth',
        unicode: 'Ð',
        d: 'M0 747h332v-83h83v-581h-83v-83h-332v83h83v249h-83v83h83v249h-83v83zM166 664v-249h83v-83h-83v-249h166v581h-166z'
      }),
      h('glyph', {
        'glyph-name': 'Ntilde',
        unicode: 'Ñ',
        d: 'M166 830h83v-83h83v83h83v-83h-83v-83h-83v83h-83v-83h-83v83h83v83zM0 581h83v-166h83v-83h83v-83h83v332h83v-581h-83v166h-83v83h-83v83h-83v-332h-83v581z'
      }),
      h('glyph', {
        'glyph-name': 'Ograve',
        unicode: 'Ò',
        d: 'M83 830h83v-83h83v-83h-83v83h-83v83zM83 581h249v-83h83v-415h-83v-83h-249v83h-83v415h83v83zM83 498v-415h249v415h-249z'
      }),
      h('glyph', {
        'glyph-name': 'Oacute',
        unicode: 'Ó',
        d: 'M249 830h83v-83h-83v-83h-83v83h83v83zM83 581h249v-83h83v-415h-83v-83h-249v83h-83v415h83v83zM83 498v-415h249v415h-249z'
      }),
      h('glyph', {
        'glyph-name': 'Ocircumflex',
        unicode: 'Ô',
        d: 'M166 830h166v-83h83v-83h-83v83h-166v-83h-83v83h83v83zM83 581h249v-83h83v-415h-83v-83h-249v83h-83v415h83v83zM83 498v-415h249v415h-249z'
      }),
      h('glyph', {
        'glyph-name': 'Otilde',
        unicode: 'Õ',
        d: 'M166 830h83v-83h83v83h83v-83h-83v-83h-83v83h-83v-83h-83v83h83v83zM83 581h249v-83h83v-415h-83v-83h-249v83h-83v415h83v83zM83 498v-415h249v415h-249z'
      }),
      h('glyph', {
        'glyph-name': 'Odieresis',
        unicode: 'Ö',
        d: 'M83 830h83v-166h-83v166zM249 830h83v-166h-83v166zM83 581h249v-83h83v-415h-83v-83h-249v83h-83v415h83v83zM83 498v-415h249v415h-249z'
      }),
      h('glyph', {
        'glyph-name': 'multiply',
        unicode: '×',
        d: 'M0 498h83v-83h83v-83h83v83h83v83h83v-83h-83v-83h-83v-83h83v-83h83v-83h-83v83h-83v83h-83v-83h-83v-83h-83v83h83v83h83v83h-83v83h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'Oslash',
        unicode: 'Ø',
        d: 'M332 830h83v-83h-83v-83h83v-581h-83v-83h-249v-83h-83v83h83v83h-83v581h83v83h249v83zM83 664v-415h83v-166h166v415h-83v166h-166zM166 498h83v-249h-83v249z'
      }),
      h('glyph', {
        'glyph-name': 'Ugrave',
        unicode: 'Ù',
        d: 'M83 830h83v-83h83v-83h-83v83h-83v83zM0 581h83v-498h249v498h83v-498h-83v-83h-249v83h-83v498z'
      }),
      h('glyph', {
        'glyph-name': 'Uacute',
        unicode: 'Ú',
        d: 'M249 830h83v-83h-83v-83h-83v83h83v83zM0 581h83v-498h249v498h83v-498h-83v-83h-249v83h-83v498z'
      }),
      h('glyph', {
        'glyph-name': 'Ucircumflex',
        unicode: 'Û',
        d: 'M166 830h166v-83h83v-83h-83v83h-166v-83h-83v83h83v83zM0 581h83v-498h249v498h83v-498h-83v-83h-249v83h-83v498z'
      }),
      h('glyph', {
        'glyph-name': 'Udieresis',
        unicode: 'Ü',
        d: 'M83 830h83v-166h-83v166zM249 830h83v-166h-83v166zM0 581h83v-498h249v498h83v-498h-83v-83h-249v83h-83v498z'
      }),
      h('glyph', {
        'glyph-name': 'Yacute',
        unicode: 'Ý',
        d: 'M249 830h83v-83h-83v-83h-83v83h83v83zM0 581h83v-166h83v-83h83v83h83v166h83v-166h-83v-83h-83v-332h-83v332h-83v83h-83v166z'
      }),
      h('glyph', {
        'glyph-name': 'Thorn',
        unicode: 'Þ',
        d: 'M0 747h83v-83h249v-83h83v-249h-83v-83h-249v-249h-83v747zM83 581v-249h249v249h-249z'
      }),
      h('glyph', {
        'glyph-name': 'germandbls',
        unicode: 'ß',
        d: 'M83 747h166v-83h83v-166h-83v-166h83v-83h83v-166h-83v-83h-166v83h166v166h-83v83h-83v166h83v166h-166v-664h-83v664h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'agrave',
        unicode: 'à',
        d: 'M83 747h83v-83h83v-83h-83v83h-83v83zM83 498h249v-83h83v-415h-83v83h-83v-83h-166v83h-83v166h83v83h249v83h-249v83zM83 249v-166h166v83h83v83h-249z'
      }),
      h('glyph', {
        'glyph-name': 'aacute',
        unicode: 'á',
        d: 'M249 747h83v-83h-83v-83h-83v83h83v83zM83 498h249v-83h83v-415h-83v83h-83v-83h-166v83h-83v166h83v83h249v83h-249v83zM83 249v-166h166v83h83v83h-249z'
      }),
      h('glyph', {
        'glyph-name': 'acircumflex',
        unicode: 'â',
        d: 'M166 747h166v-83h83v-83h-83v83h-166v-83h-83v83h83v83zM83 498h249v-83h83v-415h-83v83h-83v-83h-166v83h-83v166h83v83h249v83h-249v83zM83 249v-166h166v83h83v83h-249z'
      }),
      h('glyph', {
        'glyph-name': 'atilde',
        unicode: 'ã',
        d: 'M166 747h83v-83h83v83h83v-83h-83v-83h-83v83h-83v-83h-83v83h83v83zM83 498h249v-83h83v-415h-83v83h-83v-83h-166v83h-83v166h83v83h249v83h-249v83zM83 249v-166h166v83h83v83h-249z'
      }),
      h('glyph', {
        'glyph-name': 'adieresis',
        unicode: 'ä',
        d: 'M83 747h83v-166h-83v166zM249 747h83v-166h-83v166zM83 498h249v-83h83v-415h-83v83h-83v-83h-166v83h-83v166h83v83h249v83h-249v83zM83 249v-166h166v83h83v83h-249z'
      }),
      h('glyph', {
        'glyph-name': 'aring',
        unicode: 'å',
        d: 'M166 830h166v-83h83v-83h-83v-83h-166v83h-83v83h83v83zM166 747v-83h166v83h-166zM83 498h249v-83h83v-415h-83v83h-83v-83h-166v83h-83v166h83v83h249v83h-249v83zM83 249v-166h166v83h83v83h-249z'
      }),
      h('glyph', {
        'glyph-name': 'ae',
        unicode: 'æ',
        d: 'M83 498h249v-83h83v-83h-83v-83h-83v-166h83v83h83v-83h-83v-83h-83v83h-83v-83h-83v83h-83v166h83v83h83v83h-83v83zM249 415v-83h83v83h-83zM83 249v-166h83v166h-83z'
      }),
      h('glyph', {
        'glyph-name': 'ccedilla',
        unicode: 'ç',
        d: 'M83 498h249v-83h83v-83h-83v83h-249v-332h249v83h83v-83h-83v-83h-83v-83h-83v-83h-83v83h83v83h-83v83h-83v332h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'egrave',
        unicode: 'è',
        d: 'M83 747h83v-83h83v-83h-83v83h-83v83zM83 498h249v-83h83v-166h-332v-166h249v83h83v-83h-83v-83h-249v83h-83v332h83v83zM83 415v-83h249v83h-249z'
      }),
      h('glyph', {
        'glyph-name': 'eacute',
        unicode: 'é',
        d: 'M249 747h83v-83h-83v-83h-83v83h83v83zM83 498h249v-83h83v-166h-332v-166h249v83h83v-83h-83v-83h-249v83h-83v332h83v83zM83 415v-83h249v83h-249z'
      }),
      h('glyph', {
        'glyph-name': 'ecircumflex',
        unicode: 'ê',
        d: 'M166 747h166v-83h83v-83h-83v83h-166v-83h-83v83h83v83zM83 498h249v-83h83v-166h-332v-166h249v83h83v-83h-83v-83h-249v83h-83v332h83v83zM83 415v-83h249v83h-249z'
      }),
      h('glyph', {
        'glyph-name': 'edieresis',
        unicode: 'ë',
        d: 'M83 747h83v-166h-83v166zM249 747h83v-166h-83v166zM83 498h249v-83h83v-166h-332v-166h249v83h83v-83h-83v-83h-249v83h-83v332h83v83zM83 415v-83h249v83h-249z'
      }),
      h('glyph', {
        'glyph-name': 'igrave',
        unicode: 'ì',
        d: 'M83 747h83v-83h83v-83h-83v83h-83v83zM83 498h166v-415h83v-83h-249v83h83v332h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'iacute',
        unicode: 'í',
        d: 'M249 747h83v-83h-83v-83h-83v83h83v83zM83 498h166v-415h83v-83h-249v83h83v332h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'icircumflex',
        unicode: 'î',
        d: 'M166 747h166v-83h83v-83h-83v83h-166v-83h-83v83h83v83zM83 498h166v-415h83v-83h-249v83h83v332h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'idieresis',
        unicode: 'ï',
        d: 'M83 747h83v-166h-83v166zM249 747h83v-166h-83v166zM83 498h166v-415h83v-83h-249v83h83v332h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'eth',
        unicode: 'ð',
        d: 'M83 830h83v-83h83v83h83v-83h-83v-166h83v-166h83v-332h-83v-83h-249v83h-83v332h83v83h166v83h-166v83h83v83h-83v83zM83 415v-332h249v332h-249z'
      }),
      h('glyph', {
        'glyph-name': 'ntilde',
        unicode: 'ñ',
        d: 'M166 747h83v-83h83v83h83v-83h-83v-83h-83v83h-83v-83h-83v83h83v83zM0 498h83v-83h83v83h166v-83h83v-415h-83v415h-166v-83h-83v-332h-83v498z'
      }),
      h('glyph', {
        'glyph-name': 'ograve',
        unicode: 'ò',
        d: 'M83 747h83v-83h83v-83h-83v83h-83v83zM83 498h249v-83h83v-332h-83v-83h-249v83h-83v332h83v83zM83 415v-332h249v332h-249z'
      }),
      h('glyph', {
        'glyph-name': 'oacute',
        unicode: 'ó',
        d: 'M249 747h83v-83h-83v-83h-83v83h83v83zM83 498h249v-83h83v-332h-83v-83h-249v83h-83v332h83v83zM83 415v-332h249v332h-249z'
      }),
      h('glyph', {
        'glyph-name': 'ocircumflex',
        unicode: 'ô',
        d: 'M166 747h166v-83h83v-83h-83v83h-166v-83h-83v83h83v83zM83 498h249v-83h83v-332h-83v-83h-249v83h-83v332h83v83zM83 415v-332h249v332h-249z'
      }),
      h('glyph', {
        'glyph-name': 'otilde',
        unicode: 'õ',
        d: 'M166 747h83v-83h83v83h83v-83h-83v-83h-83v83h-83v-83h-83v83h83v83zM83 498h249v-83h83v-332h-83v-83h-249v83h-83v332h83v83zM83 415v-332h249v332h-249z'
      }),
      h('glyph', {
        'glyph-name': 'odieresis',
        unicode: 'ö',
        d: 'M83 747h83v-166h-83v166zM249 747h83v-166h-83v166zM83 498h249v-83h83v-332h-83v-83h-249v83h-83v332h83v83zM83 415v-332h249v332h-249z'
      }),
      h('glyph', {
        'glyph-name': 'divide',
        unicode: '÷',
        d: 'M166 664h83v-166h-83v166zM0 415h415v-83h-415v83zM166 249h83v-166h-83v166z'
      }),
      h('glyph', {
        'glyph-name': 'oslash',
        unicode: 'ø',
        d: 'M332 581h83v-83h-83v-83h83v-332h-83v-83h-249v-83h-83v83h83v83h-83v332h83v83h249v83zM83 415v-249h83v-83h166v249h-83v83h-166zM166 332h83v-166h-83v166z'
      }),
      h('glyph', {
        'glyph-name': 'ugrave',
        unicode: 'ù',
        d: 'M83 747h83v-83h83v-83h-83v83h-83v83zM0 498h83v-415h166v83h83v332h83v-498h-83v83h-83v-83h-166v83h-83v415z'
      }),
      h('glyph', {
        'glyph-name': 'uacute',
        unicode: 'ú',
        d: 'M249 747h83v-83h-83v-83h-83v83h83v83zM0 498h83v-415h166v83h83v332h83v-498h-83v83h-83v-83h-166v83h-83v415z'
      }),
      h('glyph', {
        'glyph-name': 'ucircumflex',
        unicode: 'û',
        d: 'M166 747h166v-83h83v-83h-83v83h-166v-83h-83v83h83v83zM0 498h83v-415h166v83h83v332h83v-498h-83v83h-83v-83h-166v83h-83v415z'
      }),
      h('glyph', {
        'glyph-name': 'udieresis',
        unicode: 'ü',
        d: 'M83 747h83v-166h-83v166zM249 747h83v-166h-83v166zM0 498h83v-415h166v83h83v332h83v-498h-83v83h-83v-83h-166v83h-83v415z'
      }),
      h('glyph', {
        'glyph-name': 'yacute',
        unicode: 'ý',
        d: 'M249 747h83v-83h-83v-83h-83v83h83v83zM0 498h83v-332h166v83h83v249h83v-581h-83v-83h-249v83h-83v83h83v-83h249v249h-83v-83h-166v83h-83v332z'
      }),
      h('glyph', {
        'glyph-name': 'thorn',
        unicode: 'þ',
        d: 'M0 664h83v-249h83v83h166v-83h83v-332h-83v-83h-166v83h-83v-249h-83v830zM166 415v-83h-83v-166h83v-83h166v332h-166z'
      }),
      h('glyph', {
        'glyph-name': 'ydieresis',
        unicode: 'ÿ',
        d: 'M83 747h83v-166h-83v166zM249 747h83v-166h-83v166zM0 498h83v-332h166v83h83v249h83v-581h-83v-83h-249v83h-83v83h83v-83h249v249h-83v-83h-166v83h-83v332z'
      }),
      h('glyph', {
        'glyph-name': 'pi',
        unicode: 'π',
        d: 'M0 498h415v-83h-83v-415h-83v415h-83v-415h-83v415h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'notequal',
        unicode: '≠',
        d: 'M332 498h83v-166h-166v-83h166v-83h-332v-83h-83v166h166v83h-166v83h332v83z'
      }),
      h('glyph', {
        'glyph-name': 'lessequal',
        unicode: '≤',
        d: 'M249 664h166v-83h-166v-83h-166v-83h166v-83h166v-83h-166v83h-166v83h-83v83h83v83h166v83zM0 166h415v-83h-415v83z'
      }),
      h('glyph', {
        'glyph-name': 'greaterequal',
        unicode: '≥',
        d: 'M0 664h166v-83h166v-83h83v-83h-83v-83h-166v-83h-166v83h166v83h166v83h-166v83h-166v83zM0 166h415v-83h-415v83z'
      }),
      h('glyph', {
        'glyph-name': 'SF100000',
        unicode: '─',
        d: 'M0 415h498v-83h-498v83z'
      }),
      h('glyph', {
        'glyph-name': 'SF110000',
        unicode: '│',
        d: 'M166 913h83v-1079h-83v1079z'
      }),
      h('glyph', {
        'glyph-name': 'SF010000',
        unicode: '┌',
        d: 'M166 415h332v-83h-249v-498h-83v581z'
      }),
      h('glyph', {
        'glyph-name': 'SF030000',
        unicode: '┐',
        d: 'M0 415h249v-581h-83v498h-166v83z'
      }),
      h('glyph', {
        'glyph-name': 'SF020000',
        unicode: '└',
        d: 'M166 913h83v-498h249v-83h-332v581z'
      }),
      h('glyph', {
        'glyph-name': 'SF040000',
        unicode: '┘',
        d: 'M166 913h83v-581h-249v83h166v498z'
      }),
      h('glyph', {
        'glyph-name': 'SF080000',
        unicode: '├',
        d: 'M166 913h83v-498h249v-83h-249v-498h-83v1079z'
      }),
      h('glyph', {
        'glyph-name': 'SF090000',
        unicode: '┤',
        d: 'M166 913h83v-1079h-83v498h-166v83h166v498z'
      }),
      h('glyph', {
        'glyph-name': 'SF060000',
        unicode: '┬',
        d: 'M0 415h498v-83h-249v-498h-83v498h-166v83z'
      }),
      h('glyph', {
        'glyph-name': 'SF070000',
        unicode: '┴',
        d: 'M166 913h83v-498h249v-83h-498v83h166v498z'
      }),
      h('glyph', {
        'glyph-name': 'SF050000',
        unicode: '┼',
        d: 'M166 913h83v-498h249v-83h-249v-498h-83v498h-166v83h166v498z'
      }),
      h('glyph', {
        'glyph-name': 'shade',
        unicode: '▒',
        d: 'M0 913h83v-83h83v83h83v-83h83v83h83v-83h83v-83h-83v-83h83v-83h-83v-83h83v-83h-83v-83h83v-83h-83v-83h83v-83h-83v-83h83v-83h-83v-83h-83v83h-83v-83h-83v83h-83v-83h-83v83h83v83h-83v83h83v83h-83v83h83v83h-83v83h83v83h-83v83h83v83h-83v83h83v83h-83v83z M166 830v-83h-83v-83h83v-83h-83v-83h83v-83h-83v-83h83v-83h-83v-83h83v-83h-83v-83h83v-83h83v83h83v-83h83v83h-83v83h83v83h-83v83h83v83h-83v83h83v83h-83v83h83v83h-83v83h83v83h-83v-83h-83v83h-83zM166 747h83v-83h83v-83h-83v-83h83v-83h-83v-83h83v-83h-83v-83h83 v-83h-83v-83h-83v83h83v83h-83v83h83v83h-83v83h83v83h-83v83h83v83h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'char0',
        d: 'M0 747h83v-83h-83v83zM166 747h83v-83h-83v83zM332 747h83v-83h-83v83zM0 581h83v-83h-83v83zM332 581h83v-83h-83v83zM0 415h83v-83h-83v83zM332 415h83v-83h-83v83zM0 249h83v-83h-83v83zM332 249h83v-83h-83v83zM0 83h83v-83h-83v83zM166 83h83v-83h-83v83zM332 83h83 v-83h-83v83z'
      }),
      h('glyph', {
        'glyph-name': 'uni25C6',
        d: 'M166 581h83v-83h83v-83h83v-83h-83v-83h-83v-83h-83v83h-83v83h-83v83h83v83h83v83z'
      }),
      h('glyph', {
        'glyph-name': 'uni2409',
        d: 'M0 747h83v-166h83v166h83v-415h166v-83h-83v-249h-83v249h-83v249h-83v-166h-83v415z'
      }),
      h('glyph', {
        'glyph-name': 'uni240C',
        d: 'M0 747h249v-83h-166v-83h83v-83h-83v-166h-83v415zM166 415h249v-83h-166v-83h83v-83h-83v-166h-83v415z'
      }),
      h('glyph', {
        'glyph-name': 'uni240D',
        d: 'M83 747h166v-83h-166v-166h166v-83h83v-83h83v-83h-83v-83h83v-166h-83v166h-83v-166h-83v415h-83v83h-83v166h83v83zM249 332v-83h83v83h-83z'
      }),
      h('glyph', {
        'glyph-name': 'uni240A',
        d: 'M0 747h83v-249h166v-83h166v-83h-166v-83h83v-83h-83v-166h-83v415h-166v332z'
      }),
      h('glyph', {
        'glyph-name': 'uni2424',
        d: 'M0 747h83v-83h83v-83h83v166h83v-332h-83v-332h166v-83h-249v415h83v83h-83v83h-83v-166h-83v332z'
      }),
      h('glyph', {
        'glyph-name': 'uni240B',
        d: 'M0 747h83v-249h83v249h83v-249h-83v-166h249v-83h-83v-249h-83v249h-83v83h-83v166h-83v249z'
      }),
      h('glyph', {
        'glyph-name': 'glyph215',
        d: 'M0 0v730h398v-730h-398z'
      }),
      h('glyph', {
        'glyph-name': '_d_125'
      }),
      h('glyph', {
        'glyph-name': '_d_128',
        d: 'M166 747h166v-83h83v-83h-83v83h-166v-249h83v-83h-83v-249h166v83h83v-83h-83v-83h-166v83h-83v-83h-83v83h83v249h-83v83h83v249h83v83z'
      }),
      h('glyph', {
        'glyph-name': '_d_138',
        d: 'M83 415h249v-83h-249v83z'
      }),
      h('glyph', {
        'glyph-name': '_d_141',
        d: 'M166 747h166v-83h83v-166h-83v-83h-166v83h-83v166h83v83zM166 664v-166h166v166h-166z'
      }),
      h('glyph', {
        'glyph-name': '_d_142',
        d: 'M166 664h83v-166h166v-83h-166v-166h-83v166h-166v83h166v166zM0 166h415v-83h-415v83z'
      }),
      h('glyph', {
        'glyph-name': '_d_148',
        d: 'M166 415h166v-83h-166v83z'
      })
    ]
  );

export default MiscFixedSC613;
