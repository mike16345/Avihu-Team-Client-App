module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // other plugins go above 'react-native-reanimated/plugin',
      "react-native-reanimated/plugin",
    ],
  };
};
