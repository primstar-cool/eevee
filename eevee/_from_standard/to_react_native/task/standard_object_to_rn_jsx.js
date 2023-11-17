
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

module.exports = function standard2rnjsx(
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
  if (!rootSrcPath) rootSrcPath = srcFilePath ? require("path").dirname(srcFilePath) : "./";

  const createMappedFunction = require("../../../processor/processor_xml_obj/create_mapped_function.js");
  var {functionArray, referKeys} = createMappedFunction(root, true, false, true);

  const defineNodeUUID = require("../../../processor/processor_xml_obj/define_node_uuid.js");
  defineNodeUUID(root, '', mainClassName);

  functionArray = functionArray.map(
    s=> `${s.substring(s.indexOf("return", s.indexOf("function (_cONTEXT)")) + 6, s.lastIndexOf(";"))}`.trim()
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
    
  dest = `[\n`
  if (root.childNodes) {
    if (root.childNodes.length === 1) dest = `(\n`;

    root._uuid = JSON.stringify(root.tagName)
    root.childNodes.forEach(
      (node, idx) => {
          dest += genIndent(1) + genSubNodeString(node, {sourceType, functionArray, ifReferArr, forFuncObjArr, depth: 1, styleHolder, cssDomain, enableIterObject}).trim();
          dest += (root.childNodes.length > 1 ? ',\n' : '\n');
      }
    )
    
  }

  dest += (root.childNodes && root.childNodes.length === 1) ? `);\n` : "];\n";



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
        ifDefine += `\nvar _if_` + i + ";";
      } else {
        ifDefine += `\n// var _if_` + i + "; // unused var";
        dest = dest.replace(`_if_${i} = `, `/*_if_${i} = */`);
      }

    }

    dest = dest + "\n\n/*IF_VAR_DEFINE*/\n" + ifDefine;

  }

  // if (dest.includes("parseStyle"))
  //    dest += `\n/*INJECT parseStyle START*/\n${parseStyle}\n/*INJECT parseStyle END*/\n`;

  return dest;

}

