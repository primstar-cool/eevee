const genIndent = require("../../../../exporter/string_utils/gen_indent.js");
const getObjectDataExpression = require("../../../../exporter/string_utils/get_object_data_expression.js");

function ASSERT (flag, ...args) {
  if (!flag) {
      debugger
      throw new Error(...args);
  }
}
module.exports = function genForFunction(node, forFuncObjArr, forFuncIndex, genSubNodeString, { sourceType, functionArray, ifReferArr, depth, inlineThreshold = 50, styleHolder = undefined, cssDomain = undefined, polyFillForIndex = undefined, extraConfig = undefined, enableIterObject = undefined, fns = {} }) {

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

    // debugger

    ifString = getObjectDataExpression(node.logic["if"], functionArray);

    ifIncludeForItem = forItem && ifString.includes(`_cONTEXT[${forItem}]`) || (typeof forItem === 'string' && ifString.includes(`_cONTEXT.${forItem.substring(1, forItem.length - 1)}`));
    ifIncludeForIndex = forIndex && ifString.includes(`_cONTEXT[${forIndex}]`) || (typeof forIndex === 'string' && ifString.includes(`_cONTEXT.${forIndex.substring(1, forIndex.length - 1)}`));


    isTotalIf = !ifIncludeForItem && !ifIncludeForIndex;

    if (!isTotalIf) {
      subIf = ifString;
    }

    if (isTotalIf) {
      isTotalIf = ifString
    }
  }

  ASSERT(!forIndex || useDotMode(forIndex));
  ASSERT(!forItem || useDotMode(forItem));


  let forIndexParsed = (forIndex && useDotMode(forIndex)) ? JSON.parse(forIndex) : null;
  let forItemParsed = (forItem && useDotMode(forItem)) ? JSON.parse(forItem) : null;

  // if (!forItem) debugger


  ASSERT((forItemParsed && (!forIndex || forItemParsed)) || !forItemParsed)

  if (enableIterObject === undefined)
    enableIterObject = (sourceType === "wxmp" || sourceType === "ttma" || sourceType === "ksmp" || sourceType === "swan" || sourceType === "vue");
  if (enableIterObject) {
    retContentStr += `ForEach(wrapObjectToArray(${forMain}),\n${genIndent(1)}`;
  } else {
    retContentStr += `ForEach(${forMain},\n${genIndent(1)}`;
  }

  let funcParamsString = "(";
  let funcParamsTypeString = "(";
  if (forItem) {
    funcParamsString += `${forItemParsed}`;
    funcParamsTypeString += `${forItemParsed}: any`;
    if (forIndex) {
      funcParamsString += `, ${forIndexParsed})`;
      funcParamsTypeString += `, ${forIndexParsed}: number)`;
    } else {
      funcParamsString += ")"
      funcParamsTypeString += ")"
    }
  } else {
    funcParamsString += ")";
    funcParamsTypeString += ")";
  }

  retContentStr += `this._for_map_fn_${forFuncIndex}`;


  if (node.logic.key) {
    let keyContent = getObjectDataExpression(node.logic["key"], functionArray);

    let keyContent2 = replaceContextToParam(keyContent, forItemParsed, forIndexParsed);

    if (forIndex && keyContent.includes(`_cONTEXT[${forIndex}]`) || keyContent.includes(`_cONTEXT.${forIndexParsed}`)) {
      retContentStr += `,\n${genIndent(1)}${funcParamsString} => (${keyContent2})\n)`
    } else {
      retContentStr += `,\n${genIndent(1)}(${forItemParsed}) => (${keyContent2})\n)`
    }

  } else {
    retContentStr += "\n)"
  }



  forFuncObjArr[forFuncIndex] = {
    content: replaceContextToParam(`
@Builder _for_map_fn_${forFuncIndex}${funcParamsTypeString} {
${genIndent(2)}/*return*/ ${subIf ? `if (${subIf}) {` : ""}\n${genIndent(subIf ? 3 : 2)}${genSubNodeString(node, Object.assign({ sourceType, functionArray, ifReferArr, forFuncObjArr, depth: subIf ? 3 : 2, styleHolder, ignoreMyNodeLogic: true, cssDomain, enableIterObject, fns }, extraConfig || {})).trim()}${subIf ? `\n${genIndent(2)}}` : ``}
/*ends of _for_map_fn_${forFuncIndex}*/
}`, forItemParsed, forIndexParsed), forFuncIndex, forDepth: myForDepth, forItem, forIndex
  };

  let hasSubFunc = replaceSubFunc(forFuncObjArr, forFuncIndex);

  // if (subForStr) {
  //     forFuncObjArr[forFuncIndex].content = 
  //     forFuncObjArr[forFuncIndex].content.replace(
  //     `/*ends of _for_map_fn_${forFuncIndex}*/`, 
  //     `/*ends of _for_map_fn_${forFuncIndex}*/${subForStr.replace(/\n/g, `\n${genIndent(1)}`,)}`
  //     )
  // }







  if (/*!hasSubFunc &&*/ forFuncObjArr[forFuncIndex].content.split("\n").length <= inlineThreshold) {// inline for func
    // debugger

    if (enableIterObject && (forItemParsed || forIndexParsed)) {

      let content = forFuncObjArr[forFuncIndex].content;

      content = content.replace(
        new RegExp(`_cONTEXT\\.${forItemParsed}`, "g"), "_iterItem._item"
      );

      if (forIndexParsed) {
        content = content.replace(
          new RegExp(`_cONTEXT\\.${forIndexParsed}`, "g"), "_iterItem._index"
        );
      }


      retContentStr = retContentStr.replace(`this._for_map_fn_${forFuncIndex}`,
        `(_iterItem) => {\n${genIndent(2)}` + forFuncObjArr[forFuncIndex].content.substring(
          forFuncObjArr[forFuncIndex].content.indexOf(`/*return*/ `) + 11,
          forFuncObjArr[forFuncIndex].content.indexOf(`/*ends of _for_map_fn_${forFuncIndex}*/`)
        ).trim().replace(/\n/g, `\n${genIndent(2)}`)
        + `\n${genIndent(1)}}`
      )
    } else {

      let content = forFuncObjArr[forFuncIndex].content;

      retContentStr = retContentStr.replace(`this._for_map_fn_${forFuncIndex}`,
        funcParamsString + " => {\n" + genIndent(2) + content.substring(
          content.indexOf(`/*return*/ `) + 11,
          content.indexOf(`/*ends of _for_map_fn_${forFuncIndex}*/`)
        ).trim()// .replace(/\n/g, `\n${genIndent(1)}`)
        + `\n${genIndent(1)}}`
      )
    }

    forFuncObjArr[forFuncIndex] = null;
  }

  forFuncObjArr._forDepth--;

  if (isTotalIf) {
    retContentStr = `if (${ifString}) {\n${genIndent(1)}`
      + retContentStr.replace(/\n/g, `\n${genIndent(1)}`)
      + `\n}`

  }

  return retContentStr;



}

