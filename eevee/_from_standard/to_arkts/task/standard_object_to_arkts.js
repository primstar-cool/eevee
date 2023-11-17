
function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}
const genIndent = require("../../../exporter/string_utils/gen_indent.js");
const genDataString = require("../../../exporter/string_utils/gen_data_string_code_style.js");
const genParams = require("./gen_utils/gen_params.js");
const genTails = require("./gen_utils/gen_tails.js");
const genNodeCssXPathName = require("../../helpers/gen_node_css_xpath_name.js");

const getObjectDataExpression = require("../../../exporter/string_utils/get_object_data_expression.js");
const genForFunction = require("./gen_utils/gen_for_function.js");
let defaultFlexDisplay; 

module.exports = function standard2arkts(
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
      cssDomain,
      enableIterObject
    } = {}
  ) {

    const resolveInclude = require("../../helpers/resolve_include.js");
    resolveInclude(root, {
      srcFilePath,
      destFilePath,
      rootSrcPath,
      getIncludedStandardTreeFn,
      onFoundImportTemplateFn,
      inlineInclude: true
    });

  const sourceType = root.sourceType;
  defaultFlexDisplay = sourceType === 'react_native';

  if (!rootSrcPath) rootSrcPath = srcFilePath ? require("path").dirname(srcFilePath) : "./";

  const createMappedFunction = require("../../../processor/processor_xml_obj/create_mapped_function.js");
  var {functionArray, referKeys} = createMappedFunction(root, true, false, true);

  const defineNodeUUID = require("../../../processor/processor_xml_obj/define_node_uuid.js");
  defineNodeUUID(root, '', mainClassName);

  functionArray = functionArray.map(
    s=> `${s.substring(s.indexOf("return", s.indexOf("function (_cONTEXT)")) + 6, s.lastIndexOf(";"))}`
    // .replace(/_cONTEXT\./g, 'this.')
    .trim()
  );
  // debugger;
  var ifReferArr = [];
  var forFuncObjArr = [];
  var styleHolder = { index: 0 };

  let dest;

  root.tagName = "@" + (mainClassName || '')
  root.style = {
    _classStyleRouteFull: {
      isStatic: true,
      xPath: root.tagName,
    },
    _tmpStyleId: styleHolder.index++,
  }
    
  dest = `Column() {\n`
  if (root.childNodes) {
    if (root.childNodes.length === 1) dest = `\n`;

    root._uuid = JSON.stringify(root.tagName)
    root.childNodes.forEach(
      (node, idx) => {
          dest += genIndent(1) + genSubNodeString(node, {sourceType, functionArray, ifReferArr, forFuncObjArr, depth: 1, styleHolder, cssDomain, enableIterObject}).trim();
          dest += (root.childNodes.length > 1 ? '\n' : '\n');
      }
    )
    
  }

  dest += (root.childNodes && root.childNodes.length === 1) ? `\n` : "}\n";


  let destFunction = "";
  if (forFuncObjArr.length) {
    destFunction += `\n\n/*FOR_FUNC_DEFINE*/`;

    destFunction += forFuncObjArr.map((v,i) => {
      if (v) {
        return v.content;
      } else {
        return `\n// _for_map_fn_${i} was ready inlined`
      }
    }).join("");
  }

  // let textChecker = dest + forFuncObjArr.join("\n");
  // debugger
  // if (styleHolder.index) {
  //   let needStyleArr = [];
  //   dest += `\n\n/*STYLE_TMP_DEFINE*/`;

  //   for (let i = 0; i < styleHolder.index; i++) {
  //     //getAutoBgStyle(_styleTmp_${i})
  //     //getAutoTextStyle(_styleTmp_${i})
  //     //getAutoBorderStyle(_styleTmp_${i},

  //     if (dest.includes(`Style(_styleTmp_${i}`)) {
  //       needStyleArr.push(i);
  //       dest = dest + "\nvar _styleTmp_" + i + ";"
  //     } else {
  //       dest = dest.replace(`_styleTmp_${i} = `, `/*_styleTmp_${i} = */`) + "\n// var _styleTmp_" + i + "; // unused var"
  //     }
  //   }
  // }


  // if (ifReferArr.length) {

  //   var ifDefine = "";
  //   for (let i = 0; i < ifReferArr.length; i++) {
  //     if (ifReferArr[i]) {
  //       ifDefine += `\nvar _if_` + i + ";";
  //     } else {
  //       ifDefine += `\n// var _if_` + i + "; // unused var";
  //       dest = dest.replace(`_if_${i} = `, `/*_if_${i} = */`);
  //     }

  //   }

  //   dest = dest + "\n\n/*IF_VAR_DEFINE*/\n" + ifDefine;

  // }

  // if (dest.includes("parseStyle"))
  //    dest += `\n/*INJECT parseStyle START*/\n${parseStyle}\n/*INJECT parseStyle END*/\n`;

  return {main: dest.replace(/_cONTEXT\./g, 'this.'), member: destFunction};

}

