
const _analysisCssHash = require("./analysis_css_hash.js");
module.exports = function sort_css_rules(styleContent) {


    destArray = [];
    if (styleContent.type === "stylesheet") {
        var rules = styleContent.stylesheet.rules;
        _resolveRules(rules, destArray);
    }

    let importStyle = [];
    destArray.forEach(
        co => {
            if (co.style) {
                let styleImportant;

                let keys = Object.keys(co.style);
                let importantKeys = (keys.filter(key => co.style[key].includes("!important")));
                // if (importantKeys.length) debugger
                if (importantKeys.length === 0) return;

                if (importantKeys.length === keys.length) {
                    co.important = true;
                    return;
                }

                styleImportant = {};
                debugger
                importantKeys.forEach(
                    key => {
                        
                        let value = co.style[key];
                        delete co.style[key];
                        styleImportant[key] = value;
      
                    }
                );

                importStyle.push(
                    Object.assign({}, co, {style: styleImportant, important: true})
                )
                // debugger
            }
        }

    )
    destArray = destArray.concat(importStyle);


    destArray.forEach(
        co => {
            var w = 0;

            co.route.forEach(
                cor => {
                    if (co.important) w += 1000000000000;
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
                    // console.log(rule.selectors)


                    if (!Object.keys(style).length) return;

                    rule.selectors.forEach(
                        s => {

                            s = s.trim();
                            var dumpReg = /[#\.0-9a-zA-Z_\(\)\-]+/g;
                            var rArray = [];
                            var result;
                            var lastIndex = -1;

                            if (s.startsWith(":")) {
                                destArray.push(
                                {
                                    route: [
                                        {
                                            pseudo: s
                                        }
                                    ],
                                    style,
                                    index: destArray.length
                                });
                                return;
                            }

                            while ((result = dumpReg.exec(s))) {
                                if (lastIndex !== -1) {
                                    var spliter = s.substring(lastIndex, result.index);
                                    spliter = spliter.trim();
                                    if (spliter === '') {
                                        spliter = ' ';
                                    }
                                    
                                    if (spliter[0] !== ':')
                                        rArray.push(spliter);
                                }

                                if (!spliter || spliter[0] !== ':') {
                                    rArray.push(_analysisCssHash(result[0]));
                                } else {
                                    rArray[rArray.length - 1].pseudo = spliter + result[0];
                                }
                                lastIndex = result.index + result[0].length;
                            }

                            destArray.push(
                            {
                                route: rArray,
                                style,
                                index: destArray.length
                            });
                            // if (rule.selectors.join("").includes(":")) debugger

                        }
                    )
                }
            }
        );
    }
}
