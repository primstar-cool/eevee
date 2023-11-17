/*
 * @Author: bluie
 * @Date: 2021-04-02 18:34:57
 * @LastEditTime: 2021-04-02 19:29:58
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 */

const astTypes = require("../../parser/parse_ast/javascript/helpers/ast-types.js");
const astTypesValues = Object.keys(astTypes).map(k=>astTypes[k]);
const javascript = require("../../parser/parse_ast/javascript")
module.exports = process;
function process(ast, parent) {

  if (typeof ast !== 'object') return ast;

  // if (JSON.stringify(ast).includes("")) debugger
  if (ast.type === astTypes.MEMBER_EXPRESSION && ast.object && ast.object.type === astTypes.ARRAY_EXPRESSION) {
    // debugger

    let f = `${javascript.serialize(ast.property)}`
    let strConv = "";
    for (let i = 0; i <  ast.object.elements.length; i++) {
      strConv += `((${f} == ${i} ) ? (${javascript.serialize(ast.object.elements[i])}) : `
    }

    strConv += "undefined"
    for (let i = 0; i <  ast.object.elements.length; i++) {
      strConv += ")";
    }

    let astNew = javascript.parse(strConv);
    // debugger

    // console.log(javascript.serialize(astNew));

    console.log(`replace 【${javascript.serialize(ast)}】 to 【${javascript.serialize(astNew)}】`)

    delete ast.object;
    delete ast.property;

    ast.type = astNew.type;
    ast.body = astNew.body;
    
    
    //
  }
  

  ["argument", "test", "left", "right", "property", "object", "expression", "name", "body", "consequent", "alternate", "callee"].forEach(
    k => {
      if (ast[k] && typeof ast[k] === "object" && astTypesValues.includes(ast[k].type)) {
        process(ast[k], ast);
      }
    }
  );

  return ast

}