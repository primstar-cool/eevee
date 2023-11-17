/**
 * @since 20180622 10:47
 * @author ___xy
 */

const traverse = require('../utils/traverse.js');

module.exports = (screenWidthRem = 7.5) => {
  return (root) => {
    traverse(root, (node) => {
      /**
       * Convert `rem` to `vw number`
       */
      if (node.type === 'declaration') {
        if (node.value.indexOf('rem') !== -1) {
          node.value = node.value.replace(/([\d\.]+)rem/g, (m, r) => {
            return Math.round(4096 * r /screenWidthRem) / 4096 + 'vw'; // fixed(2)
          });
        }
      }
    });
  };
};
