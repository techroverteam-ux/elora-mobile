// Polyfill for Node.js < 18.14.0
const os = require('os');
if (!os.availableParallelism) {
  os.availableParallelism = () => os.cpus().length;
}

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

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

// Export the final config
module.exports = mergedConfig;
