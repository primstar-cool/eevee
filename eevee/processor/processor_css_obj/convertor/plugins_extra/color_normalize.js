/**
 * @since 20180622 10:47
 * @author ___xy
 */

const traverse = require('../utils/traverse.js');

module.exports = (colorType="ARGB") => {
  return (root) => {
    traverse(root, (node) => {

      if (1 || node.type === 'declaration') {
        
        var key = node.property;

        if (key === 'color'
                  || key === 'background-color'
                  || key === 'border-right-color'
                  || key === 'border-left-color'
                  || key === 'border-top-color'
                  || key === 'border-bottom-color'
        ) {
          var colorString = node.value;
          node.value = require("../utils/color_normalize.js")(colorString, colorType);

        } 
        // else if (key === 'background-image') {
        //   if (node.value.startsWith(""))
        // }
      }
    });
  };
};
