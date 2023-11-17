// v =
// {   css: [
//         {
//             route: {id:undefined,classList:[],tag:undefined},
//             style: {},
//             index: 0
//         }
//     ],
//     keyframes: null,
//     mediaFns: null,
// }

function ASSERT (flag, ...args) {
    if (!flag) {
      debugger
      throw new Error(...args);
    }
  }

const analysisCssHash = require("./analysis_css_hash.js");


class CssDomain {
    constructor(v =
        {   css: null,
            keyframes: null,
            mediaFns: null,
        }, parentcssRuleArray = undefined, a_runTimeInfo = undefined) {
        this.cssRuleArray = v ? v.css : null;
        this.computeredClassMap = [
            //TODO optimize
        ]; //静态的样式表 可以事先计算的样式表， 全动态生成也是可以的
        this._runTimeInfo = a_runTimeInfo
        this.keyFramesDict = v ? (v.keyframes||null) : null;
        let mediaFns = v ? v.mediaFns : null;
        
        if (mediaFns) {

            if (this.cssRuleArray)
            this.cssRuleArray.forEach(
                (s, sidx) => {
                    if (s.hasOwnProperty("mediaFnId"))
                    {
                        s.mediaFn = mediaFns[s.mediaFnId];
                        // debugger
                    }
                }
            );
            mediaFns = null;
        }

        /*DEBUG_START*/
        if (this.cssRuleArray && typeof window !== "undefined")
        this.cssRuleArray.forEach(
            (s, sidx) => {
                var str = ("css rule " + sidx  + ": %c" + s.route.map(sv => (typeof(sv) === "string") ? sv : "" + (sv.tag || "") + (sv.classList ? "." + sv.classList.join('.') : "") + (sv.id ? ("#" + sv.id): "")).join('') + ": %O %O")
                console.debug(str , "color: blue", s.style, s.route);
    
            }
        );
        /*DEBUG_END*/
        

    }


    _getClassStlyeByStyleId(styleId) {

        ASSERT(this.computeredClassMap[styleId], "error use api plz use computeStlyeIdByRouteKey first, and cache styleId")
    
        if (this.computeredClassMap[styleId])
            return this.computeredClassMap[styleId].style || {};
    
        return {};
    }
    



    //cssSituasion 打包后也必须 tag.class1.class2#id class1 class2 需要排序
    createEmptyStlyeIdByRouteKey(routeKey) {
        var destStyle = {};
        /*DEBUG_START*/
        destStyle.__routeKey = routeKey;
        /*DEBUG_END*/

        this.computeredClassMap.push(
            { 
                routeKey: routeKey,
                style: destStyle
            }
        );
        return {
            styleId: this.computeredClassMap.length - 1,
            style: destStyle
        }
    }


    // collectCssRuleByParentRouteKey(routeKey) {
    //     var destRules= [];
    //     var cssRuleArray = this.cssRuleArray;

    //     if (cssRuleArray && cssRuleArray.length) {
    //         var arrayRouteString = routeKey.split('>');
    //         var arrayRoute = arrayRouteString.map(cssString => analysisCssHash(cssString));

    //         for (var i = 0; i < cssRuleArray.length; i++) {
    //             var cssObj = cssRuleArray[i];

    //             if (cssObj.mediaFn) {
    //                 if (!cssObj.mediaFn(screenWidth, screenHeight, dpr)) {
    //                     continue;
    //                 }
    //             }
        
    //             var isPesudo = false;
    //             var cssSituasion = cssObj.route;
    //             if (cssSituasion.length === 1) continue;

    //             cssSituasion = cssSituasion.slice(0, cssSituasion.length - 2);
    //             if (cssSituasion.length >= 3) {
    //                 if (cssSituasion[cssSituasion.length - 2].charCodeAt(0) === 58) { //':'.charCodeAt(0)
    //                     isPesudo = true;
    //                 }
    //             }