function replaceSubFunc(forFuncObjArr, forFuncIndex) {
  let hasSubFunc = 0;
  const myFuncObj = forFuncObjArr[forFuncIndex];
  const myForDepth = myFuncObj.forDepth;

  let forItemParsed = myFuncObj.forItem ? JSON.parse(myFuncObj.forItem) : undefined;
  let forIndexParsed = myFuncObj.forIndex ? JSON.parse(myFuncObj.forIndex) : undefined;
  
  for (let i = forFuncIndex + 1; i < forFuncObjArr.length; i++) {

    let subFuncObj = forFuncObjArr[i];

    if (subFuncObj && subFuncObj.forDepth >= myForDepth + 1) {
      // let subDepth = subFuncObj.forDepth - myForDepth;
      // debugger
      let subForFuncIndex = forFuncObjArr[i].forFuncIndex;
      if (myFuncObj.content.includes(`this._for_map_fn_${subForFuncIndex}`)) {
        hasSubFunc++;
        // let prefix = "";
        // while (prefix.length < subDepth) { prefix += '_'; }

        let newItemName = subFuncObj.forItem ? JSON.parse(subFuncObj.forItem) : "item";
        let newIndexName = subFuncObj.forIndex ? JSON.parse(subFuncObj.forIndex) : "index";

        let myForItemParsed = forItemParsed || null;
        let myForIndexParsed = forIndexParsed || NaN;

        

        if (myForItemParsed === newItemName || myForItemParsed === newIndexName) {
          myForItemParsed = `/*conflict ${myForItemParsed}*/null`
        }

        if (myForIndexParsed === newItemName || myForIndexParsed === newIndexName) {
          myForIndexParsed = `/*conflict ${myForIndexParsed}*/-1`
        }
        
        if (!myFuncObj.content.includes(`/*return*/this._for_map_fn_${subForFuncIndex}`)) {

          let destText = `(${newItemName}, ${newIndexName}) => {/*return*/this._for_map_fn_${subForFuncIndex}(${newItemName}, ${newIndexName}, ${myForItemParsed}, ${myForIndexParsed})}`

          myFuncObj.content = myFuncObj.content.replace(
            `this._for_map_fn_${subForFuncIndex}`, destText
          );
        } else {
          let subFuncCallStarter = `/*return*/this._for_map_fn_${subForFuncIndex}(`;
          let callParamsStart = myFuncObj.content.indexOf(subFuncCallStarter);
          ASSERT(callParamsStart !== -1);
          let callParamsEnd = myFuncObj.content.indexOf(`)`, callParamsStart);
          let callParams = myFuncObj.content.substring(callParamsStart + subFuncCallStarter.length, callParamsEnd);
          let callParamsArray = callParams.split(",").map(v => v.trim());
          

          let myFuncDefineStarter = `_for_map_fn_${forFuncIndex}(`;
          let defineParamsStart = myFuncObj.content.indexOf(myFuncDefineStarter);
          ASSERT(defineParamsStart !== -1);
          let defineParamsEnd = myFuncObj.content.indexOf(`)`, defineParamsStart);
          let defineParams = myFuncObj.content.substring(defineParamsStart + myFuncDefineStarter.length, defineParamsEnd);
          let myParamsArray = defineParams.split(",").map(v => v.split(":")[0].trim());
          
          ASSERT(myParamsArray.length === callParamsArray.length);
          ASSERT(myParamsArray.slice(0, -2).join("@") === callParamsArray.slice(2).join("@")
          || (myParamsArray.slice(0, -4).join("@") === callParamsArray.slice(4).join("@") && callParamsArray.slice(-2).join("").includes("/*conflict i")) 
          );


          let myParamsAddItem = myParamsArray[myParamsArray.length - 2];
          let myParamsAddIndex = myParamsArray[myParamsArray.length - 1];
          

          callParamsArray.push(!callParamsArray.includes(myParamsAddItem) ? myParamsAddItem : `/*conflict ${myParamsAddItem}*/null`);
          callParamsArray.push(!callParamsArray.includes(myParamsAddIndex) ? myParamsAddIndex : `/*conflict ${myParamsAddIndex}*/-1`);


          // debugger
          // let destText = `(${newItemName}, ${newIndexName}) => {/*return*/this._for_map_fn_${subForFuncIndex}(${newItemName}, ${newIndexName}, ${myForItemParsed}, ${myForIndexParsed})}`

          myFuncObj.content = myFuncObj.content.substring(0, callParamsStart + subFuncCallStarter.length) + callParamsArray.join(", ") + myFuncObj.content.substring(callParamsEnd) 
        }

        // debugger
        let subFuncDefineStarter = `_for_map_fn_${subForFuncIndex}(`;
        let paramsStart = subFuncObj.content.indexOf(subFuncDefineStarter);
        ASSERT(paramsStart !== -1);
        let paramsEnd = subFuncObj.content.indexOf(`)`, paramsStart);
        let params = subFuncObj.content.substring(paramsStart + subFuncDefineStarter.length, paramsEnd);
        let paramsArray = params.split(",").map(v => v.trim());

        if (paramsArray.length % 2) {
          ASSERT(paramsArray.length === 1);
          paramsArray.push("_unusedIndex0: number");
        }

        let paramsCheckArray = paramsArray.map(v=>v.split(":")[0].trim());
        let anonyIndex = (paramsCheckArray.length >> 1);
        paramsArray.push(!paramsCheckArray.includes(forItemParsed) ? forItemParsed + ": any"  : `/*conflict ${forItemParsed}*/_unusedItem${anonyIndex}: any`);
        paramsArray.push(!paramsCheckArray.includes(forIndexParsed) ? (isNaN(forIndexParsed) ? `_undefIndex${anonyIndex}` : forIndexParsed) + ": number"  : `/*conflict ${forIndexParsed}*/_unusedIndex${anonyIndex}: number`);


        subFuncObj.content = subFuncObj.content.replace(params, paramsArray.join(", "));
        // debugger
        replaceSubFunc(forFuncObjArr, subFuncObj.forFuncIndex)
      }

    }
  }

  return hasSubFunc;
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