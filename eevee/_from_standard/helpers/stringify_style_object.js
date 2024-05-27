function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}
const javascript = require("../../parser/parse_ast/javascript/index.js");

module.exports = function (style) {

  ASSERT (style.type === 'CallExpression'
  && style.callee.type === 'Identifier'
  && style.callee.name === 'stringifyStyle'
  && style.callee.name === 'stringifyStyle')

  ASSERT(style.arguments && style.arguments.length === 1);

  let objAst = style.arguments[0];

  if (objAst === null) return new javascript.astFactory.Literal("");
  // debugger
  ASSERT(objAst);

  if (objAst.type === 'ObjectExpression') {

    let objectDictMerge = {};
    for (let i = 0; i < objAst.properties.length; i++) {
      let pv = objAst.properties[i];
      if (pv.key.type !=='Literal') return style;

      objectDictMerge[pv.key.value] = pv.value;

    }
    // debugger
    return  mergeObjectToString(objectDictMerge) || style;

  } else {

    //...style
    if (objAst.type === 'CallExpression'
      && objAst.callee.type === 'MemberExpression'
      && objAst.callee.object.type === 'Identifier'
      && objAst.callee.object.name === '$$EXTERNAL_SCOPE__Object'
      && objAst.callee.property.type === 'Identifier'
      && objAst.callee.property.name === 'assign'

    ) {
      //try merge object assign
      // debugger
      let objectDictMerge = {};
      
      for (let i = 0; i < objAst.arguments.length; i++) {
        objAstSub = objAst.arguments[i];
        ASSERT(objAstSub.type === "ObjectExpression");
        if (!objAstSub.type === "ObjectExpression") return style;
        
        // debugger
        for (let j = 0; j < objAstSub.properties.length; j++) {
          let pv = objAstSub.properties[j];
          ASSERT(pv.key.type === 'Literal');

          if (pv.key.type !== 'Literal') return style;
          
          objectDictMerge[pv.key.value] = pv.value;
          
        }

      }
      return  mergeObjectToString(objectDictMerge) || style;
      



    }

    // (style.type === 'CallExpression'
    // && style.callee.type === 'Identifier'
    // && style.callee.name === 'stringifyStyle'
    // && style.callee.name === 'stringifyStyle')

    debugger
    return style
  }
}

function mergeObjectToString(objectDictMerge) {
  let destArray = [""];

  for (var key in objectDictMerge) {

      if (typeof destArray[destArray.length - 1] === 'string') {
        destArray[destArray.length - 1] += `${key.replace(/[A-Z]/g, (r) => "-" +  r.toLowerCase())}:` 
      } else {
        destArray.push(`${key.replace(/[A-Z]/g, (r) => "-" +  r.toLowerCase())}:`)
      }
   
      let value = objectDictMerge[key];
      if (value.type ==='Literal') {
        if (typeof destArray[destArray.length - 1] === 'string') {
          destArray[destArray.length - 1] += `${value.value};` 
        } else {
          destArray.push(`${value.value}`)
        }
      } else {
        
        destArray.push(value);
        destArray.push(`;`)

      }
  }

  if (destArray[destArray.length-1] === ';') {
    destArray.pop(); //last ; will remove for short exporess
  }


  if (destArray.length === 1) {
    return new javascript.astFactory.Literal(destArray[0]);
  } else {

    if (typeof destArray[0] === 'object') {
      destArray[0].mustache = true;
    } 
    if (typeof destArray[1] === 'object') {
      destArray[1].mustache = true;
    }


    let destObj = new javascript.astFactory.BinaryExpression(
      "+",
      typeof destArray[0] === 'string' ? new javascript.astFactory.Literal(destArray[0]) : destArray[0],
      typeof destArray[1] === 'string' ? new javascript.astFactory.Literal(destArray[1]) : destArray[1],
    );

    destArray.shift();
    destArray.shift();
    
    while(destArray.length) {
      let newO = destArray.shift();
      if (typeof newO === 'string') {
        newO = new javascript.astFactory.Literal(newO);
      } else {
        newO.mustache = true;
      }

      destObj = new javascript.astFactory.BinaryExpression(
        "+",
        destObj,
        newO,
      );

    }
    // debugger
    return destObj;

  }
}