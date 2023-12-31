const traverseReplace = require('../utils/traverse_replace.js');
const createDeclaration = require('../utils/create_css_node.js');

module.exports = () => {
  /**
   * margin缩写展开插件
   * @param {Object} root 
   */
  function plugin(root) {
    traverseReplace(root, replacer, filter);
  }
  /**
   * margin节点替换成展开形式
   * @param {Object} node 
   * @param {Array} container 
   */
  function replacer(node, container) {
    // 查询value值
    const vals = (node.value || '').split(/\s+/g).filter(item => item && item.length);
    let replaceNodes = null;
    switch (vals.length) {
      case 1:
        replaceNodes = createLonghandMargin(vals[0], vals[0], vals[0], vals[0], node.parent);
        break;
      case 2:
        replaceNodes = createLonghandMargin(vals[0], vals[1], vals[0], vals[1], node.parent);
        break;
      case 3:
        replaceNodes = createLonghandMargin(vals[0], vals[1], vals[2], vals[1], node.parent);
        break;
      case 4:
        replaceNodes = createLonghandMargin(vals[0], vals[1], vals[2], vals[3], node.parent);
        break;
      default:
        break;
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
    return node && node.type === 'declaration' && node.property === 'margin';
  }

  /**
   * 创建margin展开形式的数据节点
   * @param {string} top 
   * @param {string} right 
   * @param {string} bottom 
   * @param {string} left 
   * @param {Object} parent 
   */
  function createLonghandMargin(top, right, bottom, left, parent) {
    return [
      createDeclaration('margin-top', top, parent),
      createDeclaration('margin-right', right, parent),
      createDeclaration('margin-bottom', bottom, parent),
      createDeclaration('margin-left', left, parent),
    ];
  }
  return plugin;
};