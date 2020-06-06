const adjs = [
  /*  'autumn',
  'hidden',
  'bitter',
  'misty',
  'silent',
  'empty',
  'dry',
  'dark',
  'summer',
  'icy',
  'delicate',
  'quiet',
  'white',
  'cool',
  'spring',
  'winter',
  'patient',
  'twilight',
  'dawn',
  'crimson',
  'wispy',
  'weathered',
  'blue',
  'billowing',
  'broken',
  'cold',
  'damp',
  'falling',
  'frosty',
  'green',
  'long',
  'late',
  'lingering',
  'bold',
  'little',
  'morning',
  'muddy',
  'old',
  'red',
  'rough',
  'still',
  'small',
  'sparkling',
  'throbbing',
  'shy',
  'wandering',
  'withered',
  'wild',
  'black',
  'young',
  'holy',
  'solitary',
  'fragrant',
  'aged',
  'snowy',
  'proud',
  'floral',
  'restless',
  'divine',
  'polished',
  'ancient',
  'purple',
  'lively',
  'nameless'*/
  'versteckt',
  'bitter',
  'neblig',
  'leeren',
  'trocken',
  'dunkel',
  'eisig',
  'zart',
  'ruhig',
  'cool',
  'geduldig',
  'verwittert',
  'wogend',
  'gebrochen',
  'kalt',
  'fallen',
  'eisig',
  'lange',
  'spät',
  'verweilen',
  'wenig',
  'schlammig',
  'alt',
  'rot',
  'immerwährend',
  'klein',
  'funkelnd',
  'pochend',
  'schüchtern',
  'wandern',
  'verwelkt',
  'wild',
  'schwarz',
  'jung',
  'heilig',
  'einsam',
  'duftend',
  'alt',
  'schneebedeckt',
  'stolz',
  'unruhig',
  'göttlich',
  'poliert',
  'uralt',
  'lila',
  'lebhaft'
];

const nouns = [
  'Wasserfall',
  'Fluss',
  'Brise',
  'Mond',
  'Regen',
  'Wind',
  'Meer',
  'Morgen',
  'Schnee',
  'See',
  'Sonnenuntergang',
  'Kiefer',
  'Schatten',
  'Blatt',
  'Dämmerung',
  'Wald',
  'Hügel',
  'Wolke',
  'Wiese',
  'Sonne',
  'Lichtung',
  'Vogel',
  'Bach',
  'Schmetterling',
  'Busch',
  'Tau',
  'Staub',
  'Feld',
  'Feuer',
  'Blume',
  'Glühwürmchen',
  'Feder',
  'Gras',
  'Dunst',
  'Berg',
  'Nacht',
  'Teich',
  'Dunkelheit',
  'Schneeflocke',
  'Stille',
  'Klang',
  'Himmel',
  'Surfen',
  'Donner',
  'Wasser',
  'Wildblume',
  'Welle',
  'Wasser',
  'Resonanz',
  'Sonne',
  'Holz',
  'Traum',
  'Kirsche',
  'Baum',
  'Nebel',
  'Frost',
  'Stimme',
  'Papier',
  'Frosch',
  'Rauch',
  'Star'
  //'waterfall', 'river', 'breeze', 'moon', 'rain', 'wind', 'sea', 'morning', 'snow', 'lake', 'sunset', 'pine', 'shadow', 'leaf', 'dawn', 'glitter', 'forest', 'hill', 'cloud', 'meadow', 'sun', 'glade', 'bird', 'brook', 'butterfly', 'bush', 'dew', 'dust', 'field', 'fire', 'flower', 'firefly', 'feather', 'grass', 'haze', 'mountain', 'night', 'pond', 'darkness', 'snowflake', 'silence', 'sound', 'sky', 'shape', 'surf', 'thunder', 'violet', 'water', 'wildflower', 'wave', 'water', 'resonance', 'sun', 'wood', 'dream', 'cherry', 'tree', 'fog', 'frost', 'voice', 'paper', 'frog', 'smoke', 'star'
];

module.exports = {
  haiku() {
    const adj = adjs[Math.floor(Math.random() * adjs.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const MIN = 1000;
    const MAX = 9999;
    const num = Math.floor(Math.random() * (MAX + 1 - MIN)) + MIN;

    return `${adj}-${noun}-${num}`;
  }
};