function genSubNodeString(node, {sourceType, functionArray, ifReferArr, forFuncObjArr, depth, styleHolder, cssDomain, ignoreMyNodeLogic = false, enableIterObject}) {
  
  const indent = genIndent(depth);
  let parentStyleString;
  ASSERT(node.parentNode.style && node.parentNode.style._tmpStyleId >= 0);
  parentStyleString = `_styleTmp_${node.parentNode.style._tmpStyleId}`



  if (!node.tagName) {

    let dataString = genDataString(node.data, functionArray, false);
    if (dataString === null) return "";
  
    if (dataString.startsWith("/*")) {
      ret = indent + `{${dataString}}\n`
    } else {
      node.isAutoCreateTextNode = 1;
      ASSERT(parentStyleString && !node.attrs && Object.keys(node.logic||{}).length <= 1);
      // style={backgroundColor:transparent;padding:0;margin:0},

      let parentAttrInfo = genAttrs(node.parentNode, functionArray, styleHolder, cssDomain, sourceType);

      let classAttr = "";
      if (parentAttrInfo.includes(`className="`)) {
        let startIndex = parentAttrInfo.indexOf(`className="`)
        classAttr = parentAttrInfo.substring(startIndex, parentAttrInfo.indexOf(`"`, startIndex + 11) + 1);
      } else if (parentAttrInfo.includes(`className={`)) {
        let startIndex = parentAttrInfo.indexOf(`className={`);
        let endIndex;
        let num = 1;
        for (let ii = startIndex + 11; ii < parentAttrInfo.length; ii++) {
          let c = parentAttrInfop[ii];
          if (c === "{") num++;
          if (c === "}") {
            num--;
            if (num === 0) {
              endIndex = ii+1;
              break;
            }
          }
        }
        classAttr = parentAttrInfo.substring(startIndex, endIndex);
      } 

      let styleAttr = "";
      if (parentAttrInfo.includes(`style="`)) {
        let startIndex = parentAttrInfo.indexOf(`style="`)
        styleAttr = parentAttrInfo.substring(startIndex, parentAttrInfo.indexOf(`"`, startIndex + 7));
        styleAttr = JSON.parse(styleAttr);
      } else if (parentAttrInfo.includes(`style={`)) {
        let startIndex = parentAttrInfo.indexOf(`style={`);
        let endIndex;
        let num = 1;
        for (let ii = startIndex + 7; ii < parentAttrInfo.length; ii++) {
          let c = parentAttrInfop[ii];
          if (c === "{") num++;
          if (c === "}") {
            num--;
            if (num === 0) {
              endIndex = ii;
              break;
            }
          }
        }
        styleAttr = parentAttrInfo.substring(startIndex + 7, endIndex);
      } 

      ret = indent + (`<Text /*autoText="1"*/ ${classAttr} style={getAutoTextStyle(${styleAttr || 'null'})}>{${dataString}}</Text>\n`);
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
        var retForString = indent + `{${forRet.replace(/\n/g, "\n" + indent)}}\n`

        ASSERT(node.style)
        return retForString;
      }

      
      if (node.logic["if"]) {
        let curIfIndex = ifReferArr.length;
        let condiString = getObjectDataExpression(node.logic["if"], functionArray);
        node.logic.ifIndex = curIfIndex;

        if (condiString) {
          ifString = `{(_if_${curIfIndex} = ${condiString}) && `;
        } else {
          ifString = `{(_if_${curIfIndex} = false) && `;
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
            ifString = `{${preCondiString}(_if_${curIfIndex} = (${condiString})) && `;
          } else {
            ifString = `{${preCondiString}(_if_${curIfIndex} = false) && `;
          }
        } else {
          ifString = `{${preCondiString}`;
        }
      }

      if (ifString) {
        ifStringEnd = "}";
      }
    }
    
    let destClassTagName = {
      view: "View",
      text: "Text",
      image: "Image",
      div: "View",
      span: "View",
      img: "Image",
    }[node.tagName];

    ASSERT(destClassTagName);
  
    if (node.tagName === 'span') {
      if (node.childNodes && node.childNodes.length == 1 && node.childNodes[0] && !node.childNodes[0].tagName) {
        destClassTagName = 'Text'
      }
    }

    // if (destClassTagName === "XImageView") debugger

    if (destClassTagName === "Text") {
      // genAttrs(node, functionArray, styleHolder, cssDomain, sourceType);
    } else if (destClassTagName === "View") {
      genAttrs(node, functionArray, styleHolder, cssDomain, sourceType);
      var {bgNode} = require("./spec_hotfix/insert_bg_border_node.js")(node, cssDomain);
      // debugger
    }

    const _isLeafNode = (!node.childNodes || node.childNodes.length === 0) && !bgNode; //色块 图片 等等
    const _isOnlyTextNode = node.childNodes && node.childNodes.length === 1 && !node.childNodes[0].tagName && (destClassTagName === 'Text' || !(node.logic && node.logic["for"]))

    // debugger
    if (_isLeafNode) {

      if (node.isAutoCreateBorderNode) {
        // debugger
        ASSERT(!ifString && !bgNode);
        let borderFlag = node.borderFlag;
        if (borderFlag)
          ret = indent + `<View /*autoBorder="1"*/ style={getAutoBorderStyle(${parentStyleString}, 0)}>`
        if (borderFlag & 1)
          ret += "\n" + indent + `  {${parentStyleString}.borderTopWidth    && <View /*autoBorder="1.1"*/ style={getAutoBorderStyle(${parentStyleString}, 1)}/>}`
        if (borderFlag & 2)
          ret += "\n" + indent + `  {${parentStyleString}.borderRightWidth  && <View /*autoBorder="1.2"*/ style={getAutoBorderStyle(${parentStyleString}, 2)}/>}`
        if (borderFlag & 4)
          ret += "\n" + indent + `  {${parentStyleString}.borderBottomWidth && <View /*autoBorder="1.4"*/ style={getAutoBorderStyle(${parentStyleString}, 4)}/>}`
        if (borderFlag & 8)
          ret += "\n" + indent + `  {${parentStyleString}.borderLeftWidth   && <View /*autoBorder="1.8"*/ style={getAutoBorderStyle(${parentStyleString}, 8)}/>}`

        if (borderFlag)
          ret += "\n" + indent + `</View>\n`

      } else {
        ret = `${indent}${ifString}<${destClassTagName} ${genAttrs(node, functionArray, styleHolder, cssDomain, sourceType)}/>${ifStringEnd}\n`;
      }

      ASSERT(node.style)
      return ret;

    } else if (_isOnlyTextNode) {
      // debugger
      let dataString = genDataString(node.childNodes[0].data, functionArray, true);
      if (dataString.startsWith("\"")) {
        dataString = JSON.parse(dataString);
        if (!encodeURIComponent(dataString) === dataString) { //no spec char
          dataString = '{' + JSON.stringify(dataString) + '}'
        }
      } else {
        dataString = '{' + dataString + '}'
      }

      if (destClassTagName === 'Text') {
        ret = `${indent}${ifString}<Text ${genAttrs(node, functionArray, styleHolder, cssDomain, sourceType)}>${dataString}</Text>${ifStringEnd}\n`;
        node.childNodes[0].style = node.style;
      }
      else {
        ret = `${indent}${ifString}<${destClassTagName} ${genAttrs(node, functionArray, styleHolder, cssDomain, sourceType)}>\n` + 
                  `${indent}${genIndent(1)}<Text /*autoText="2"*/ style={getAutoTextStyle(${parentStyleString})}${dataString}</Text>\n` + 
              `${indent}</${destClassTagName}>${ifStringEnd}\n`
      }
      return ret;
    }
    else {

      let indentSubDepth = bgNode ? 2 : 1;

      var ret = 
      `${indent}${ifString}<${destClassTagName} ${genAttrs(node, functionArray, styleHolder, cssDomain, sourceType)}>\n` + 
          (bgNode ? `${indent}${genIndent(1)}<ImageBackground style={getAutoBgStyle(${parentStyleString}} source={{uri: dumpBgUrl(${parentStyleString}})}}>`:"") + 
            `${indent}${genIndent(indentSubDepth)}` + node.childNodes.map(n => genSubNodeString(n, {sourceType, functionArray, ifReferArr, forFuncObjArr, depth: depth + indentSubDepth, styleHolder, cssDomain, enableIterObject})).join("").trim() + "\n" + 
          (bgNode ? `${indent}${genIndent(1)}</ImageBackground>`: "") + 
        `${indent}</${destClassTagName}>${ifStringEnd}\n`;
      
      ASSERT(node.style);
      return ret;

    }
  }

}


