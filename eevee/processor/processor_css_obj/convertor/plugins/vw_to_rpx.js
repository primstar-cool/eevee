/**
 * @since 20180622 10:47
 * @author ___xy
 */

const traverse = require('../utils/traverse.js');

module.exports = () => {
  return (root) => {
    traverse(root, (node) => {
      /**
       * Convert `vw` to `lpx`
       */
      if (node.type === 'declaration') {
        if (node.value.indexOf('vw') !== -1) {
          node.value = node.value.replace(/([\d\.]+)vw/g, (m, r) => {


            let v = "" + (750 * r / 100);
            if (v.length - v.indexOf(".") > 9) {
              return Math.round(750 * 8192 * r / 100 ) / 8192 + 'rpx';  // fixed(2)
            } else {
              return v + "rpx"
            }

          });
        }
      }
    });
  };
};
