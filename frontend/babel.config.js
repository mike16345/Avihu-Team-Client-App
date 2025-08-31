module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo"]],
    // Make sure Reanimated plugin is always last
    plugins: ["react-native-reanimated/plugin"],
  };
};
