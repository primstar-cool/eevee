const genNodeCssXPathName = require("../../../helpers/gen_node_css_xpath_name.js");
const getNodeUUID = require("../../../helpers/get_node_uuid.js");
const getObjectDataExpression = require("../../../../exporter/string_utils/get_object_data_expression.js");
function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}
const parseStyle = require("../../../helpers/parse_style.js");

module.exports = function genAttrs(node, {sourceType, functionArray, indent, useJsxLib, isLeafNode}) {
  if (!node.attrs) return null;

  var ret = '';

  var isDataset = 0;
  var everSetDataSet;


  for (var key in node.attrs) {
    isDataset = 0
    var v = node.attrs[key];
    if (key === 'class') {
      key = "className";

      if (typeof v === 'string') {
        v = v.trim();
      } else {
        // debugger
      }
    } else if (key.startsWith("data-")) {
      isDataset = 1;

      if (!everSetDataSet) {
        everSetDataSet = 1;

        if (sourceType === 'wxmp' || sourceType === 'wxml')
          ret += `${indent}"data-__data-set-need-parse": 1,`;

      }
    }

    if (typeof v === "object") {
      // ret += `"${key}": ${JSON.stringify(v)}, `
      let objString = getObjectDataExpression(v, functionArray);

      if (key === 'style')
      {
        ret += `${indent}"style": parseStyle(${objString}), `
      } else if (isDataset) {
        if (sourceType === 'wxmp' || sourceType === 'wxml')
          ret += `${indent}"${key}": JSON.stringify(${objString}), `
        else
          ret += `${indent}"${key}": ${objString}, `
      } else {
        ret += `${indent}"${key}": ${objString}, `
      }
    } else if (typeof v === "string") {
      
      if (key === 'style') {
        const styleObj = parseStyle(v);
        if (styleObj) {
          ret += `${indent}"style": ${JSON.stringify(styleObj)}, `
        }
      } else if (isDataset) {
        if (sourceType === 'wxmp' || sourceType === 'wxml')
          ret += `${indent}"${key}": ${JSON.stringify(JSON.stringify(v))}, `
        else
          ret += `${indent}"${key}": ${JSON.stringify(v)}, `
          // dataSetString += `${key.substr(5).replace(/-[\w\W]/g, (v) => v[1].toUpperCase())}: ${JSON.stringify(v)}, `
        } else {
          ret += `${indent}"${key}": ${JSON.stringify(v)}, `
      }

    } else {
      ASSERT(false);
    }

  }

  let keyStr = getObjectDataExpression(node.logic.key, functionArray);
  if (keyStr !== null) {
    ret += `${indent}key: ` + getObjectDataExpression(node.logic.key, functionArray) + ", ";
  }

  if (node.events) {
    // debugger
    //          onClick={genEventFunc("onClickTab", "tap", {"tabName": (_cONTEXT as any).item, "tabIndex": (_cONTEXT as any).index})}
    if (node.events.bind && node.events.bind.tap) {
      ret += `"${indent}onClick": (e)=>{if (_mETHODS.${node.events.bind.tap}) _mETHODS.${node.events.bind.tap}(e);}, `
    } else if (node.events.catch && node.events.catch.tap) {
      ret += `"${indent}onClick": (e)=>{if (_mETHODS.${node.events.catch.tap}) _mETHODS.${node.events.catch.tap}(e);e.stopPropagation();}, `
    }
    // debugger
  } 
  // ret = ret.substr(0, ret.length - 2);
  // if (useJsxLib && ret) debugger//
  // ret += '';
  if (!useJsxLib || isLeafNode) {
    if (ret.trim().endsWith(",")) {
      ret = ret.slice(0, ret.lastIndexOf(","))
    }
  }
  

  return ret;
}


