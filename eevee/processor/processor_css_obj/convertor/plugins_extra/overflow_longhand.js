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
    const vals = (node.value || '').split(/\s+/g).filter(item => item && item.length);
    switch (vals.length) {
      case 1:
        replaceNodes = createLonghandOverflow(vals[0], vals[0], node.parent);
        break;
      case 2:
        replaceNodes = createLonghandOverflow(vals[0], vals[1], node.parent);
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
    // console.log(node.property);
    return node && node.type === 'declaration' && node.property === 'overflow';
  }

  /**
   * 创建margin展开形式的数据节点
   * @param {string} top 
   * @param {string} right 
   * @param {string} bottom 
   * @param {string} left 
   * @param {Object} parent 
   */
  function createLonghandOverflow(x, y, parent) {
    return [
      createDeclaration('overflow-x', x, parent),
      createDeclaration('overflow-y', y, parent),
    ];
  }

  return plugin;
};