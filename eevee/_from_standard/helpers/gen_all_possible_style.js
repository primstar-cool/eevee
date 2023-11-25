module.exports = function genAllPossibleStyle(standardNode, cssDomain, removeRootClass = true, ignoreCssPatch = true) {

    const fs = require("fs");

    let collectRoute = require("./collect_all_possible_route.js")(standardNode, removeRootClass);
    let collectRouteStyle = {};

    if (removeRootClass) {
        delete collectRoute[standardNode.style._classStyleRouteFull.xPath];
    }


    if (cssDomain) {

        for (let key in collectRoute) {
            let fakeNode = Object.assign({}, collectRoute[key], {childNodes: null});
            // debugger

            // if (key.includes("#bottom-info")) debugger

            fakeNode.style = Object.assign({}, fakeNode.style, {_classStyleRouteFull: key});

            let cssData = cssDomain.getNodeCssStyle(fakeNode);
            collectRouteStyle[key] =  cssData;
        }

        
        if (!ignoreCssPatch && cssDomain._cssPatchs) {
            debugger
            cssDomain._cssPatchs.forEach(
                v=> {
                    for (let pk in v.patch) {
                        if (v.patch[pk] === undefined) {
                            delete collectRouteStyle[v.route][pk]
                        } else {
                            collectRouteStyle[v.route][pk] = v.patch[pk]
                        }
                    }
                }
            )
        }
    }

    return collectRouteStyle;
}

