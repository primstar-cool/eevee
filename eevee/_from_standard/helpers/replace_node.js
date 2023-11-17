function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}

module.exports = function replaceNode(node, newNodes) {
    const parentNode = node.parentNode;
    const childNodes = parentNode.childNodes;
    const index = childNodes.indexOf(node);
    if (index !== -1) {
      if (newNodes) {
        
        if (!Array.isArray(newNodes)) newNodes = [newNodes];

        newNodes.forEach((_node) => {
          if (_node.hasOwnProperty("parentNode")) {
            _node.parentNode = parentNode;
            Object.getOwnPropertyDescriptor(_node, "parentNode");
            ASSERT( _node.parentNode === parentNode);
          } else {
            Object.defineProperty(
              _node, "parentNode", {value: parentNode, enumerable: false, writable: true}
            );
          }
        });
        childNodes.splice(index, 1, ...newNodes);
      } else {
        childNodes.splice(index, 1);
      }
    } else {
      throw new Error("can't find node")
    }
  }