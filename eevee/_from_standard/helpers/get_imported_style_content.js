function ASSERT (flag, ...args) {
    if (!flag) {
      debugger
      throw new Error(...args);
    }
  }
  
module.exports = function defaultGetImportedStyleContent(styleNodes, rootSrcPath) {
    return function findImportFn(contentObject, rule, filePath, inPath) {
  
      const path = require("path");
  
      var importPath;
      if (inPath.startsWith("/")) { 
        importPath = path.resolve(rootSrcPath||'./', "." + inPath);
      } else {
        importPath = path.resolve(filePath ? path.dirname(filePath) : './', inPath);
      }
  
      let relativePath = path.relative(rootSrcPath||'./', importPath);
      let relativePath1 = relativePath.replace(/\\/g, "/");
      let relativePath2 = relativePath.replace(/\//g, "\\");

      let node = styleNodes.find(
        n => (n.src === relativePath1 || n.src === relativePath2)
      )
      ASSERT(node, "can't find style: " + relativePath)
      // debugger
      let ret;
      if (node.convertedStyle) {
        debugger
        // prevent import duplicate
        ret = {styleContent: {
          "type": "stylesheet",
          "stylesheet": {
              "rules": [
                  {
                      "type": "comment",
                      "comment": node.convertedStyle
                  }
              ]
          }
      }, filePath: relativePath};

      } else {
        node.convertedStyle = `/*"${relativePath.replace(/\\/g, "/")}" was already imported by "${filePath.replace(/\\/g, "/")}"*/`
        ret = {styleContent: node.styleContent, filePath: relativePath};

      }

      // node.styleContent = null;// consumed

      return ret;
  
  
    };
    
    // ASSERT(node.tagName === 'include' && node.includedContent);
    // return node.includedContent;
  }