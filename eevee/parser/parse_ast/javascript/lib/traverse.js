/**
 * @since 20180824 12:19
 * @author ___xy
 */

const astTypes = require('../helpers/ast-types.js');

const traverseTypes = {
  [astTypes.PROGRAM](ast, visitor) {
    ast.body.forEach((child) => {
      traverse(child, visitor, ast);
    });
  },
  [astTypes.EXPRESSION_STATEMENT](ast, visitor) {
    traverse(ast.expression, visitor, ast);
  },
  [astTypes.LITERAL](ast, visitor) {},
  [astTypes.BINARY_EXPRESSION](ast, visitor) {
    traverse(ast.left, visitor, ast);
    traverse(ast.right, visitor, ast);
  },
  [astTypes.UNARY_EXPRESSION](ast, visitor) {
    traverse(ast.argument, visitor, ast);
  },
  [astTypes.LOGICAL_EXPRESSION](ast, visitor) {
    traverse(ast.left, visitor, ast);
    traverse(ast.right, visitor, ast);
  },
  [astTypes.IDENTIFIER](ast, visitor) {},
  [astTypes.SEQUENCE_EXPRESSION](ast, visitor) {
    ast.expressions.forEach((child) => {
      traverse(child, visitor, ast);
    });
  },
  [astTypes.CONDITIONAL_EXPRESSION](ast, visitor) {
    traverse(ast.test, visitor, ast);
    traverse(ast.consequent, visitor, ast);
    traverse(ast.alternate, visitor, ast);
  },
  [astTypes.MEMBER_EXPRESSION](ast, visitor) {
    traverse(ast.object, visitor, ast);
    traverse(ast.property, visitor, ast);
  },
  [astTypes.UPDATE_EXPRESSION](ast, visitor) {
    traverse(ast.argument, visitor, ast);
  },
  [astTypes.ARRAY_EXPRESSION](ast, visitor) {
    ast.elements.forEach((child) => {
      traverse(child, visitor, ast);
    });
  },
  [astTypes.CALL_EXPRESSION](ast, visitor) {
    traverse(ast.callee, visitor, ast);
    ast.arguments.forEach((argument) => {
      traverse(argument, visitor, ast);
    });
  },
  [astTypes.OBJECT_EXPRESSION](ast, visitor) {
    // debugger
    ast.properties.forEach((child) => {
      traverse(child.key, visitor, ast);
      traverse(child.value, visitor, ast);
    });
  },
};

function traverse(ast, visitor, parent = null) {
  if (visitor(ast, parent) !== false) {
    if (!traverseTypes[ast.type]) {
      throw new Error('Unexpected ast.type: ' + ast.type);
    }
    return traverseTypes[ast.type](ast, visitor, parent);
  }
}

module.exports = traverse;
