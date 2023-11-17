const getObjectDataExpression = require("./get_object_data_expression.js");
const genIndent = require("./gen_indent.js");
function ASSERT(flag, ...args) {
    if (!flag) throw new Error(...args)
  }

module.exports = function genForFunction(node, forFuncObjArr, forFuncIndex, genSubNodeString, {sourceType, functionArray, ifReferArr, depth, inlineThreshold = 15, styleHolder = undefined, cssDomain = undefined, polyFillForIndex = undefined, extraConfig = undefined, enableIterObject = undefined}) {
    // inlineThreshold = 1;

if (!forFuncObjArr._forDepth) forFuncObjArr._forDepth = 1;
else forFuncObjArr._forDepth++;

let myForDepth = forFuncObjArr._forDepth;
let retContentStr = '';
// debugger
let ifString;
let forMain = getObjectDataExpression(node.logic["for"], functionArray);
let forItem = node.logic["for-item"] && getObjectDataExpression(node.logic["for-item"], functionArray);


let forIndex = node.logic["for-index"] && getObjectDataExpression(node.logic["for-index"], functionArray);

if (polyFillForIndex === undefined) {
    polyFillForIndex = !node.logic.key;
}

if (polyFillForIndex && !node.logic["for-index"]) {
    polyFillForIndex = "\"__index\"";
}

let subIf = "";
let isTotalIf;
let ifIncludeForItem;
let ifIncludeForIndex;

if (node.logic["if"]) {

    ifString = getObjectDataExpression(node.logic["if"], functionArray);

    ifIncludeForItem = forItem && ifString.includes(`_cONTEXT[${forItem}]`) || (typeof forItem === 'string' && ifString.includes(`_cONTEXT.${forItem.substring(1, forItem.length - 1)}`));
    ifIncludeForIndex = forIndex && ifString.includes(`_cONTEXT[${forIndex}]`) || (typeof forIndex === 'string' && ifString.includes(`_cONTEXT.${forIndex.substring(1, forIndex.length - 1)}`));

    isTotalIf = !ifIncludeForItem && !ifIncludeForIndex;

    if (!isTotalIf) {
        subIf = ifString;
    }

    if (isTotalIf) {
        retContentStr = `(${ifString}) && `
    }
}

let forIndexParsed = (forIndex && useDotMode(forIndex)) ? JSON.parse(forIndex) : null;
let forItemParsed = (forItem && useDotMode(forItem)) ? JSON.parse(forItem) : null;

// if (!forItem) debugger


ASSERT((forItemParsed && (!forIndex || forItemParsed)) || !forItemParsed)

if (enableIterObject === undefined)
  enableIterObject = (sourceType === "wxmp" || sourceType === "ttma" || sourceType === "ksmp" || sourceType === "swan" || sourceType === "vue");

  if (enableIterObject) {
    retContentStr += `_getIterMapFunc(${forMain})(`;
} else {
    retContentStr += `(${forMain}).map(`;
}

let funcParamsString = "(";
if (forItem) {
  funcParamsString += `${forItemParsed}`;
    if (forIndex) {
      funcParamsString += `, ${forIndexParsed})`;
    } else {
      funcParamsString += ")"
    }
} else {
  funcParamsString += ")"
}
// retContentStr += funcParamsString;


retContentStr += `_for_map_fn_${forFuncIndex})`;

forFuncObjArr[forFuncIndex] = {content : `
function _for_map_fn_${forFuncIndex}${funcParamsString} {
${genIndent(1)}return (${subIf ? `${subIf} && (` : ""}\n${genIndent(2)}${removeLastComma(genSubNodeString(node, Object.assign({sourceType, functionArray, ifReferArr, forFuncObjArr, depth: 2, styleHolder, ignoreMyNodeLogic: true, cssDomain}, extraConfig||{}))).trim()}${subIf ? `\n${genIndent(2)})\n${genIndent(1)})` : `\n${genIndent(1)})`}
/*ends of _for_map_fn_${forFuncIndex}*/
}`, forDepth: myForDepth};

let subForStr = "";

for (let i = forFuncIndex + 1; i < forFuncObjArr.length; i++) {
    if (forFuncObjArr[i] && forFuncObjArr[i].forDepth === myForDepth + 1) {
    subForStr += "\n"+forFuncObjArr[i].content;
    forFuncObjArr[i] = null;
    }
}

if (subForStr) {
    forFuncObjArr[forFuncIndex].content = 
    forFuncObjArr[forFuncIndex].content.replace(
    `/*ends of _for_map_fn_${forFuncIndex}*/`, 
    `/*ends of _for_map_fn_${forFuncIndex}*/${subForStr.replace(/\n/g, `\n${genIndent(1)}`,)}`
    )
}

forFuncObjArr[forFuncIndex].content = replaceContextToParam(forFuncObjArr[forFuncIndex].content, forItemParsed, forIndexParsed);



if (!subForStr && forFuncObjArr[forFuncIndex].content.split("\n").length <= inlineThreshold) {// inline for func
    // debugger
    retContentStr = retContentStr.replace(`_for_map_fn_${forFuncIndex}`, 
    funcParamsString + " => " + (forFuncObjArr[forFuncIndex].content.substring(
        forFuncObjArr[forFuncIndex].content.indexOf(`return `) + 7,
        forFuncObjArr[forFuncIndex].content.indexOf(`/*ends of _for_map_fn_${forFuncIndex}*/`)
    ))
    )
    forFuncObjArr[forFuncIndex] = null;
}

forFuncObjArr._forDepth--;
return retContentStr;
  

  
} 

function useDotMode(str) {
    // debugger
    if (!str) debugger;

    return str[0] === '"' && str[str.length - 1] === '"' && str.match(/[a-zA-Z_][a-zA-Z0-9_]*/)
}

function replaceContextToParam(content, forItemParsed, forIndexParsed) {
    content = content.replace(
        new RegExp(`_cONTEXT\\.${forItemParsed}`, "g"), forItemParsed
    );

    if (forIndexParsed) {
        content = content.replace(
            new RegExp(`_cONTEXT\\.${forIndexParsed}`, "g"), forIndexParsed
        );
    }

    return content
}

function removeLastComma(content) {
    // debugger
    let tContent = content.trim();

    while(tContent[0] === '(' && tContent[tContent.length-1] === ')') {
        tContent = tContent.slice(1,-1);

        tContent = tContent.trim();
    }

    if (tContent[tContent.length-1] === ',') {
        let lastCommaIndex = content.lastIndexOf(",");
        return content.substring(0, lastCommaIndex) + content.substring(lastCommaIndex + 1);
    }

    return content;
}