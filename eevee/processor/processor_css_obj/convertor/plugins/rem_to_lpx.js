/**
 * @since 20180622 10:47
 * @author ___xy
 */

const traverse = require('../utils/traverse.js');

module.exports = (screenWidthRem = 7.5, hapDesignWidth = 720) => {
  return (root) => {
    traverse(root, (node) => {
      /**
       * Convert `rem` to `lpx`
       */
      if (node.type === 'declaration') {
        if (node.value.indexOf('rem') !== -1) {
          node.value = node.value.replace(/([\d\.]+)rem/g, (m, r) => {

            if (hapDesignWidth/screenWidthRem === Math.floor(hapDesignWidth/screenWidthRem)) 
              return r * (hapDesignWidth/screenWidthRem) + 'lpx'

            return Math.round(hapDesignWidth * 8192 * r / screenWidthRem) / 8192 + 'lpx';
          });
        }
      }
    });
  };
};
