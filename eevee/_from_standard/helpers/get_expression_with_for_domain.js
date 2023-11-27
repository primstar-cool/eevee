function ASSERT (flag, ...args) {
    if (!flag) {
      debugger
      throw new Error(...args);
    }
  }
  

const createMappedFunction = require("../../processor/processor_xml_obj/create_mapped_function.js");

module.exports = function getExpressionWithForDomain(node, ast , replaceContext = 'this') {

   let astString = createMappedFunction.createFunctionReturnStr(ast);

    let forItems = [];
    let loopNode = node;

    while (loopNode) {

        if (loopNode.logic) {
            if (loopNode.logic['for-item']) {
            ASSERT(loopNode.logic['for-item'].type === 'Literal');
            let v = loopNode.logic['for-item'].value;
            if (!forItems.includes(v))
                forItems.push(v)
            }

            if (loopNode.logic['for-index']) {
            ASSERT(loopNode.logic['for-index'].type === 'Literal');
            let v = loopNode.logic['for-index'].value;
            if (!forItems.includes(v))
                forItems.push(v)
            }
        }
        loopNode = loopNode.parentNode;

    }

    let astStringOld = astString;
    forItems.forEach(w => {
    // debugger
    astString = astString.replace(new RegExp("_cONTEXT\\." + w, "g"), w);
    })

    let useIfFilter =  astStringOld !== astString;

    if (replaceContext)
        astString = astString.replace(/_cONTEXT\./g, `${replaceContext}.`);

    return {astString, forItems, useIfFilter}
}