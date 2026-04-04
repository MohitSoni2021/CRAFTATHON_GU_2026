module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel", // Corrected: moved back to presets
    ],
    plugins: [
      "react-native-reanimated/plugin", // Corrected: must stay in plugins
    ],
  };
};
