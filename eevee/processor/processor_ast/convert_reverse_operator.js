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
  if (ast.type === astTypes.UNARY_EXPRESSION && ast.operator === "~") {
    if (ast.argument && ast.argument.type === astTypes.UNARY_EXPRESSION  &&  ast.argument.operator === '~') //取整
    {
      ast.type = astTypes.LOGICAL_EXPRESSION;
      let arg = ast.argument.argument;
      console.log(`replace 【~~${javascript.serialize(arg)}】 to 【${javascript.serialize(arg)} - ${javascript.serialize(arg)} % 1】`)

      delete ast.argument;
      ast.operator = "-";
      ast.left = arg;
      ast.right = {
        operator: "%",
        type: astTypes.BINARY_EXPRESSION,
        left: arg,
        right: {
          type: astTypes.LITERAL,
          value: 1
        }
      };
    } else {
      let arg = ast.argument;

      console.log(`replace 【~${javascript.serialize(arg)}】 to 【-(${javascript.serialize(arg)} - ${javascript.serialize(arg)} % 1 + 1)】`);

      ast.type = astTypes.UNARY_EXPRESSION;
      delete ast.argument;
      ast.operator = "-";

      ast.argument = {
        type: astTypes.LOGICAL_EXPRESSION,
        left: {
          type: astTypes.LOGICAL_EXPRESSION,
          left: arg,
          operator: "-",

          right: {
            operator: "%",
            type: astTypes.BINARY_EXPRESSION,
            left: arg,
            right: {
              type: astTypes.LITERAL,
              value: 1
            }
          },
        },
        operator: "-",
        right: {
          type: astTypes.LITERAL,
          value: 1
        }
      };
      
    }
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