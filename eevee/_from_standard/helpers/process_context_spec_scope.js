const javascript = require('../../parser/parse_ast/javascript');


function traverse(node, visitor, parent = null) {
  visitor(node, parent);
  if (node.childNodes) {
    node.childNodes.forEach((childNode) => {
      traverse(childNode, visitor, node);
    });
  }
}

module.exports = function (templateNode, transLocal, transMember, transExternalScope) {
    traverse(templateNode, (node) => {
        // resolveTagTemplate(node, { onFoundImportTemplateFn });
        let allObj = [];
        if (node.attrs) {
          Object.keys(node.attrs).forEach((attrName) => {
            let attrValue = node.attrs[attrName];
            if (typeof attrValue === 'object') {
              allObj.push(attrValue)          
            }
          });
        }
    
        if (node.logic) {
    
          Object.keys(node.logic).forEach((logicName) => {
            let logicValue = node.logic[logicName];
            if (typeof logicValue === 'object' && logicName !== "rks" && logicName !== 'env-if' && logicName !== 'listener') {
              allObj.push(logicValue);
            }
          });
        }
    
        if (node.data && typeof node.data === 'object') {
          allObj.push(node.data)
        }
    
        allObj.forEach(
          astObj => {
            javascript.traverse(
              astObj, (astObjLoop, parent) => {
                if (astObjLoop.type === 'Identifier') {
                  // console.log(astObjLoop.name)
    
                  if (astObjLoop.name.startsWith("$$LOCAL__")) {
                    // debugger
                    transLocal && transLocal(astObjLoop, parent);
                    
                  } else if (astObjLoop.name.startsWith("$$MEMBER__")) {
                    // debugger
                    transMember && transMember(astObjLoop, parent);
                  } else if (astObjLoop.name.startsWith("$$EXTERNAL_SCOPE__")) {
                    // debugger
                    transExternalScope && transExternalScope(astObjLoop, parent);
                  }
                }
              }
            )
          }
        )
    
      });
}