    //             if (this._fitClassRule(arrayRoute, cssSituasion, isPesudo)) {
    //                 destRules.push(cssObj)
    //             }
    //         }
    //     }
    //     return destRules;
    // }

    collectCssRuleByRouteKey(routeKey) {
        var destRules= [];
        var cssRuleArray = this.cssRuleArray;

        if (cssRuleArray && cssRuleArray.length) {
            var arrayRouteString = routeKey.split('>');
            var arrayRoute = arrayRouteString.map(cssString => analysisCssHash(cssString));

            for (var i = 0; i < cssRuleArray.length; i++) {
                var cssObj = cssRuleArray[i];

                if (cssObj.mediaFn) {
                    if (!cssObj.mediaFn(screenWidth, screenHeight, dpr)) {
                        continue;
                    }
                }
        
                var isPesudo = false;
                var cssSituasion = cssObj.route;
                if (cssSituasion.length >= 3) {
                    if (cssSituasion[cssSituasion.length - 2].charCodeAt(0) === 58) { //':'.charCodeAt(0)
                        isPesudo = true;
                    }
                }

                if (this._fitClassRule(arrayRoute, cssSituasion, isPesudo)) {
                    destRules.push(cssObj)
                }
            }
        }

        return destRules;

    }


    computeStlyeIdByRouteKey(routeKey) {

        var computeredClassMap = this.computeredClassMap;
        var cssRuleArray = this.cssRuleArray;
        
        for (var i = 0; i < computeredClassMap.length; i++) {
            if (computeredClassMap[i].routeKey === routeKey) 
                return i;
        }

        var destStyle = {};

        // if (!routeKey) debugger

        var arrayRouteString = routeKey.split('>');
        var arrayRoute = arrayRouteString.map(cssString => analysisCssHash(cssString));

        if (cssRuleArray && cssRuleArray.length) {

            var screenWidth, screenHeight, dpr;
            if (this._runTimeInfo) {
                screenWidth = this._runTimeInfo.screenWidth;
                screenHeight = this._runTimeInfo.screenHeight;
                dpr = this._runTimeInfo.pixelRatio;
            }   

            for (var i = 0; i < cssRuleArray.length; i++) {
                var cssObj = cssRuleArray[i];

                if (cssObj.mediaFn) {
                    if (!cssObj.mediaFn(screenWidth, screenHeight, dpr)) {
                        continue;
                    }
                }
        
                var isPesudo = false;
                var cssSituasion = cssObj.route;
                if (cssSituasion.length >= 3) {
                    if (cssSituasion[cssSituasion.length - 2].charCodeAt(0) === 58) { //':'.charCodeAt(0)
                        isPesudo = true;
                    }
                }

                if (this._fitClassRule(arrayRoute, cssSituasion, isPesudo)) {

                    if (isPesudo) {
                        var rule = cssSituasion[cssSituasion.length - 1].tag
                        if (rule === 'after' || rule === 'before') {
                            if (!destStyle.pseudoElement) {
                                destStyle.pseudoElement = {};
                            }
                            destStyle.pseudoElement[rule] = cssObj.style;
                        } else {
                            if (!destStyle.pseudo) {
                                destStyle.pseudo = [];
                            }
                            destStyle.pseudo.unshift({rule: rule, style: cssObj.style});
                        }
                        

                    } else {
                        Object.assign(destStyle, cssObj.style);
                    }
                    
                }
            }
        }
    

        if (arrayRoute.length > 1) {
            var inhertPropertyList = this.__inhertPropertyList || [
                "letterSpacing",
                "lineHeight",
                "color",
                "fontFamily",
                "fontSize",
                "fontStyle",
                "fontWeight",
                "textAlign",
                "pointEvents",
        
                //、wordSpacing、whiteSpace、
                // textDecoration、textTransform、direction
            ];
            
            var parentStyle = null;
            for (var i = 0 ; i < inhertPropertyList.length; i++) {
                var ihP = inhertPropertyList[i];
                if (!destStyle[ihP]) {
                    if (!parentStyle) {
                        parentStyle = this._getClassStlyeByStyleId(this.computeStlyeIdByRouteKey(routeKey.substring(0, routeKey.lastIndexOf('>'))));
                    }
                    if (parentStyle[ihP])
                        destStyle[ihP] = parentStyle[ihP];
                }
            }
        }

        /*DEBUG_START*/
        destStyle.__routeKey = routeKey;
        /*DEBUG_END*/


        computeredClassMap.push(
            { 
                routeKey: routeKey,
                style: destStyle
            }
        );
        return computeredClassMap.length - 1;


    }

