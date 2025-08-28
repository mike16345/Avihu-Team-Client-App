module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo"]],
    env: {
      production: {
        // Make sure to leave reanimated plugin last in the plugins array
        plugins: ["react-native-reanimated/plugin"],
      },
    },
  };
};
