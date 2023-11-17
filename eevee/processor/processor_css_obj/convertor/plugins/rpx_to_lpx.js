/**
 * @since 20180622 10:47
 * @author ___xy
 */

const traverse = require('../utils/traverse.js');

module.exports = (hapDesignWidth = 720) => {
  return (root) => {
    traverse(root, (node) => {
      /**
       * Convert `rpx` to `lpx`
       */
      if (node.type === 'declaration') {
        if (node.value.indexOf('rpx') !== -1) {
          node.value = node.value.replace(/([\d\.]+)rpx/g, (m, r) => {
            return Math.round(hapDesignWidth * 8192 * r / 750 ) / 8192 + 'lpx';  // fixed(2)
          });
        }
      }
    });
  };
};
