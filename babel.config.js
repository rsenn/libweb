const plugins = [
  ["@babel/plugin-proposal-decorators", { legacy: true }],
  ["@babel/plugin-proposal-class-properties", { loose: true }]
];

const presets = [["next/babel"]];

module.exports = { presets, plugins };
