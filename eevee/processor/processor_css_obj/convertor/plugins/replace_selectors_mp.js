/**
 * @since 20180622 10:44
 * @author ___xy
 */

const cssWhat = require("../utils/css_what.js");
const cssWhatStringify = require('../utils/css_what_stringify.js');

module.exports = function replaceSelectors(componentTagNames) {
  return (root) => {
    // only walk the first level node
    root.stylesheet.rules.forEach((rule) => {
      if (rule.type === 'rule') {
        rule.selectors = rule.selectors.map((selector) => {
          let what = '';
          try {
            what = cssWhat(selector);
          } catch (e) {
            console.log('css what exception', e);
          }
          let touched = false;
          if (what) {
            what.forEach((firstLayer) => {
              firstLayer.forEach((sel) => {
                if (sel.type === 'tag') {
                  if (sel.name === 'div') {
                    sel.name = 'view'
                  } else if (sel.name === 'span') {
                    // sel.type = 'attribute';
                    // sel.name = 'class';
                    // sel.value = `h5-span`;
                    // sel.action = 'element';
                    // sel.ignoreCase = false;
                    // touched = true;
                    // sel.name = 'view' //text node CAN'T has childNodes, but span can.
                    
                  } else if (sel.name === 'img') {
                    sel.name = 'image'
                  } else if (sel.name === 'body') {
                    sel.name = 'page'
                  } else {
                    return;
                  }
                  touched = true;
                }
              });
            });
          }
          if (touched) {
            return cssWhatStringify(what);
          }
          return selector;
        });
      }
    });
    return root;
  };
};
