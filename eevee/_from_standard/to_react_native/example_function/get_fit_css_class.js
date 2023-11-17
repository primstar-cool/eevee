module.exports = `function getFitCssClass(routeKey: string): string {
    var destRules: string[] = [];
    var cssRuleArray = cssClassDict;

    if (cssRuleArray && cssRuleArray.length) {
        var arrayRouteString = routeKey.split('>');
        var arrayRoute = arrayRouteString.map(cssString => _analysisCssHash(cssString));

        for (var i = 0; i < cssRuleArray.length; i++) {
            var cssObj = cssRuleArray[i];

            // if (cssObj.mediaFn) {
            //     if (!cssObj.mediaFn(screenWidth, screenHeight, dpr)) {
            //         continue;
            //     }
            // }

            var isPesudo = false;
            var cssSituasion = cssObj.route;
            if (cssSituasion.length >= 3) {
                if (cssSituasion[cssSituasion.length - 2].charCodeAt(0) === 58) { //':'.charCodeAt(0)
                    isPesudo = true;
                }
            }

            if (_fitClassRule(arrayRoute, cssSituasion, isPesudo)) {
                destRules.push(cssObj.className)
            }
        }
    }

    destRules.map(flattenCssRuleName).join(' ');
    return complexCssClass;
}

${require("../utils/flatten_css_rule_name.js").toString()}

function _analysisCssHash(cssHash: string): any {
    //必须cssHash tag.class1.class2#id

    var hashIdx = cssHash.indexOf('#');
    var tag;
    var classList;
    var id;

    if (hashIdx !== -1) {
        id = cssHash.substring(hashIdx + 1);
        cssHash = cssHash.substring(0, hashIdx);
    }

    var dotIdx = cssHash.indexOf('.');
    if (dotIdx !== -1) {
        tag = cssHash.substring(0, dotIdx);
        classList = cssHash.substring(dotIdx + 1).split(".");
    } else {
        tag = cssHash;//.substring(1);
    }



    var ret: any = {};

    if (tag) ret.tag = tag;
    if (id) ret.id = id;
    if (classList) ret.classList = classList;

    // console.ASSERT(tag || id || classList, "WTF?!!");
    return ret;
}

// 返回一个route 是否符合一个css条件
function _fitClassRule(myRouteArray: any[], cssSituasion: any[], isPesudo: boolean) {


    var mi = myRouteArray.length - 1;
    var ci = cssSituasion.length - (isPesudo ? 3 : 1);



    for (; ;) {
        if (!_fitAPart(myRouteArray[mi], cssSituasion[ci])) {
            return false;
        } else {
            mi--;
            if (mi < 0 && ci > 0) {
                return false;
            }
        }

        if (ci === 0) {
            return true;
        }

        ci--;
        // console.ASSERT(ci % 2 === 1, 'WTF?');
        if (cssSituasion[ci] === '>') {
            ci--;
            continue;
        } else if (cssSituasion[ci] === ' ') { //递归继承
            for (; ;) {
                ci--;
                var ancestorCssSituasion = cssSituasion[ci];
                for (; mi >= 0;) {
                    if (_fitAPart(myRouteArray[mi], ancestorCssSituasion)) {

                        break;
                    } else {
                        mi--;
                    }
                }

                if (mi < 0) { // 出循环也没找到
                    return false; // 到0都没祖先支持
                } else { // find
                    if (ci === 0) {
                        return true;
                    }
                    mi--; // 消耗掉
                    if (mi < 0 && ci > 0) {
                        return false;
                    }
                }

                ci--;
                if (cssSituasion[ci] === ' ') {
                    continue;
                } else if (cssSituasion[ci] === '>') {
                    ci--;
                    break;
                } else {
                    // console.ASSERT(false, cssSituasion[ci] + 'css sel not support yet');
                }


            }


        } else {
            // console.ASSERT(false, cssSituasion[ci] + 'css sel not support yet');
        }
    }
    // console.ASSERT(0);
}

function _fitAPart(myPart: any, cssSituasion: any): boolean {

    //cssSituasion 打包后也必须 tag.class1.class2#id class1 class2 需要排序
    // myPart 只能比css多不能少

    if (cssSituasion.tag && myPart.tag !== cssSituasion.tag) {
        return false;
    }

    if (cssSituasion.id && myPart.id !== cssSituasion.id) {
        return false;
    }

    if (cssSituasion.classList) {
        var myClassList = myPart.classList;

        if (!myClassList) return false;

        var l = cssSituasion.classList.length;
        for (var i = 0; i < l; i++) {
            if (myClassList.indexOf(cssSituasion.classList[i]) === -1) {
                return false;
            }
        }
    }

    return true;

}`
