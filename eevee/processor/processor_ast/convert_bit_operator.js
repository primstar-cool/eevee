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
  if (ast.type === astTypes.BINARY_EXPRESSION && ast.operator === "&") {

    if (ast.right && ast.right.type === astTypes.LITERAL) {
      let rightV = ast.right.value;
      if (rightV === 1) {
        
        console.log(`replace 【${javascript.serialize(ast)}】 to 【${javascript.serialize(ast.left)} % 2】`);

        ast.type = astTypes.BINARY_EXPRESSION;
        ast.operator = "%";
        ast.right = {
          type: astTypes.LITERAL,
          value: 2
        };

      } else {
        let k;
        for (k = 2; k <= 0x80000000; k++) {
          if (rightV === k) {
            let astNew = {
              type: astTypes.BINARY_EXPRESSION,
              operator: ">=",
              right: {
                type: astTypes.LITERAL,
                value: 1
              },
              left: {
                type: astTypes.BINARY_EXPRESSION,
                operator: "%",
                right: {
                  type: astTypes.LITERAL,
                  value: 2
                },
                left: {
                  type: astTypes.BINARY_EXPRESSION,
                  operator: "/",
                  left: ast.left,
                  right: {
                    type: astTypes.LITERAL,
                    value: k
                  }
                }
              }

            }

            
            console.log(`replace 【${javascript.serialize(ast)}】 to 【${javascript.serialize(astNew)}】`);
            // debugger
            Object.assign(ast, astNew);
            k = 0;
            break;
          }
        }      
        
        if (k) {
          throw new Error("swan not support opertate & with " + (javascript.serialize(ast.right)))
        }

      }
    } else if (ast.right && ast.right.type === astTypes.BINARY_EXPRESSION && ast.right.operator === "<<" && ast.right.left.type === astTypes.LITERAL && [1,2,4,8,16,32].includes(ast.right.left.value)) {
      let astNew = {
        type: astTypes.BINARY_EXPRESSION,
        operator: ">=",
        right: {
          type: astTypes.LITERAL,
          value: 1
        },
        left: {
          type: astTypes.BINARY_EXPRESSION,
          operator: "%",
          right: {
            type: astTypes.LITERAL,
            value: 2
          },
          left: {
            type: astTypes.BINARY_EXPRESSION,
            operator: "/",
            left: ast.left,
            right: ast.right
          }
        }

      }

      
      console.log(`replace 【${javascript.serialize(ast)}】 to 【${javascript.serialize(astNew)}】`);
      Object.assign(ast, astNew);
      
    } else {
      // if (ast.right.type === 'MemberExpression' && ast.right.object.type === "Identifier" && ast.right.object.name === "swanmath") {
      //   console.warn("use swanmath, plz include it");
      // } else {
      throw new Error("swan not support opertate & with " + (javascript.serialize(ast.right)))
      // }
    } 
    
  } else if (ast.type === astTypes.BINARY_EXPRESSION && (ast.operator === ">>" || ast.operator === ">>>")) {
    if (ast.right.type === astTypes.LITERAL) {

      let astNew = {
        type: astTypes.BINARY_EXPRESSION,
        operator: "/",
        right: {
          type: astTypes.LITERAL,
          value: Math.pow(2, ast.right.value)
        },
        left: {
          type: astTypes.BINARY_EXPRESSION,
          operator: "-",
          left: ast.left,
          right: {
            type: astTypes.BINARY_EXPRESSION,
            operator: "%",
            left: ast.left,
            right: {
              type: astTypes.LITERAL,
              value: Math.pow(2, ast.right.value)
            }
          }
        }
      }
      console.log(`replace 【${javascript.serialize(ast)}】 to 【${javascript.serialize(astNew)}】`);
      Object.assign(ast, astNew);

    } else {
      throw new Error("swan not support opertate " + ast.operator + " with " + (javascript.serialize(ast.right)))

    }
    
  } else if (ast.type === astTypes.BINARY_EXPRESSION && (ast.operator === "<<")) {
    if (ast.right.type === astTypes.LITERAL) {

      let astNew = {
        type: astTypes.BINARY_EXPRESSION,
        operator: "*",
        right: {
          type: astTypes.LITERAL,
          value: Math.pow(2, ast.right.value)
        },
        left: ast.left
      }
      console.log(`replace 【${javascript.serialize(ast)}】 to 【${javascript.serialize(astNew)}】`);
      Object.assign(ast, astNew);

    } else {
      // console.log(`replace 【${javascript.serialize(ast)}】 to 【${javascript.serialize(astNew)}】`);

      throw new Error("swan not support opertate " + ast.operator + " with " + (javascript.serialize(ast.right)))
    }
    
  }
  
  else if (ast.type === astTypes.BINARY_EXPRESSION && (ast.operator === "|" || ast.operator === "^" || ast.operator === "**")) {
    // TODO make a filter 
    throw new Error("swan not support opertate " + ast.operator + " with", javascript.serialize((ast.right)));
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