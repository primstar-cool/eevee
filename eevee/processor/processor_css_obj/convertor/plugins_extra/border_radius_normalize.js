const traverseReplace = require('../utils/traverse_replace.js');
const borderRadiusProps = [
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
]

module.exports = () => {
  /**
   * border-radius属性展开插件
   * @param {Object} root 
   */
  function plugin(root) {
    traverseReplace(root, replacer, filter);
  }
  /**
   * border-radius节点替换成展开形式
   * @param {Object} node 
   * @param {Array} container 
   */
  function replacer(node, container) {
    let value = node.value || '';
    // 横向|纵向圆角值取大值
    let vals = [];
    let slashPos = value.indexOf('/');
    if (slashPos !== -1) {
      let horVals = value.slice(0, slashPos).split(/\s+/g).filter(item => item && item.length);
      let verVals = value.slice(slashPos + 1).split(/\s+/g).filter(item => item && item.length);
      vals = horVals.map((val, index) => (val < verVals[index] ? verVals[index] : val));
    } else {
      vals = value.split(/\s+/g).filter(item => item && item.length);
    }
    // 过滤属性值
    let replaceNodes = null;
    if (node.property === 'border-radius') {
      switch (vals.length) {
        case 1:
          replaceNodes = createLonghandRadius(vals[0], vals[0], vals[0], vals[0], node.parent);
          break;
        case 2:
          replaceNodes = createLonghandRadius(vals[0], vals[1], vals[0], vals[0], node.parent);
          break;
        case 3:
          replaceNodes = createLonghandRadius(vals[0], vals[1], vals[2], vals[2], node.parent);
          break;
        case 4:
          replaceNodes = createLonghandRadius(vals[0], vals[1], vals[2], vals[3], node.parent);
          break;
        default:
          break;
      }
    } else {
      // 两个值时取较大的值
      let destVal = (vals.length === 1 ? vals[0] : (vals[0] < vals[1] ? vals[1] : vals[0]));
      replaceNodes = [
        createDeclaration(node.property.replace(/-(\w)/g, (s, s1) => s1.toUpperCase()), destVal, parent),
      ];
    }
    
    if (replaceNodes) {
      let pos = container.indexOf(node);
      if (pos !== -1) {
        container.splice(pos, 1, ...replaceNodes);
      }
    }
  }
  /**
   * 满足替换条件触发
   * @param {Object} node 
   */
  function filter(node) {
    return node && node.type === 'declaration' && borderRadiusProps.includes(node.property);
  }
  /**
   * 创建属性描述
   * @param {string} property 
   * @param {string} value 
   * @param {Object} parent 
   * @param {Object} position 
   */
  function createDeclaration(property, value, parent, position = null) {
    let node = new Object();
    node.type = 'declaration';
    node.property = property;
    node.value = value;
    node.parent = parent;
    node.position = position;
    return node;
  }

  /**
   * 展开border-radius属性
   * @param {String} topLeft 
   * @param {String} topRight 
   * @param {String} bottomRight 
   * @param {String} bottomLeft 
   * @param {Object} parent 
   */
  function createLonghandRadius(topLeft, topRight, bottomRight, bottomLeft, parent) {
    return [
      createDeclaration('borderTopLeftRadius', topLeft, parent),
      createDeclaration('borderTopRightRadius', topRight, parent),
      createDeclaration('borderBottomRightRadius', bottomRight, parent),
      createDeclaration('borderBottomLeftRadius', bottomLeft, parent)
    ];
  }
  return plugin;
};