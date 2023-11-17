/**
 * @since 20180622 10:47
 * @author ___xy
 */

const traverse = require('../utils/traverse.js');

module.exports = () => {
  return (root) => {
    traverse(root, (node) => {
      /**
       * Convert `rpx` to `vw number`
       */
      if (node.type === 'declaration') {
        if (node.value.indexOf('rpx') !== -1) {
          node.value = node.value.replace(/([\d\.]+)rpx/g, (m, r) => {
            return Math.round(4096 * r / 750) / 4096 + 'vw';  // fixed(2)
          });
        }
      }
    });
  };
};
