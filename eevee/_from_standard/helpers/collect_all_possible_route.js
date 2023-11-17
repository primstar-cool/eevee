module.exports = loopNode;
loopNode._findCondition = _findCondition;
loopNode._genEvalString = _genEvalString;

const javascript = require('../../parser/parse_ast/javascript');

const createMappedFunction = require("../../processor/processor_xml_obj/create_mapped_function.js");
function ASSERT (flag, ...args) {
    if (!flag) {
        debugger
        throw new Error(...args);
    }
}

function loopNode(node, strictMode = true, collectRoute = null) {

    if (!collectRoute) collectRoute = {};

    if (node.isAutoCreateTextNode) return;
    if (node.isAutoCreateBgNode) return;
    if (node.isAutoCreateBorderNode) return;

    ASSERT(node.style || node.data.startsWith("<!--"))
   
    if (node.style && node.style._classStyleRouteFull) {

        if (node.style._classStyleRouteFull.xPath) {
            collectRoute[node.style._classStyleRouteFull.xPath] = node;

        //    if (removeRootClass) console.log(node.style._classStyleRouteFull.xPath)
        } else {


            // if (node.className ==='sub-text') debugger
            //替换三元
            ASSERT(node.style._classStyleRouteFull.xPathObject);
            if (node.style._classStyleRouteFull.xPathObject) {
                let condiArray = [];
                let copyedXPathObject = JSON.parse(JSON.stringify(node.style._classStyleRouteFull.xPathObject)); //deep clone
                _findCondition(copyedXPathObject, condiArray);
                let totalTestNum = Math.pow(2, condiArray.length);
                let eval2 = eval;
                for (let bitI = 0; bitI < totalTestNum; bitI++) {

                    ;
                    for (let boolI = 0; boolI < condiArray.length; boolI++) {
                        condiArray[boolI].test = new javascript.astFactory.Literal((bitI & (1<<boolI)) ? false : true);
                    }

                    let classString;
                    let evalFunc;
                    if (copyedXPathObject._orginalNode) copyedXPathObject = copyedXPathObject._orginalNode;

                    
                    let testStyleString = createMappedFunction.createFunctionStr(copyedXPathObject);
                    try {
                        evalFunc =  _genEvalString(testStyleString);

                        // console.log(evalFunc);

                        classString = eval2(evalFunc);
                    } catch (e) {
                        console.error(evalFunc)
                        if (strictMode) console.error(e);
                        debugger
                    }

                    if (classString) {
                        // if (removeRootClass) console.log(classString);
                        collectRoute[classString] = node;
                    }
                }

            }
    //      else if (node.style._classStyleRouteFull.xPathFunc)            
                // if (removeRootClass) console.log("try generate possiable class of expression: " + node.style._classStyleRouteFull.xPathFunc)
    //             let dumpBoolArr = [];
    //             let regexp = (/_cONTEXT.[\.\d\w_]+ [\?]/g);
    //             for(;;) {
    //                 let dumpBool = regexp.exec(node.style._classStyleRouteFull.xPathFunc);
    //                 if (dumpBool) {
    //                     dumpBoolArr.push(dumpBool[0])
    //                 } else {
    //                     break;
    //                 }
    //             }
    //             let regexp2 = (/\(_cONTEXT.[\.\d\w_\[\]\&\|]+ (===|!==|==|!=|>|>=|<|<=) [^\)^\?]+\) [\?]/g);
    //             for(;;) {
    //                 let dumpBool = regexp2.exec(node.style._classStyleRouteFull.xPathFunc);
    //                 if (dumpBool) {
    //                     dumpBoolArr.push(dumpBool[0])
    //                 } else {
    //                     break;
    //                 }
    //             }
    //             let totalTestNum = Math.pow(2, dumpBoolArr.length);
    //             let eval2 = eval;
    //             for (let bitI = 0; bitI < totalTestNum; bitI++) {
    //                 let testStyleString = node.style._classStyleRouteFull.xPathFunc;
    // ;
    //                 for (let boolI = 0; boolI < dumpBoolArr.length; boolI++) {
    //                     testStyleString = testStyleString.replace(dumpBoolArr[dumpBoolArr.length - 1 - boolI],(bitI & (1<<boolI)) ? 'false ?' : 'true ?' )
    //                 }

    //                 let classString;
    //                 let evalFunc;
    //                 try {
    //                     evalFunc =  `(()=> {
    //                         var _cONTEXT = new Proxy({}, {
    //                             set: function(obj, prop, value) {            
    //                             },        
    //                             get: function(obj, prop) {
    //                             throw new Error("can't determine class name of field 【" + prop + "】");
    //                             return undefined;
    //                             }
    //                         }
    //                         );

    //                         return ${testStyleString}
                            

    //                         function genClassXPath(classString) {
    //                             return classString.trim().split(/[\\s]+/).map(v=>v?"."+v:'').join("");
    //                         }
    //                     })()`;
    //                     // console.log(evalFunc);

    //                     classString = eval2(evalFunc);
    //                 } catch (e) {
    //                     console.error(evalFunc)
    //                     if (removeRootClass) console.error(e);
    //                     debugger
    //                 }
    //                 if (classString) {
    //                     // if (removeRootClass) console.log(classString);
    //                     collectRoute[classString] = {};
    //                 }
    //             }
    //        }

        }
    }

    if (node.childNodes) {
        node.childNodes.forEach(
            node => loopNode(node, strictMode, collectRoute)
        )
    }

    return collectRoute;
}

function _findCondition(obj, arr) {

    if (Array.isArray(obj)) {
        obj.forEach(
            value => {
                if (typeof obj === 'object') 
                {
                    _findCondition(value, arr);
                }
            }
        )

    } else if (typeof obj === 'object') {
        if (obj.type === 'ConditionalExpression') {
            arr.push(obj);
        }
    
        for (var key in obj) {
            let value = obj[key];
            if (typeof value === 'object') {
                _findCondition(value, arr)
            }
        }
    }

   
}

function _genEvalString(testStyleString) {
    testStyleString = testStyleString.substr(testStyleString.indexOf("function (_cONTEXT)")).replace("function (_cONTEXT)", "");

    return `(()=> {
    var _cONTEXT = new Proxy({}, {
        set: function(obj, prop, value) {  

        },        
        get: function(obj, prop) {
            throw new Error("can't determine class name of field 【" + prop + "】");
            return undefined;
        }
    }
    );

    ${testStyleString}
    

    function genClassXPath(classString) {
        return classString.trim().split(/[\\s]+/).map(v=>v?"."+v:'').join("");
    }
})()`.replace(/_cONTEXT\.genClassXPath/g, "genClassXPath");
}