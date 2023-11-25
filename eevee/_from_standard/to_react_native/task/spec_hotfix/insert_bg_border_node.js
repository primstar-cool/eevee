function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}
module.exports = function (node, cssDomain) {

  let classDict = require("../../../helpers/gen_all_possible_style.js")(Object.assign({}, node, { childNodes: null }), cssDomain, false, true);

  let _hasBg = 0;
  let _specBorderFlag = 0;

  // ASSERT(Object.keys(classDict).length <= 1);
  let cssClassNames = Object.keys(classDict);

  for (let i = 0; i < cssClassNames.length; i++) {
    let cssClassStyle = classDict[cssClassNames[i]] || {};

    if (cssClassStyle["background-image"] && cssClassStyle["background-image"] !== 'none') {
      _hasBg |= 1;
    }
  
    if (
      cssClassStyle["border-left-width"] ||
      cssClassStyle["border-bottom-width"] ||
      cssClassStyle["border-right-width"] ||
      cssClassStyle["border-top-width"]) { // 如果相等已合并
  
  
      if (cssClassStyle["border-top-width"]) _specBorderFlag |= 1;
      if (cssClassStyle["border-right-width"]) _specBorderFlag |= 2;
      if (cssClassStyle["border-bottom-width"]) _specBorderFlag |= 4;
      if (cssClassStyle["border-left-width"]) _specBorderFlag |= 8;
    }
  }
  


  if (node.inlineStyle) {
    if (node.inlineStyle.includes("backgroundImage") || node.inlineStyle.includes("background-image")) {
      _hasBg |= 1;
    }

    // 分开写 必有妖
    if (
      node.inlineStyle.includes("borderLeftWidth") || node.inlineStyle.includes("border-left-width")
      || node.inlineStyle.includes("borderBottomWidth") || node.inlineStyle.includes("border-bottom-width")
      || node.inlineStyle.includes("borderRightWidth") || node.inlineStyle.includes("border-right-width")
      || node.inlineStyle.includes("borderTopWidth") || node.inlineStyle.includes("border-top-width")

      || node.inlineStyle.includes("borderLeftColor") || node.inlineStyle.includes("border-left-color")
      || node.inlineStyle.includes("borderBottomColor") || node.inlineStyle.includes("border-bottom-color")
      || node.inlineStyle.includes("borderRightColor") || node.inlineStyle.includes("border-right-color")
      || node.inlineStyle.includes("borderTopColor") || node.inlineStyle.includes("border-top-color")
    ) {
      _specBorderFlag |= 15;
    }
  }

  let bgNode, borderNode;

  if (_hasBg) {
    if (!node.childNodes) { node.childNodes = []; }

    const bgNode = {
      tagName: "image",
      isAutoCreateBgNode: 1,
      get parentNode () {
        return node
      },
      logic: {
        uuid: typeof node.logic.uuid === 'string' ? node.logic.uuid + "::bg" :
          (
            (node.logic.uuid.type === 'Literal') ? node.logic.uuid.value + "::bg" :
              {
                type: "BinaryExpression",
                left: node.logic.uuid,
                operator: '+',
                right: {
                  type: 'Literal',
                  value: '::bg'
                }
              }
          )
      },
    }
    Object.defineProperty(
      bgNode, "parentNode", {value: node, enumerable: false, writable: true}
    );

    // node.childNodes.unshift(bgNode)
  }

  if (_specBorderFlag) {

    if (!node.childNodes) { node.childNodes = []; }

    // debugger
    if (!node.style._classStyleRouteFull.isStatic) {
      _specBorderFlag |= 15;
    }

    const borderNode =  {
      tagName: "view",
      isAutoCreateBorderNode: 1,
      borderFlag: _specBorderFlag,
      parentNode: node,
      logic: {
        uuid: typeof node.logic.uuid === 'string' ? node.logic.uuid + "::border" :
          (
            (node.logic.key.uuid === 'Literal') ? node.logic.uuid.value + "::border" :
              {
                type: "BinaryExpression",
                left: node.logic.uuid,
                operator: '+',
                right: {
                  type: 'Literal',
                  value: '::border'
                }
              }
          )
      },
    }

    Object.defineProperty(
      borderNode, "parentNode", {value: node, enumerable: false, writable: true}
    );

    node.childNodes.push(borderNode);
  }

  return {bgNode, borderNode};
}
