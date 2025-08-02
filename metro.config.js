const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { wrapWithAudioAPIMetroConfig } = require('react-native-audio-api/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */

// Create a base config
const baseConfig = getDefaultConfig(__dirname);

// Merge your custom config (if any)
const mergedConfig = mergeConfig(baseConfig, {
  // Add any customizations here
});

// Wrap with Audio API config
const finalConfig = wrapWithAudioAPIMetroConfig(mergedConfig);

// Export the final config
module.exports = finalConfig;
