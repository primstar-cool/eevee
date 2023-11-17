/**
 * @since 20180731 11:12
 * @author ___xy
 */

const astTypes = require('../helpers/ast-types.js');
const binaryOperatorPrecedences = require('../helpers/binary-operator-precedences.js');

const serializeTypes = {
  [astTypes.PROGRAM](ast) {
    return ast.body
      .map((child) => {
        return serialize(child, ast);
      })
      .join(';\n');
  },
  [astTypes.EXPRESSION_STATEMENT](ast) {
    return serialize(ast.expression, ast);
  },
  [astTypes.LITERAL](ast) {
    if (ast.value === null) {
      return `null`;
    }
    //20221229 bluie
    // if (typeof ast.value === 'object') {
    //   return ` ${ast.value.expression.trim()} `;
    // }
    if (typeof ast.value === 'string') {
      let text = JSON.stringify(ast.value)
      return `'${text.slice(1, -1)}'`;
    }
    if (typeof ast.value === 'number' || typeof ast.value === 'boolean') {
      return `${ast.value}`;
    }
    
    
    throw new Error('Unexpected typeof ast.value: ' + typeof ast.value);
  },
  [astTypes.IDENTIFIER](ast) {
    return ast.name;
  },
  [astTypes.BINARY_EXPRESSION](ast, parent) {
    const serialized = `${serialize(ast.left, ast)} ${ast.operator} ${serialize(
      ast.right,
      ast
    )}`;
    if (
      parent &&
      (parent.type === astTypes.UNARY_EXPRESSION ||
        (parent.type === astTypes.BINARY_EXPRESSION &&
          (binaryOperatorPrecedences[parent.operator] >
            binaryOperatorPrecedences[ast.operator] ||
            (binaryOperatorPrecedences[parent.operator] ===
              binaryOperatorPrecedences[ast.operator] &&
              ast === parent.right))))
    ) {
      return addParen(serialized);
    }
    return serialized;
  },
  [astTypes.UNARY_EXPRESSION](ast) {
    if (
      ast.operator === '-' ||
      ast.operator === '+' ||
      ast.operator === '!' ||
      ast.operator === '~' ||
      ast.operator === '...'
    ) {
      return `${ast.operator}${serialize(ast.argument, ast)}`;
    }
    if (ast.operator === 'void') {
      return `${ast.operator} ${serialize(ast.argument, ast)}`;
    }
    throw new Error('Unexpected ast.type: ' + ast.type);
  },
  [astTypes.LOGICAL_EXPRESSION](ast, parent) {
    const serialized = `${serialize(ast.left, ast)} ${ast.operator} ${serialize(
      ast.right,
      ast
    )}`;
    if (
      parent &&
      (parent.type === astTypes.UNARY_EXPRESSION ||
        parent.type === astTypes.BINARY_EXPRESSION ||
        (parent.type === astTypes.LOGICAL_EXPRESSION && ast.operator === '||'))
    ) {
      return addParen(serialized);
    }
    return serialized;
  },
  [astTypes.SEQUENCE_EXPRESSION](ast) {
    return ast.expressions
      .map((child) => {
        return serialize(child, ast);
      })
      .join(', ');
  },
  [astTypes.CONDITIONAL_EXPRESSION](ast, parent) {
    const serialized = `${serialize(ast.test, ast)} ? ${serialize(
      ast.consequent,
      ast
    )} : ${serialize(ast.alternate, ast)}`;
    if (
      parent &&
      (parent.type === astTypes.UNARY_EXPRESSION ||
        parent.type === astTypes.LOGICAL_EXPRESSION ||
        parent.type === astTypes.BINARY_EXPRESSION)
    ) {
      return addParen(serialized);
    }
    return serialized;
  },
  [astTypes.MEMBER_EXPRESSION](ast) {
    if (ast.computed) {
      return `${serialize(ast.object, ast)}[${serialize(ast.property, ast)}]`;
    }
    return `${serialize(ast.object, ast)}.${serialize(ast.property, ast)}`;
  },
  [astTypes.UPDATE_EXPRESSION](ast) {
    if (ast.prefix) {
      return `${ast.operator}${serialize(ast.argument)}`;
    }
    return `${serialize(ast.argument)}${ast.operator}`;
  },
  [astTypes.ARRAY_EXPRESSION](ast) {
    return `[${ast.elements
      .map((element) => {
        return serialize(element, ast);
      })
      .join(', ')}]`;
  },
  [astTypes.CALL_EXPRESSION](ast) {
    return `${serialize(ast.callee, ast)}(${ast.arguments
      .map((argument) => {
        return serialize(argument, ast);
      })
      .join(', ')})`;
  },
  [astTypes.OBJECT_EXPRESSION](ast) {
    // debugger
    let ret = " {" + ast.properties.map(v => `${v.key.value}: ${serialize(v.value, ast)}`).join(", ") + "} "
    return ret;
  },
};

function serialize(ast, parent = null) {
  if (!ast) debugger
  if (!serializeTypes[ast.type]) {
    throw new Error('Unexpected ast.type: ' + ast.type + " at "+ JSON.stringify(ast));
  }
  return serializeTypes[ast.type](ast, parent);
}

function addParen(serialized) {
  return `(${serialized})`;
}

module.exports = serialize;
