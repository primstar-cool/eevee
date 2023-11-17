/**
 * @since 20180622 10:41
 * @author ___xy
 */
module.exports = function injectComponentDomain(
  componentPrefix,
) {
  return function (parsed) {
    
    parsed.stylesheet.rules.forEach((rule) => {
      if (rule.type === "rule" && rule.selectors) {
        rule.selectors = rule.selectors.map(
          v=> componentPrefix + v
        )
      }
      // debugger
      // todo replace url(...) statement with relative path
    })
  };
};
