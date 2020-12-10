export function UnitForName(name) {
  const letter = name.toUpperCase()[0];
  return {
    R: 'Ω',
    L: 'H',
    C: 'F'
  }[letter];
}