    computeNodeCssStyleHash(node) {
        var me = this;

        var _classStyleHash = node.tagName;
        if (node.className) {
            var classTrim = node.className.trim();
            /*DEBUG_START*/
            if (classTrim !== node.className) {
                console.warn( "class \"" + node.className + "\" has redundant space")
            }
            /*DEBUG_END*/
            _classStyleHash += classTrim;
            //sort outside? TODO
        }

        if (node.id) {
            _classStyleHash += '#' + node.id;
        }

        ASSERT(!this._classStyleRouteFull)

        return _classStyleHash; //'@ is spec label means the hash was normalized'

    }

    getNodeCssStyle(node) {

        var cssStyle = node.style;
        var me = this;
        if (cssStyle._classStyleId > -1) {
            return me._getClassStlyeByStyleId(cssStyle._classStyleId);
        }

        if (!cssStyle._classStyleHash && node.tagName) {
            cssStyle._classStyleRouteFull = null;
            cssStyle._classStyleHash = me.computeNodeCssStyleHash(node);
        }

        if (!cssStyle._classStyleRouteFull) {

            let parentNode = node.parentNode;

            if (parentNode) {
                ASSERT(parentNode.style._classStyleRouteFull);
                if (!node.isAutoCreateTextNode)
                    cssStyle._classStyleRouteFull = parentNode.style._classStyleRouteFull + ">" + cssStyle._classStyleHash;
                else {

                    cssStyle._classStyleRouteFull =  parentNode.style._classStyleRouteFull + ">" + "text-auto-create";
                    var {style, styleId} = me.createEmptyStlyeIdByRouteKey(cssStyle._classStyleRouteFull);
                    cssStyle._classStyleId = styleId;
                    return style;

                }
                    
            } else {
                if (node.tagName !== null)
                    cssStyle._classStyleRouteFull = cssStyle._classStyleHash;
                else {
                    console.ASSERT(false, 'WFT??');
                    cssStyle._classStyleRouteFull = '@text';
                }
            }
        }


        cssStyle._classStyleId = me.computeStlyeIdByRouteKey(cssStyle._classStyleRouteFull);
        return me._getClassStlyeByStyleId(cssStyle._classStyleId);


    }


    // 返回一个route 是否符合一个css条件
    _fitClassRule(myRouteArray, cssSituasion, isPesudo) {


        var mi = myRouteArray.length - 1;
        var ci = cssSituasion.length - (isPesudo ? 3 : 1);

        
        
        for (;;) {
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
            ASSERT(ci % 2 === 1, 'WTF?');
            if (cssSituasion[ci] === '>') {
                ci--;
                continue;
            } else if (cssSituasion[ci] === ' ') { //递归继承
                for (;;) {
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
                        ASSERT(false, cssSituasion[ci] + 'css sel not support yet');
                    }


                }


            } else {
                ASSERT(false, cssSituasion[ci] + 'css sel not support yet');
            }
        }

        ASSERT(0);
        return false;

        function _fitAPart(myPart, cssSituasion) {
            
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

        }

    }


}

module.exports = CssDomain;

//  module.exports = {
// //     _getClassStlyeByStyleId,
// //     computeStlyeIdByRouteKey,
//     computeNodeCssStyleHash,
//     getNodeCssStyle,
//     setWidgetCssTree,
// }


