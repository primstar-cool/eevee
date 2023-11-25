const genNodeCssXPathName = require("../../../helpers/gen_node_css_xpath_name.js");
const getNodeUUID = require("../../../helpers/get_node_uuid.js");
const getObjectDataExpression = require("../../../../exporter/string_utils/get_object_data_expression.js");
const genDataString = require("../../../../exporter/string_utils/gen_data_string_code_style.js");

function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}


module.exports = function genParams(node, destClassTagName, functionArray, styleHolder, cssDomain, sourceType, {resolveAssetsPathFn}) {
      
  let uuid;
  
  
  if (!node.tagName) {
    ASSERT(node.data);
    // debugger
    uuid = getObjectDataExpression(node.parentNode.logic.uuid, functionArray);
    if (uuid.startsWith("\"")) {
      uuid = JSON.parse(uuid); 
    } else {
      ASSERT(false);
    }
    // debugger
    uuid += "::auto-text-" + node.parentNode.childNodes.indexOf(node)
    let dataString = genDataString(node.data, functionArray);
    return dataString + " /*" + uuid + "*/";

  }

  uuid = getObjectDataExpression(node.logic.uuid, functionArray);
  if (uuid.startsWith("\"")) uuid = JSON.parse(uuid);


  let xPathStyleObj = genNodeCssXPathName(node, functionArray, styleHolder);
  let xPathStr = xPathStyleObj.isStatic ? JSON.stringify(xPathStyleObj.xPath) : xPathStyleObj.xPathFunc;


  // debugger
  if (destClassTagName === "Image") {
    if (node.attrs && node.attrs.src) {
      let v = node.attrs.src;
      let imageUrl;
      if (typeof v === "object") {
        

        resolveAssetsPathFn
        imageUrl = getObjectDataExpression(v, functionArray);
      } else {
        imageUrl = JSON.stringify(v);

      }

      if (resolveAssetsPathFn) {
        imageUrl = resolveAssetsPathFn(imageUrl, node);
      }

      return imageUrl + " /*" + uuid + "*/";

    }
  } else if (destClassTagName === "Text") {
    // debugger
    if (!node.childNodes) {
      return "/*" + uuid + "*/";
    }
    let dataString = genDataString(node.childNodes[0].data, functionArray);
    return dataString + " /*" + uuid + "*/";

  } else if (destClassTagName === 'Flex') {
    // debugger
    let destParamStr = ''
    if (node._isFlex) {
      if (node.computedStyle.flexWrap) {
        destParamStr += `wrap: FlexWrap.${node.computedStyle.flexWrap[0].toUpperCase() + node.computedStyle.flexWrap.substr(1)}, `
      } else if (node.computedStyle.flexDirection) {
        destParamStr += `direction: Direction.${node.computedStyle.flexDirection[0].toUpperCase() + node.computedStyle.flexDirection.substr(1)}, `
      }
      
    } else {
      destParamStr += `wrap: FlexWrap.Wrap, `;

      let loopNode = node;
        let _textAlign = loopNode.computedStyle.textAlign;
        while (!_textAlign) {
          loopNode = loopNode.parentNode;
          if (!loopNode || !loopNode.computedStyle) break;
            _textAlign = loopNode.computedStyle.textAlign;;
        }
        if (_textAlign === 'right' || _textAlign === 'end') {
          destParamStr += ('justifyContent: FlexAlign.End')
          // debugger
        } else if (_textAlign === 'center') {
          destParamStr += ('justifyContent: FlexAlign.Center')
        }
    }

    if (destParamStr) {
      destParamStr = ("{"+ destParamStr + "}").replace(", }", "}")
    }
    return destParamStr + " /*" + uuid + "*/";

  }


  return "/*" + uuid + "*/";

  
    // if (!styleHolder) debugger
  
    var ret = '';
    var everClass = 0;
    var ingnoreInfo = 0;
    var isDataset = 0;
    var inlineStyle;
    let dataSetString = '';
  
  

    return "";

    for (var key in node.attrs) {
  
      // if (key === 'statisticsInfo') debugger
  
      ingnoreInfo = 0;
      isDataset = 0;
  
      var v = node.attrs[key];
      if (key === 'class') {
        everClass = 1;
        ingnoreInfo = 1
      } else if (key === 'style') {
        ingnoreInfo = 2;
      } else if (key === 'src' && (node.tagName === 'image' || node.tagName === 'img')) {
        key = "imageUrl";
        if (typeof v === "object") {
          let objString = getObjectDataExpression(v, functionArray);
          ret += `${key} = {${objString}} `
        } else {
          ret += `${key} = {${JSON.stringify(v)}} `
        }
        continue;
      } else if (key.startsWith("data-")) {
        isDataset = 1
      }
  
  
      if (typeof v === "object") {
        // ret += `"${key}": ${JSON.stringify(v)}, `
        let objString = getObjectDataExpression(v, functionArray);
        if (key === 'style') {
          inlineStyle = `parseStyle(${objString}, ${xPathStr})`;
        } else {
          if (ingnoreInfo) {
            ret += `/*${key} = {${objString}}*/ `
          } else if (isDataset) {
            dataSetString += `${key.substr(5).replace(/-[\w\W]/g, (v) => v[1].toUpperCase())}: ${objString}, `
          } else {
            ret += `${key} = {${objString}} `
          }
        }
      } else {
        ASSERT(typeof v === "string")
        
        if (key === 'style') {
          const styleObj = parseStyle(v);
          if (styleObj) {
            inlineStyle = JSON.stringify(styleObj);
          }
  
        } else {
          if (ingnoreInfo) {
            ret += `/*${key}="${v}"*/ `
          } else if (isDataset) {
            dataSetString += `${key.substr(5).replace(/-[\w\W]/g, (v) => v[1].toUpperCase())}: ${JSON.stringify(v)}, `
          } else {
            ret += `${key}=${JSON.stringify(v)} `
          }
        }
      }
    }
  
    // if (!everClass) {
    //   ret += 'className: ' + "'tag-" + node.tagName + "', ";
    // }
    
    const uuidString = getNodeUUID(node, functionArray);
    if (uuidString[0] === "\"") {
      ret += '/*uuid=' + uuidString + "*/ ";
      node._uuid = uuidString;
    } else {
      ret += '/*uuid={' + uuidString.trim() + '}*/';
      node._uuid = uuidString;
    }
  
    if (node.logic && node.logic["for-item"] && node.logic['key']) {
      let forItemParsed = JSON.parse(getObjectDataExpression(node.logic["for-item"], functionArray));
      const keyString = getObjectDataExpression(node.logic["key"], functionArray);
      ret += 'key={' + keyString.replace(new RegExp(`_cONTEXT\\.${forItemParsed}`, "g"), forItemParsed) + '}*/';
    }
  
    const dataSetStringTail = dataSetString ? `, {${dataSetString.slice(0, -2)}}` : '';
    let propagationEventDictNameStr = (node.parentNode && node.parentNode.events && node.parentNode.events._dictKey) ? node.parentNode.events._dictKey : null
  
    if (node.events) {
      // debugger
      // onClick={genEventFunc("onClickTab", "tap", {"tabName": (_cONTEXT as any).item, "tabIndex": (_cONTEXT as any).index})}
      
      if (node.events.bind && node.events.bind.tap) {
        node.events._dictKey = node._uuid;
        ret += `onClick={(_eventClickDict.click[${node._uuid}] = genEventFunc(${JSON.stringify(node.events.bind.tap)}, "tap", false, ${propagationEventDictNameStr}${dataSetStringTail}))} `
      } else if (node.events.catch && node.events.catch.tap) {
        node.events._dictKey = node._uuid;
        ret += `onClick={(_eventDict.click[${node._uuid}] = genEventFunc(${JSON.stringify(node.events.catch.tap)}, "tap", true, null${dataSetStringTail}))} `
      }
      // debugger
    } else if (propagationEventDictNameStr) {
  
      if (sourceType === 'vue' || sourceType === 'react' || sourceType === 'wxmp' || sourceType === 'ttma'  || sourceType === 'ksmp'   || sourceType === 'swan') 
      {
        // point-events: none, stop propagation
        
        let classDict = require("../helpers/gen_all_possible_style.js")(Object.assign({}, node, { childNodes: null }), cssDomain, false, true);
        ASSERT(Object.keys(classDict).length === 1);
        let cssClassStyle = classDict[Object.keys(classDict)[0]]||{}

        if (cssClassStyle.pointsEvents !== 'none') { // 收集 target 执行祖先回调
          if (!node.events) node.events = {};
          node.events._dictKey = node.parentNode.events._dictKey; // 子孙直接越级冒泡, 自己的名字不用存
          ret += `onClick={genEventFunc(null, "tap", false, ${propagationEventDictNameStr}${dataSetStringTail})} `

        }
      }
      
    }
  
    ASSERT(node.parentNode.style._tmpStyleId >= 0)

    if (node.isAutoCreateBgNode) {
      ret += ` xStyle={getAutoBgStyle(_styleTmp_${node.parentNode.style._tmpStyleId})}`
    } else if (node.isAutoCreateTextNode) {
      ret += ` xStyle={getAutoTextStyle(_styleTmp_${node.parentNode.style._tmpStyleId})}`
    } else {
      ret += ` xStyle={(_styleTmp_${node.style._tmpStyleId} = getXStyleByXPathName(${xPathStr}${inlineStyle ? ',' + inlineStyle : ""}))}`
    }
  
    node.inlineStyle = inlineStyle;
    // ret = ret.substr(0, ret.length - 2);
    // ret += '';
  
    return ret;
  }