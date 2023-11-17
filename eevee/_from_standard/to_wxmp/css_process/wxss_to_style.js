/**
 * @since 20180619 13:51
 * @author ___xy
 */


const path = require('path');
// const injectComponentCSS = require('./plugins/inject_component_css.js');
// const replaceSelectors = require('./plugins/replace_selectors.js');
// const resolveImport = require('./plugins/resolve_import.js');

const replaceSelectors = require('../../../processor/processor_css_obj/convertor/plugins/replace_selectors_browser.js');
const rpx2rem = require('../../../processor/processor_css_obj/convertor/plugins/replace_selectors_browserrpx_to_rem.js');

module.exports = ({
  wxss,
  from,
  to,
  readFile,
  usedComponents = [],
  importedWXSSPaths = [],
}) => {
  wxss = _replaceImport(wxss, from, readFile);
  const parsed = require("../../../parser/parse_css_like/index.js")(wxss);
  const componentWXSSPaths = [];
  const componentTagNames = [];
  usedComponents.forEach(({ srcPath, name }) => {
    componentWXSSPaths.push(path.join(srcPath, name + '.wxss'));
    componentTagNames.push(name);
  });


  [
    // injectComponentCSS({ from, to, componentWXSSPaths, readFile }),
    // resolveImport({ from, to, importedWXSSPaths, readFile }),

    // 先引入，再替换
    // replaceSelectors({ componentTagNames }),
    replaceSelectors(),
    rpx2rem(),
  ].forEach((plugin) => {
    plugin(parsed);
  });

}