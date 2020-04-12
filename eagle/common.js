

export const ansi = (...args) => `\u001b[${[...args].join(";")}m`;
export const text = (text, ...color) => ansi(...color) + text + ansi(0);
 