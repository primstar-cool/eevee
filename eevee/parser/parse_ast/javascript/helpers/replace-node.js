/**
 * @since 20180905 16:31
 * @author ___xy
 */

const astTypes = require('./ast-types.js');

function replaceNode(parent, newNode, node) {
  switch (parent.type) {
    case astTypes.PROGRAM:
      for (let i = 0; i < parent.body.length; i++) {
        if (parent.body[i] === node) {
          parent.body[i] = newNode;
          break;
        }
      }
      break;
    case astTypes.EXPRESSION_STATEMENT:
      if (parent.expression === node) {
        parent.expression = newNode;
      }
      break;
    case astTypes.BINARY_EXPRESSION:
    case astTypes.LOGICAL_EXPRESSION:
    case astTypes.ASSIGNMENT_EXPRESSION:
      if (parent.left === node) {
        parent.left = newNode;
      } else if (parent.right === node) {
        parent.right = newNode;
      }
      break;
    case astTypes.UNARY_EXPRESSION:
    case astTypes.UPDATE_EXPRESSION:
      if (parent.argument === node) {
        parent.argument = newNode;
      }
      break;
    case astTypes.SEQUENCE_EXPRESSION:
      for (let i = 0; i < parent.expressions.length; i++) {
        if (parent.expressions[i] === node) {
          parent.expressions[i] = newNode;
          break;
        }
      }
      break;
    case astTypes.CONDITIONAL_EXPRESSION:
      if (parent.test === node) {
        parent.test = newNode;
      } else if (parent.consequent === node) {
        parent.consequent = newNode;
      } else if (parent.alternate === node) {
        parent.alternate = newNode;
      }
      break;
    case astTypes.MEMBER_EXPRESSION:
      if (parent.object === node) {
        parent.object = newNode;
      } else if (parent.property === node) {
        parent.property = newNode;
      }
      break;
    case astTypes.OBJECT_EXPRESSION:
      for (let i = 0; i < parent.properties.length; i++) {
        if (parent.properties[i] === node) {
          parent.properties[i] = newNode;
          break;
        }
      }
      break;
    case astTypes.PROPERTY:
      if (parent.key === node) {
        parent.key = newNode;
      } else if (parent.value === node) {
        parent.value = newNode;
      }
      break;
    case astTypes.ARRAY_EXPRESSION:
      for (let i = 0; i < parent.elements.length; i++) {
        if (parent.elements[i] === node) {
          parent.elements[i] = newNode;
          break;
        }
      }
      break;
    case astTypes.CALL_EXPRESSION:
      if (parent.callee === node) {
        parent.callee = newNode;
      } else {
        for (let i = 0; i < parent.arguments.length; i++) {
          if (parent.arguments[i] === node) {
            parent.arguments[i] = newNode;
            break;
          }
        }
      }
      break;
    case astTypes.LITERAL:
    case astTypes.IDENTIFIER:
    default:
      throw new Error('Invalid parent.type: ' + parent.type);
  }
}

module.exports = replaceNode;
