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

            if (hapDesignWidth === 750) 
              return r + 'lpx'
            else {
              if (hapDesignWidth === 720 && r <= 4) {
                return r + "lpx"
              } 

              let v = "" + (hapDesignWidth * r / 750);
              if (v.length - v.indexOf(".") > 9) {
                return Math.round(hapDesignWidth * 8192 * r / 750 ) / 8192 + 'lpx';  // fixed(2)
              } else {
                return v + "lpx"
              }
            }
          });
        }
      }
    });
  };
};
