/**
 * @since 20180622 10:41
 * @author ___xy
 */

const css = require('css');

// const trailQuotes = require('../utils/trail_quotes.js');
// const replaceRelativePath = require('../utils/replace_relative_path.js');

module.exports = function injectComponentCSS({
  from,
  to,
  readFile,
  componentWXSSPaths,
}) {
  return (root) => {
    const stylesheets = componentWXSSPaths.map((cssFilePath) => {
      const fileContent = readFile(cssFilePath);
      const parsed = css.parse(fileContent);

      parsed.stylesheet.rules.forEach((rule) => {
        if (rule.type === 'import') {
          // let resolvedPath = replaceRelativePath(
          //   trailQuotes(rule.import),
          //   cssFilePath,
          //   from
          // );

          if (!resolvedPath.startsWith('.')) {
            resolvedPath = './' + resolvedPath;
          }
          rule.import = `'${resolvedPath}'`;
        }
        // todo replace url(...) statement with relative path
      });
      return parsed;
    });

    root.stylesheet.rules = stylesheets
      .reduce((rules, style) => {
        style.stylesheet.rules.forEach((rule) => {
          rule.parent = root;
        });
        return rules.concat(style.stylesheet.rules);
      }, [])
      .concat(root.stylesheet.rules);
  };
};
