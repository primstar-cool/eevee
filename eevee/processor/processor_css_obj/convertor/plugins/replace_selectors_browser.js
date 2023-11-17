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
                  if (sel.name === 'view') {
                    sel.name = 'div'
                  } else if (sel.name === 'text') {
                    sel.name = 'span'
                  } else if (sel.name === 'image') {
                    sel.name = 'img'
                  } else if (sel.name === 'page') {
                    sel.name = 'body'
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
