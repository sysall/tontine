module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      'react-native-reanimated/plugin',
      function () {
        return {
          visitor: {
            MetaProperty(path) {
              if (path.node.meta && path.node.meta.name === 'import' && path.node.property && path.node.property.name === 'meta') {
                path.replaceWithSourceString('{ env: (typeof process !== "undefined" && process.env) || {} }');
              }
            },
          },
        };
      },
    ],
  };
};
