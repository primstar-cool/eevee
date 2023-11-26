const traverseReplace = require('../utils/traverse_replace.js');
const createDeclaration = require('../utils/create_css_node.js');

const borderProperties = [
  "border-width",
  "border-top",
  "border-style",
  "border-right",
  "border-left",
  "border-color",
  "border-bottom",
  "border"
];

const colorMapping = require('../utils/color_mapping.js');

module.exports = () => {
  /**
   * border缩写展开插件
   * @param {Object} root 
   */
  function plugin(root) {
    traverseReplace(root, replacer, filter);
  }

  /**
   * border节点替换成展开形式
   * @param {Object} node 
   * @param {Array} container 
   */
  function replacer(node, container) {
    // 查询value值

    const isImportant = (node.value || '').includes("!important");
    
    // if (isImportant) debugger;

    let rgbIndex = node.value.indexOf("rgb");

    if (rgbIndex !== -1) {
      let endsC = node.value.indexOf(")", rgbIndex);
      node.value = node.value.substr(0, rgbIndex) + node.value.substring(rgbIndex, endsC).replace(/\s/g, "") + node.value.substr(endsC)
      // debugger
    }

    const vals = (node.value || '').replace("!important", "").trim().split(/\s+/g).filter(item => item && item.length);

    let replaceNodes = null;
    let reNodeIndex = null;

    let initialValueMap = extratParam(node.property, vals);

    replaceNodes = Object.keys(initialValueMap).map((v) => {
      // 先遍历节点，存在就替换，否则新建节点
      reNodeIndex = isRepeatNode(v, container);
      if (reNodeIndex) {
        container[reNodeIndex].value = initialValueMap[v];
      } else {
        return createDeclaration(v, initialValueMap[v], node.parent);
      }
    });


    if (isImportant) {
      replaceNodes.forEach(
        v => v.value += '!important'
      )
    }
    // debugger

    if (replaceNodes) {
      let pos = container.indexOf(node);
      if (pos !== -1) {
        if (reNodeIndex) {
          container.splice(pos, 1);
        } else {
          container.splice(pos, 1, ...replaceNodes);
        }
        return true;
      }
    }
  }

  /**
   * @description: 判断节点是否已经存在
   */
  function isRepeatNode(property, container) {
    for (let i = 0; i < container.length; i++) {
      if (container[i].property === property) return i;
    }
    return false;
  }

  /**
   * 识别具体属性
   * - border-width
   * - border-style
   * - border-color
   */
  function recognizeProperty(value) {
    if (/^(rgb|#).*/.test(value)) {
      return 'border-color';
    } else if (colorMapping[value]) {
      return 'border-color';
    } else if (/\d+/g.test(value)) {
      return 'border-width';
    }
    return 'border-style';
  }

  /**
   * 满足替换条件触发
   * @param {Object} node 
   */
  function filter(node) {
    return node && node.type === 'declaration' && isBorderProperty(node.property);
  }

  function isBorderProperty(property) {
    return borderProperties.includes(property);
  };

  function extratParam(originalPName, raw) {
    let ret = {};
    if (originalPName === 'border-color' || 
      originalPName === 'border-width' ||
      originalPName === 'border-style'
    ) {
      let postVal = originalPName.substr(7);
      ret[`border-top-${postVal}`] = raw[0];
      ret[`border-right-${postVal}`] = raw.length >= 2 ? raw[1] : raw[0];
      ret[`border-bottom-${postVal}`] = raw.length >= 3 ? raw[2] : raw[0];
      ret[`border-left-${postVal}`] = raw.length >= 4 ? raw[3] : raw.length >= 2 ? raw[2] : raw[0];
    } else if (originalPName === 'border' ||
      originalPName === 'border-top' ||
      originalPName === 'border-right' ||
      originalPName === 'border-bottom' ||
      originalPName === 'border-left'
    ) {
      var borderC = "currentcolor";
      var borderW = "medium";
      var borderS = "none";
      for (let i = 0; i < raw.length; i++) {
        let propertyName = recognizeProperty(raw[i]);
        if (propertyName === "border-color") {
          borderC = raw[i];
        } else if (propertyName === "border-width") {
          borderW = raw[i];
        } else if (propertyName === "border-style") {
          borderS = raw[i];
        }
      }

      if (originalPName === 'border') {
        ret["border-top-color"] =
          ret["border-right-color"] =
          ret["border-bottom-color"] =
          ret["border-left-color"] = borderC;
        ret["border-top-width"] =
          ret["border-right-width"] =
          ret["border-bottom-width"] =
          ret["border-left-width"] = borderW;
        ret["border-top-style"] =
          ret["border-right-style"] =
          ret["border-bottom-style"] =
          ret["border-left-style"] = borderS;
      } else if (originalPName === 'border-top' ||
        originalPName === 'border-right' ||
        originalPName === 'border-bottom' ||
        originalPName === 'border-left'
      ) {
        ret[`${originalPName}-color`] = borderC;
        ret[`${originalPName}-width`] = borderW;
        ret[`${originalPName}-style`] = borderS;
      }
    }

    return ret;
  }

  return plugin;
};