/**
 * @since 20180622 10:47
 * @author ___xy
 */

const traverse = require('../utils/traverse.js');

module.exports = (hapDesignWidth = 720) => {
  return (root) => {
    traverse(root, (node) => {
      /**
       * Convert `vw` to `lpx`
       */
      if (node.type === 'declaration') {
        if (node.value.indexOf('vw') !== -1) {
          node.value = node.value.replace(/([\d\.]+)vw/g, (m, r) => {


            let v = "" + (hapDesignWidth * r / 100);
            if (v.length - v.indexOf(".") > 9) {
              return Math.round(hapDesignWidth * 8192 * r / 100 ) / 8192 + 'lpx';  // fixed(2)
            } else {
              return v + "lpx"
            }

          });
        }
      }
    });
  };
};
