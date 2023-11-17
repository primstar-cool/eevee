function ASSERT (flag, ...args) {
    if (!flag) {
      debugger
      throw new Error(...args);
    }
  }
  
module.exports = function defualtGetImportedStyleContent(styleNodes, rootSrcPath) {
    return function findImportFn(contentObject, rule, filePath, inPath) {
  
      const path = require("path");
  
      var importPath;
      if (inPath.startsWith("/")) { 
        importPath = path.resolve(rootSrcPath||'./', "." + inPath);
      } else {
        importPath = path.resolve(filePath ? path.dirname(filePath) : './', inPath);
      }
  
      let relativePath = path.relative(rootSrcPath||'./', importPath);
      
      let node = styleNodes.find(
        n => (n.src === relativePath)
      )
      ASSERT(node, "can't find style: " + relativePath)
      // debugger
  
      return {styleContent: node.styleContent, filePath: relativePath};
  
  
    };
    
    // ASSERT(node.tagName === 'include' && node.includedContent);
    // return node.includedContent;
  }