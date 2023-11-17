
const _analysisCssHash = require("./analysis_css_hash.js");
module.exports = function sort_css_rules(styleContent) {


    destArray = [];
    if (styleContent.type === "stylesheet") {
        var rules = styleContent.stylesheet.rules;
        _resolveRules(rules, destArray);
    }

    destArray.forEach(
        co => {
            var w = 0;

            co.route.forEach(
                cor => {
                    if (cor.id) w += 1000000000;
                    if (cor.classList) w += 1000000 * cor.classList.length;
                    if (cor.tag) w += 1000;

                }
            );

            w += co.index;
            delete co.index
            co.sortWeight = w;
        }
    );


    destArray.sort(function (a, b) {
        return a.sortWeight === b.sortWeight ? 0 : a.sortWeight > b.sortWeight ? 1 : -1
    });


    destArray.forEach(
        co => {
            delete co.sortWeight
        }
    );

    return destArray;

    function _resolveRules(rules, destArray) {
        rules.forEach(
            rule => {
                if (rule.comment) {
                    return;
                }
                if (rule.type === 'media' || rule.media) {
                    _resolveRules(rule.rules, destArray)
                } else {
                    var style = {};
                    rule.declarations.forEach(
                        d => {
                            if (d.type === "declaration")
                                style[d.property] = d.value;
                        }
                    )
                    rule.selectors.forEach(
                        s => {

                            s = s.trim();
                            var dumpReg = /[#\.0-9a-zA-Z_\-]+/g;
                            var rArray = [];
                            var result;
                            var lastIndex = -1;

                            while ((result = dumpReg.exec(s))) {
                                if (lastIndex !== -1) {
                                    var spliter = s.substring(lastIndex, result.index);
                                    spliter = spliter.trim();
                                    if (spliter === '') {
                                        spliter = ' ';
                                    }

                                    rArray.push(spliter);

                                }

                                rArray.push(_analysisCssHash(result[0]));
                                lastIndex = result.index + result[0].length;
                            }

                            if (Object.keys(style).length) {
                                destArray.push(
                                    {
                                        route: rArray,
                                        style,
                                        index: destArray.length
                                    });
                            }
                            return;
                        }
                    )
                }
            }
        );
    }
}
