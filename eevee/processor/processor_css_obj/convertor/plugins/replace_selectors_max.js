/**
 * @since 20180622 10:44
 * @author ___xy
 */

const cssWhat = require("../utils/css_what.js");
const cssWhatStringify = require('../utils/css_what_stringify.js');

module.exports = function replaceSelectors({page, componentTagNames }) {
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
                  if (
                    ['view', 'text', 'button', 'scroll-view', 'image', 'page', 'div', 'span', 'img'].includes(sel.name)
                  ) {
                    /**
                     * Convert `view {}` to `.tag-view {}`
                     * Convert `text {}` to `.tag-text {}`
                     * Convert `button {}` to `.tag-button {}`
                     * Convert `scroll-view {}` to `.tag-scroll-view {}`
                     */
                    sel.type = 'attribute';
                    sel.value = `tag-${sel.name}`;
                    sel.name = 'class';
                    sel.action = 'element';
                    sel.ignoreCase = false;
                    touched = true;
                  } else if (componentTagNames.indexOf(sel.name) !== -1) {
                    /**
                     * Convert `component-name` to `.wxc-component-name`
                     */
                    sel.value = `wxc-${sel.name}`;
                    sel.type = 'attribute';
                    sel.name = 'class';
                    sel.action = 'element';
                    sel.ignoreCase = false;
                    touched = true;
                  }
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
