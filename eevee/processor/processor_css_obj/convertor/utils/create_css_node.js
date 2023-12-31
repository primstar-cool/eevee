
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
  Object.defineProperty(
    node, "parent", {value: parent, enumerable: false, writable: true}
  );
  node.position = position;
  return node;
}

module.exports = createDeclaration