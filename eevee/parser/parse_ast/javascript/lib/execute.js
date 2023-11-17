/**
 * @since 20180731 11:11
 * @author ___xy
 */

const astTypes = require('../helpers/ast-types.js');

module.exports = function execute(ast, scope) {
  if (ast.type === astTypes.PROGRAM) {
    for (let i = 0, l = ast.body.length - 1; i < l; i++) {
      execute(ast.body[i], scope);
    }
    return execute(ast.body[ast.body.length - 1], scope);
  }
  if (ast.type === astTypes.EXPRESSION_STATEMENT) {
    return execute(ast.expression, scope);
  }
  if (ast.type === astTypes.SEQUENCE_EXPRESSION) {
    for (let i = 0; i < ast.expressions.length - 1; i++) {
      execute(ast.expressions[i], scope);
    }
    return execute(ast.expressions[ast.expressions.length - 1], scope);
  }
  if (ast.type === astTypes.LOGICAL_EXPRESSION) {
    if (ast.operator === '&&') {
      return execute(ast.left, scope) && execute(ast.right, scope);
    }
    if (ast.operator === '||') {
      return execute(ast.left, scope) || execute(ast.right, scope);
    }
    throw new Error('Unexpected LOGICAL_EXPRESSION operator: ' + ast.operator);
  }
  if (ast.type === astTypes.BINARY_EXPRESSION) {
    if (ast.operator === '===') {
      return execute(ast.left, scope) === execute(ast.right, scope);
    }
    if (ast.operator === '==') {
      return execute(ast.left, scope) == execute(ast.right, scope);
    }
    if (ast.operator === '>') {
      return execute(ast.left, scope) > execute(ast.right, scope);
    }
    if (ast.operator === '<') {
      return execute(ast.left, scope) < execute(ast.right, scope);
    }
    if (ast.operator === '<=') {
      return execute(ast.left, scope) <= execute(ast.right, scope);
    }
    if (ast.operator === '>=') {
      return execute(ast.left, scope) >= execute(ast.right, scope);
    }
    if (ast.operator === '!=') {
      return execute(ast.left, scope) != execute(ast.right, scope);
    }
    if (ast.operator === '!==') {
      return execute(ast.left, scope) !== execute(ast.right, scope);
    }
    if (ast.operator === '+') {
      return execute(ast.left, scope) + execute(ast.right, scope);
    }
    if (ast.operator === '-') {
      return execute(ast.left, scope) - execute(ast.right, scope);
    }
    if (ast.operator === '*') {
      return execute(ast.left, scope) * execute(ast.right, scope);
    }
    if (ast.operator === '/') {
      return execute(ast.left, scope) / execute(ast.right, scope);
    }
    if (ast.operator === '%') {
      return execute(ast.left, scope) % execute(ast.right, scope);
    }
    if (ast.operator === '**') {
      return execute(ast.left, scope) ** execute(ast.right, scope);
    }
    if (ast.operator === '&') {
      return execute(ast.left, scope) & execute(ast.right, scope);
    }
    if (ast.operator === '|') {
      return execute(ast.left, scope) | execute(ast.right, scope);
    }
    if (ast.operator === '^') {
      return execute(ast.left, scope) ^ execute(ast.right, scope);
    }
    if (ast.operator === '>>') {
      return execute(ast.left, scope) >> execute(ast.right, scope);
    }
    if (ast.operator === '<<') {
      return execute(ast.left, scope) << execute(ast.right, scope);
    }
    if (ast.operator === '>>>') {
      return execute(ast.left, scope) >>> execute(ast.right, scope);
    }
    throw new Error('Unexpected BINARY_EXPRESSION operator: ' + ast.operator);
  }
  if (ast.type === astTypes.LITERAL) {
    return ast.value;
  }
  if (ast.type === astTypes.UNARY_EXPRESSION) {
    if (ast.operator === '-') {
      return -ast.argument.value;
    }
    if (ast.operator === '+') {
      return +ast.argument.value;
    }
    if (ast.operator === '!') {
      return !ast.argument.value;
    }
    if (ast.operator === 'void') {
      return undefined;
    }
    if (ast.operator === '~') {
      return ~ast.argument.value;
    }
    if (ast.operator === '...') {
      
      // return ...ast.argument.value;
    }
    throw new Error('Unexpected UNARY_EXPRESSION operator: ' + ast.operator);
  }
  if (ast.type === astTypes.IDENTIFIER) {
    if (ast.name === 'undefined') {
      return undefined;
    }
    if (scope.hasOwnProperty(ast.name)) {
      return scope[ast.name];
    }
    throw new Error('Unexpected identifier name: ' + ast.name);
  }
  if (ast.type === astTypes.CONDITIONAL_EXPRESSION) {
    return execute(ast.test, scope)
      ? execute(ast.consequent, scope)
      : execute(ast.alternate, scope);
  }
  if (ast.type === astTypes.MEMBER_EXPRESSION) {
    if (ast.computed) {
      return execute(ast.object, scope)[execute(ast.property, scope)];
    }
    return execute(ast.object, scope)[ast.property.name];
  }
  throw new Error('Unexpected ast type: ' + ast.type);
};
