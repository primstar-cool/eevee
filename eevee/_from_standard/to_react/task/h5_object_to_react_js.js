function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}
const genIndent = require("../../../exporter/string_utils/gen_indent.js");
const genDataString = require("../../../exporter/string_utils/gen_data_string_code_style.js");
const genAttrs = require("./gen_utils/gen_attrs.js");
const getObjectDataExpression = require("../../../exporter/string_utils/get_object_data_expression.js");
const genForFunction = require("../../../exporter/string_utils/gen_for_function.js");

module.exports = function standard2react(
    root,
    {
      srcFilePath,
      destFilePath,
      rootSrcPath,
      mainClassName,
      getIncludedStandardTreeFn,
      onFoundImportTemplateFn,
      onFoundEventHandlerFn,
      resolveAssetsPathFn,
      useJsxLib = false, //v17+
      enableIterObject
    } = {}
  ) {

    require("../../to_h5_common/task/standard_to_h5_object.js")(root, 
      {
        srcFilePath,
        destFilePath,
        mainClassName,
        getIncludedStandardTreeFn,
        resolveAssetsPathFn
      }
    );

  const sourceType = root.sourceType;
  if (!rootSrcPath) rootSrcPath = srcFilePath ? require("path").dirname(srcFilePath) : "./";

  const createMappedFunction = require("../../../processor/processor_xml_obj/create_mapped_function.js");
  var {functionArray, referKeys} = createMappedFunction(root, true, true);

  const defineNodeUUID = require("../../../processor/processor_xml_obj/define_node_uuid.js");
  defineNodeUUID(root, '', mainClassName);

  functionArray = functionArray.map(
    s=> `${s.substring(s.indexOf("return", s.indexOf("function (_cONTEXT)")) + 6, s.lastIndexOf(";"))}`.trim()
  );
  // debugger;
  var ifReferArr = [];
  var forFuncObjArr = [];

  let dest;
  
  if (useJsxLib) {
    dest = `function ${mainClassName} (_cONTEXT, _mETHODS, _jsxRuntime) {\n${genIndent(1)}return (0, _jsxRuntime.jsx${referKeys.length ? "" : "s"})("div", {children: [\n`;
  } else {
    dest = `function ${mainClassName} (_cONTEXT, _mETHODS, Rc/*= React.createElement*/) {\n${genIndent(1)}return Rc("div", null, [\n`;
  }
 

  if (root.childNodes) {
    root.childNodes.forEach(
      node => {
        dest += genSubNodeString(node, {sourceType, functionArray, ifReferArr, forFuncObjArr, depth: useJsxLib ? 3 : 2, useJsxLib, enableIterObject});
      }
    )
  }

  if (useJsxLib) {
    dest += genIndent(1) + "]});";
  } else {
    dest += genIndent(1) + "]);";
  }
  


  if (forFuncObjArr.length) {
    dest += `\n\n/*FOR_FUNC_DEFINE*/`;

    if (dest.includes("_getIterMapFunc"))
      dest += `function _getIterMapFunc(obj) {
  if (obj.map) return obj.map;
  else {
    let _ks = Object.keys(obj);
    return (iterFunc) => {
      _ks.map(
        (_k, _idx) => {
          return iterFunc(obj[_k], _k); // same as wxmp
        }
      )
    }
  }
}\n`;

    dest += forFuncObjArr.map((v,i) => {
      if (v) {
        return v.content;
      } else {
        return `\n// _for_map_fn_${i} was ready inlined`
      }
    }).join("");
  }

  if (ifReferArr.length) {
    
    var ifDefine = "";
    for (let i = 0; i < ifReferArr.length; i++) {
      if (ifReferArr[i]) {
        ifDefine += `\n${genIndent(1)}var _if_` + i + ";";
      } else {
        ifDefine += `\n${genIndent(1)}// var _if_` + i + "; // unused var";
        dest = dest.replace(`_if_${i} = `, `/*_if_${i} = */`);
      }

    }

    dest = dest + `\n\n${genIndent(1)}/*IF_VAR_DEFINE*/\n` + ifDefine;
  }
  
  dest += "\n}\n";

  if (dest.includes("parseStyle"))
    dest += `\n/*INJECT parseStyle START*/\n${parseStyle}\n/*INJECT parseStyle END*/\n`;

  return dest;

}

