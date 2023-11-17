const cssWhat = require("../utils/css_what.js");
const cssWhatStringify = require('../utils/css_what_stringify.js');
const chalk = require('chalk');

module.exports = function replaceSelectors() {
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
              for (let i = 0; i < firstLayer.length; ) {
                let sel = firstLayer[i];
                if (sel.type === 'pseudo-element') {
                  /**
                   * Convert `.xxx::after {}` to `.xxx {}`
                   */
                  console.log(
                    chalk.red('class pseudo-element not supported: ' + sel.name)
                  );
                  firstLayer.splice(i, 1);
                  i--;
                  touched = true;
                }
                if (sel.type == 'pseudo') {
                  console.log(
                    chalk.red('class pseudo not supported: ' + sel.name)
                  );
                  firstLayer.splice(i, 1);
                  i--;
                  touched = true;
                }
                if (sel.type === 'tag') {
                  if (['view', 'scroll-view'].includes(sel.name)) {
                    /**
                     * Convert `view {}` to `.hap-view {}`
                     * Convert `scroll-view {}` to `.hap-scroll-view {}`
                     */
                    sel.type = 'attribute';
                    sel.name = 'class';
                    sel.action = 'element';
                    sel.value = 'hap-view';
                    sel.ignoreCase = false;
                    touched = true;
                  } else if (sel.name === 'page') {
                    /**
                     * Convert `page {}` to `body {}`
                     */
                    sel.name = 'body';
                    touched = true;
                  } else if (sel.name === 'span') {
                    /**
                     * Convert `span {}` to `text {}`
                     */
                    sel.name = 'text';
                    touched = true;
                  }
                }
                i++;
              }
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
