module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
          },
        },
      ],
      // Must be listed last (for react-native-reanimated v4)
      'react-native-worklets/plugin',
    ],
  };
};