function genSubNodeString(node, {sourceType, functionArray, ifReferArr, forFuncObjArr, depth, styleHolder, cssDomain, ignoreMyNodeLogic = false, enableIterObject}) {
  
  let indent = genIndent(depth);
  let indent_1 = indent + genIndent(1);
  let indent_2 = indent_1 + genIndent(1);

  let parentStyleString;
  ASSERT(node.parentNode.style && node.parentNode.style._tmpStyleId >= 0);
  parentStyleString = `_styleTmp_${node.parentNode.style._tmpStyleId}`


  // debugger
  if (!node.tagName) {

    let dataString = genDataString(node.data, functionArray);
    if (dataString === null) return "";
  
    if (dataString.startsWith("/*")) {
      ret = indent + `${dataString}\n`
    } else {
      node.isAutoCreateTextNode = 1;
      ASSERT(node.parentNode.tagName !== 'text' && node.parentNode.tagName !== 'span', 'not support multi untag text yet');
      ASSERT(parentStyleString && !node.attrs && Object.keys(node.logic||{}).length <= 1);
      // style={backgroundColor:transparent;padding:0;margin:0},

      // let parentAttrInfo = genAttrs(node.parentNode, functionArray, styleHolder, cssDomain, sourceType);

      // let classAttr = "";
      // if (parentAttrInfo.includes(`className="`)) {
      //   let startIndex = parentAttrInfo.indexOf(`className="`)
      //   classAttr = parentAttrInfo.substring(startIndex, parentAttrInfo.indexOf(`"`, startIndex + 11) + 1);
      // } else if (parentAttrInfo.includes(`className={`)) {
      //   let startIndex = parentAttrInfo.indexOf(`className={`);
      //   let endIndex;
      //   let num = 1;
      //   for (let ii = startIndex + 11; ii < parentAttrInfo.length; ii++) {
      //     let c = parentAttrInfop[ii];
      //     if (c === "{") num++;
      //     if (c === "}") {
      //       num--;
      //       if (num === 0) {
      //         endIndex = ii+1;
      //         break;
      //       }
      //     }
      //   }
      //   classAttr = parentAttrInfo.substring(startIndex, endIndex);
      // } 

      // let styleAttr = "";
      // if (parentAttrInfo.includes(`style="`)) {
      //   let startIndex = parentAttrInfo.indexOf(`style="`)
      //   styleAttr = parentAttrInfo.substring(startIndex, parentAttrInfo.indexOf(`"`, startIndex + 7));
      //   styleAttr = JSON.parse(styleAttr);
      // } else if (parentAttrInfo.includes(`style={`)) {
      //   let startIndex = parentAttrInfo.indexOf(`style={`);
      //   let endIndex;
      //   let num = 1;
      //   for (let ii = startIndex + 7; ii < parentAttrInfo.length; ii++) {
      //     let c = parentAttrInfop[ii];
      //     if (c === "{") num++;
      //     if (c === "}") {
      //       num--;
      //       if (num === 0) {
      //         endIndex = ii;
      //         break;
      //       }
      //     }
      //   }
      //   styleAttr = parentAttrInfo.substring(startIndex + 7, endIndex);
      // } 

       ret = indent + (`Text(${genParams(node, "Text", functionArray, styleHolder, cssDomain, sourceType)})` + "\n");
    }
    return ret;
  } else {

    if (!node.attrs) node.attrs = {};

    let ifString = "";
    let ifStringEnd = "";
    if (node.logic && !ignoreMyNodeLogic) {


      if (node.logic["for"]) {
        // debugger;
        let forFuncIndex = forFuncObjArr.length;
        forFuncObjArr[forFuncIndex] = (null);
        let forRet = genForFunction(node, forFuncObjArr, forFuncIndex, genSubNodeString, {sourceType, functionArray, ifReferArr, depth, styleHolder, cssDomain, enableIterObject});
        var retForString = indent + `${forRet.replace(/\n/g, "\n" + indent)}\n`

        ASSERT(node.style)
        return retForString;
      }

      
      if (node.logic["if"]) {
        let curIfIndex = ifReferArr.length;
        let condiString = getObjectDataExpression(node.logic["if"], functionArray);
        node.logic.ifIndex = curIfIndex;

        if (condiString) {
          ifString = `if (${condiString}) {\n${indent_1}`;
        } else {
          ifString = `if (0) {\n${indent_1}`;
        }
        ifReferArr[curIfIndex] = 0;

      } else if (node.logic["elif"] || node.logic["else"]) {
        

        let isElseIf = node.logic["elif"];
        if (isElseIf) {
          let curIfIndex = ifReferArr.length;
          condiString = getObjectDataExpression(node.logic["elif"], functionArray);
          node.logic.ifIndex = curIfIndex;
          ifReferArr[curIfIndex] = 0;

          if (condiString) {
            ifString = `else if (${condiString}) {\n${indent_1}`;
          } else {
            ifString = `else if (0) {\n${indent_1}`;
          }
        } else {
          ifString = `else {\n${indent_1}`;
        }
      }

      if (ifString) {
        ifStringEnd = `\n${indent}}`;
      }
    }
    
    let destClassTagName = {
      view: "Flex",
      text: "Text",
      image: "Image",
      div: "Flex",
      span: "Text",
      img: "Image",
    }[node.tagName];

    ASSERT(destClassTagName);
  
    if (node.tagName === 'span') {
      if (node.childNodes && node.childNodes.length == 1 && node.childNodes[0] && !node.childNodes[0].tagName) {
        destClassTagName = 'Text'
      }
    }

   
    const newLineIndent = ifString ? indent_1 : indent;
    // const newLineIndent_1 = genIndent(1) + newLineIndent;

    // if (destClassTagName === "XImageView") debugger

    if (destClassTagName === "Text") {
      // genAttrs(node, functionArray, styleHolder, cssDomain, sourceType);
    } else if (destClassTagName === "Flex") {
      // debugger
      genNodeCssXPathName(node, functionArray, styleHolder);
      let classDict = require("../../helpers/gen_all_possible_style.js")(Object.assign({}, node, { childNodes: null }), cssDomain, false, true);

      let allClassNames = Object.keys(classDict)
      let cssClassStyle = {};
      
      if (allClassNames.length) {
        if (allClassNames.length === 1) {
          cssClassStyle = classDict[Object.keys(classDict)[0]];
        } else {
          let allClasses = allClassNames.map(n => classDict[n]);

          cssClassStyle = Object.assign({}, allClasses[0]);

          for (let i = 1; i < allClasses.length; i++) {
            let newV = allClasses[i];
            Object.keys(cssClassStyle).forEach(
              key => {
                if (cssClassStyle[key] !== newV[key])
                  delete cssClassStyle[key];
              }
            )
          }
          // debugger
  
        }
      }
      

      if (cssClassStyle.display === 'flex' // 弹性布局
        || defaultFlexDisplay
      ) {
        if (cssClassStyle["flex-direction"] === "column" || cssClassStyle["flex-direction"] === "column-reverse") {
          destClassTagName = 'Column';
        } else {
          destClassTagName = 'Row';
        }
      } else {
        // debugger
        if (!node.childNodes || !node.childNodes.length) {
          destClassTagName = 'Row';
        }
      }
      
      

      // debugger
      //genAttrs(node, functionArray, styleHolder, cssDomain, sourceType);
      // var {bgNode} = require("./spec_hotfix/insert_bg_border_node.js")(node, cssDomain);
      // debugger
    }

    const _isLeafNode = (!node.childNodes || node.childNodes.length === 0); //色块 图片 等等
    const _isOnlyTextNode = node.childNodes && node.childNodes.length === 1 && !node.childNodes[0].tagName && (destClassTagName === 'Text' || !(node.logic && node.logic["for"]))

    // debugger
    if (_isLeafNode) {
      
      if (node.isAutoCreateBorderNode) {
        debugger
        ASSERT(false, 'not support yet!')
        ASSERT(!ifString && !bgNode);
        // let borderFlag = node.borderFlag;
        // if (borderFlag)
        //   ret = indent + `<View /*autoBorder="1"*/ style={getAutoBorderStyle(${parentStyleString}, 0)}>`
        // if (borderFlag & 1)
        //   ret += "\n" + indent + `  {${parentStyleString}.borderTopWidth    && <View /*autoBorder="1.1"*/ style={getAutoBorderStyle(${parentStyleString}, 1)}/>}`
        // if (borderFlag & 2)
        //   ret += "\n" + indent + `  {${parentStyleString}.borderRightWidth  && <View /*autoBorder="1.2"*/ style={getAutoBorderStyle(${parentStyleString}, 2)}/>}`
        // if (borderFlag & 4)
        //   ret += "\n" + indent + `  {${parentStyleString}.borderBottomWidth && <View /*autoBorder="1.4"*/ style={getAutoBorderStyle(${parentStyleString}, 4)}/>}`
        // if (borderFlag & 8)
        //   ret += "\n" + indent + `  {${parentStyleString}.borderLeftWidth   && <View /*autoBorder="1.8"*/ style={getAutoBorderStyle(${parentStyleString}, 8)}/>}`

        // if (borderFlag)
        //   ret += "\n" + indent + `</View>\n`

      } else {
        // debugger
        ret = `${indent}${ifString}${destClassTagName}(${genParams(node, destClassTagName, functionArray, styleHolder, cssDomain, sourceType)})${genTails(node, functionArray, styleHolder, cssDomain, sourceType).join(`\n${newLineIndent}`)}${ifStringEnd}\n`;
      }

      ASSERT(node.style)
      return ret;

    } else if (_isOnlyTextNode) {
      // debugger
      // let dataString = genDataString(node.childNodes[0].data, functionArray, true);
      // if (dataString.startsWith("\"")) {
      //   dataString = JSON.parse(dataString);
      //   if (!encodeURIComponent(dataString) === dataString) { //no spec char
      //     dataString = '{' + JSON.stringify(dataString) + '}'
      //   }
      // } else {
      //   dataString = '{' + dataString + '}'
      // }
      // debugger
      if (destClassTagName === 'Text') {
        ret = `${indent}${ifString}Text(${genParams(node, destClassTagName, functionArray, styleHolder, cssDomain, sourceType)})${genTails(node, functionArray, styleHolder, cssDomain, sourceType).join("")}${ifStringEnd}\n`;
        node.childNodes[0].style = node.style;
      }
      else {
        debugger
        let tails = genTails(node, functionArray, styleHolder, cssDomain, sourceType);
        ret = `${indent}${ifString}${destClassTagName}(${genParams(node, destClassTagName, functionArray, styleHolder, cssDomain, sourceType)}) {\n` + 
                  `${newLineIndent}${genIndent(1)}Text(/*autoText="2"*/${dataString})${tails.filter(t=>t.startsWith(".font")).join("")}\n` + 
              `${newLineIndent})${tails.filter(t=>!t.startsWith(".font")).join(`\n${newLineIndent}`)}${ifStringEnd}\n`
      }
      return ret;
    }
    else {

      let indentSubDepth = ifString ? 2 : 1;

      var ret = 
      `${indent}${ifString}${destClassTagName}(${genParams(node, destClassTagName, functionArray, styleHolder, cssDomain, sourceType)}) {\n` + 
            `${newLineIndent}${genIndent(1)}` + node.childNodes.map(n => genSubNodeString(n, {sourceType, functionArray, ifReferArr, forFuncObjArr, depth: depth + indentSubDepth, styleHolder, cssDomain, enableIterObject})).join("").trim() + "\n" + 
      `${newLineIndent}}${genTails(node, functionArray, styleHolder, cssDomain, sourceType).join(`\n${newLineIndent}`)}${ifStringEnd}\n`
      
      ASSERT(node.style);
      return ret;

    }
  }

}


