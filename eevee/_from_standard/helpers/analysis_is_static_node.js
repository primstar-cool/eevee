module.exports = function analysisIsStaticNode(node) {
  if (node.childNodes) {
      for (var i = 0; i < node.childNodes.length; i++) {
          if (!analysisStatic(node.childNodes[i])) {
              return false;
          }
      }
  }

  if (!isStaticObject(node.data)) {
      return false;
  }


  if (node.attrs) {
      for (var key in node.attrs) {
          if (!isStaticObject(node.attrs[key])) {
              return false; 
          }
      }
  }

  if (node.logic) {
      for (var key in node.logic) {
          // if (key === "for") debugger;

          if (!isStaticObject(node.logic[key])) {
              return false; 
          }
      }
  }

  if (node.tagName === "include") {
      return false;
  }

  node.isStatic = true;
  return true;

  function isStaticObject(obj) {
      if (!obj || (typeof obj !== 'object')) return true;
      return (obj.type === "Literal");
  }
}