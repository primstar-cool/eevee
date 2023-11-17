const genNodeCssXPathName = require("../../../helpers/gen_node_css_xpath_name.js");
const getNodeUUID = require("../../../helpers/get_node_uuid.js");
const getObjectDataExpression = require("../../../../exporter/string_utils/get_object_data_expression.js");
function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}

module.exports = function genAttrs(node, functionArray, styleHolder, cssDomain, sourceType) {
    // debugger
    if (!node.attrs) node.attrs = {};
  
    // if (!styleHolder) debugger
  
    var ret = '';
    var everClass = 0;
    var ingnoreInfo = 0;
    var isDataset = 0;
    // var inlineStyle;
    var attrClass;
    let dataSetString = '';
    
    let complexCssClass = "";
  
    let xPathStyleObj = genNodeCssXPathName(node, functionArray, styleHolder);
    // let xPathStr = xPathStyleObj.isStatic ? JSON.stringify(xPathStyleObj.xPath) : xPathStyleObj.xPathFunc;
    if (xPathStyleObj.isStatic) {
      // 
      if (cssDomain) {
        let destRules = cssDomain.collectCssRuleByRouteKey(xPathStyleObj.xPath);
        // debugger
        // destRules = destRules.filter(v=> v.route && v.route.length > 1);
  
        if (destRules.length) {
  
          let fattenedName = destRules.map(require("../../utils/flatten_css_rule_name.js"));
          
          complexCssClass = Array.from(new Set(fattenedName)).join(" ")
           
          if (complexCssClass) {
            complexCssClass += " ";
          }
        }
     
        
      }
      // debugger
    } else {
      // _getFitCssClass in runtime
    }
  
    for (var key in node.attrs) {
  
      // if (key === 'statisticsInfo') debugger
  
      ingnoreInfo = 0;
      isDataset = 0;
  
      var v = node.attrs[key];
      if (key === 'class') {
        // debugger
        key = "className";
        
        
        if (!xPathStyleObj.isStatic) {
          attrClass = v;
          ret += `className={getFitCssClass(${xPathStyleObj.xPathFunc})} `;

          if (typeof attrClass === "object") {
            if (attrClass.type === 'Literal') {
              attrClass = Object.assign({}, attrClass);
              attrClass.value = complexCssClass + v.value;
            } else if (attrClass.type === 'BinaryExpression' && attrClass.operator === '+' && attrClass.left.type === 'Literal' ) {
              attrClass = Object.assign({}, attrClass);
              attrClass.left = Object.assign({}, attrClass.left);
              attrClass.left.value = complexCssClass + attrClass.left.value;
            } else {
              attrClass =  {
                type: "BinaryExpression",
                left: {
                  type: 'Literal',
                  value: complexCssClass
                },
                operator: '+',
                right: attrClass
              }
            }
          }
          
          everClass = 1;
          continue;
        } else {
          ASSERT(typeof v === 'string');
          attrClass = v = complexCssClass + v.trim();
          everClass = 1;
        }

        
      } else if (key === 'src' && (node.tagName === 'image' || node.tagName === 'img')) {
        key = "source";
        if (typeof v === "object") {
          let objString = getObjectDataExpression(v, functionArray);
          ret += `${key}={{uri: ${objString}}} `
        } else {
          ret += `${key}={{uri: ${JSON.stringify(v)}}} `
        }
        continue;
      } else if (key.startsWith("data-")) {
        isDataset = 1
      }
      
      if (typeof v === "object") {
        // ret += `"${key}": ${JSON.stringify(v)}, `


        let objString = getObjectDataExpression(v, functionArray);
  
        if (key === 'style') {

          if (objString.startsWith("_cONTEXT.stringifyStyle")) {
            ret += `style={${objString.substr(23)}} `;
            // debugger

          } else {
            ret += `style={parseStyle(${objString})} `
          }

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
            ret += `style={${JSON.stringify(styleObj)}} `
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
  
    if (!everClass && complexCssClass) {
      attrClass = complexCssClass;
      ret += `className=${JSON.stringify(attrClass.trim())} `
    }
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
      ret += 'key={' + keyString.replace(new RegExp(`_cONTEXT\\.${forItemParsed}`, "g"), forItemParsed) + '}';
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
  
    // debugger
    ASSERT(node.parentNode.style._tmpStyleId >= 0)

    if (node.isAutoCreateBgNode) {
      ASSERT(false);
      // ret += ` style={getAutoBgStyle(_styleTmp_${node.parentNode.style._tmpStyleId})}`
    } else if (node.isAutoCreateTextNode) {
      ASSERT(false);
      // ret += ` style={getAutoTextStyle(_styleTmp_${node.parentNode.style._tmpStyleId})}`
    } else {

    }
  
    return ret;
  }