function genSubNodeString(node, {sourceType, functionArray, ifReferArr, forFuncObjArr, styleHolder, depth, ignoreMyNodeLogic = false, isInLoop = false, cssDomain = undefined, useJsxLib, enableIterObject}) {
  
  // if (depth === 4) debugger
  const indent = genIndent(depth);
  

  if (!node.tagName) {
    let dataString = genDataString(node.data, functionArray, false);
    if (dataString === null) return "";
    else return indent + dataString + (dataString.startsWith("/*") ? "\n" : ",\n");
  } else {

    if (!node.attrs) node.attrs = {};

    let ifString = "";
    if (node.logic && !ignoreMyNodeLogic) {


      if (node.logic["for"]) {
        // debugger;
        let forFuncIndex = forFuncObjArr.length;
        forFuncObjArr[forFuncIndex] = (null);
        let forRet = genForFunction(node, forFuncObjArr, forFuncIndex, genSubNodeString, {sourceType, functionArray, ifReferArr, depth, extraConfig: {useJsxLib}, enableIterObject});
       
        var retForString = indent + `${forRet.replace(/\n/g, "\n" + indent)},\n`
      
        return retForString;
      }

      
      if (node.logic["if"]) {
        let curIfIndex = ifReferArr.length;
        let condiString = getObjectDataExpression(node.logic["if"], functionArray);
        node.logic.ifIndex = curIfIndex;

        if (condiString) {
          ifString = `(_if_${curIfIndex} = ${condiString}) && `;
        } else {
          ifString = `(_if_${curIfIndex} = false) && `;
        }
        ifReferArr[curIfIndex] = 0;

      } else if (node.logic["elif"] || node.logic["else"]) {
        
        let parentNode = node.parentNode;
        let myIndex = parentNode.childNodes.indexOf(node);

        let preCondiString = '';
        for (let j = myIndex-1; j >= 0; j-- ) {
          let referNode = parentNode.childNodes[j]
          ASSERT(referNode.logic.hasOwnProperty("ifIndex"));
          preCondiString = `!_if_${referNode.logic.ifIndex} && ` + preCondiString
          ifReferArr[referNode.logic.ifIndex]++;

          if (referNode.logic["if"])
          {
            break;
          }
        }

        let isElseIf = node.logic["elif"];
        if (isElseIf) {
          let curIfIndex = ifReferArr.length;
          condiString = getObjectDataExpression(node.logic["elif"], functionArray);
          node.logic.ifIndex = curIfIndex;
          ifReferArr[curIfIndex] = 0;

          if (condiString) {
            ifString = `${preCondiString}(_if_${curIfIndex} = (${condiString})) && `;
          } else {
            ifString = `${preCondiString}(_if_${curIfIndex} = false) && `;
          }
        } else {
          ifString = `${preCondiString}`;
        }
      }
      
    }

    let classTagName = node.tagName;
    let childIndent = useJsxLib ? `\n${genIndent(depth+1)}` : ''

    let createFuncStatic = useJsxLib ? `(0, _jsxRuntime.jsxs)` : `Rc`;
    let createFuncDyn = useJsxLib ? `(0, _jsxRuntime.jsx)` : `Rc`;
    let childrenPrefix = useJsxLib ? `${childIndent}children: ` : `}, `;
    let childrenEnd = useJsxLib ? `} ` : ``;
    let ret;

    if (!node.childNodes || classTagName === 'img') {
      ret = indent + ifString + `${node.isStatic ? createFuncStatic : createFuncDyn}('${classTagName}', {${genAttrs(node, {sourceType, functionArray, indent: childIndent, useJsxLib, isLeafNode: true})}} ),\n`
    } else if (node.childNodes.length === 1 && !node.childNodes[0].tagName) {
      // if (useJsxLib) debugger
      ret = indent + ifString  + `${node.isStatic ? createFuncStatic : createFuncDyn}('${classTagName}', {${genAttrs(node, {sourceType, functionArray, indent: childIndent, useJsxLib})}${childrenPrefix}${genDataString(node.childNodes[0].data, functionArray, true)}${childrenEnd}),\n`
    }
    else {
      let subString;
      ret = indent + ifString  + `${node.isStatic ? createFuncStatic : createFuncDyn}('${classTagName}', {${genAttrs(node, {sourceType, functionArray, indent: childIndent, useJsxLib})}${childrenPrefix}[\n`
        + (subString = node.childNodes.map(n => genSubNodeString(n, {sourceType, functionArray, ifReferArr, forFuncObjArr, depth: useJsxLib ? depth+2 : depth+1, useJsxLib})).join("")).substring(0, subString.lastIndexOf(","))
        + "\n" + indent + `]${childrenEnd}),\n`;
    }
    
    return ret;

  }
  
}
