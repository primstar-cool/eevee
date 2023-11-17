module.exports = function (cssParsedNode, minify) {

    const css = require("../parser/parse_css_like/css/index.js");
    const cssContent = css.stringify(cssParsedNode);

    if (!minify) {
        return cssContent;
    } else {
        const CleanCSS = require('clean-css');
    
        let output = new CleanCSS().minify(cssContent);
        let cssContentMinified = output.styles

        return cssContentMinified;
    }
}
    