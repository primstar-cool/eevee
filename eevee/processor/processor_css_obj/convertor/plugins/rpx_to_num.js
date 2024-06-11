/**
 * @since 20180622 10:47
 * @author ___xy
 */

const traverse = require('../utils/traverse.js');

module.exports = (mvvmDesignWidth = 750) => {
  return (root) => {
    traverse(root, (node) => {
      /**
       * Convert `rpx` to `lpx`
       */
      if (node.type === 'declaration') {
        if (node.property !== 'line-height' && node.value.endsWith('rpx')) {
          // debugger
          let preText = node.value.substring(0, node.value.length - 3)
          if (!isNaN(preText)) {
            if (mvvmDesignWidth === 750)
              node.value = parseFloat(preText);
            else {
              let v = "" + (mvvmDesignWidth * r / 750);
              if (v.length - v.indexOf(".") > 9) {
                return Math.round(mvvmDesignWidth * 8192 * r / 750) / 8192 + 'lpx';
              } else {
                return parseFloat(v);
              }
  
            }
          };
        }
      }
    });
  };
};
