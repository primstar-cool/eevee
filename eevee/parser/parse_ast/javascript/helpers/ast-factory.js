/**
 * @since 20180830 16:08
 * @author ___xy
 */

const astTypes = require('./ast-types.js');

exports.Position = class Position {
  constructor(line, column) {
    this.line = line;
    this.column = column;
  }
};

exports.Location = class Location {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
};

class ASTNode {
  constructor(type, location) {
    this.type = type;
    // this.location = location;
  }
}

exports.ASTNode = ASTNode;

exports.Program = class Program extends ASTNode {
  constructor(body, location) {
    super(astTypes.PROGRAM, location);
    this.body = body;
  }
};

exports.ExpressionStatement = class ExpressionStatement extends ASTNode {
  constructor(expression, location) {
    super(astTypes.EXPRESSION_STATEMENT, location);
    this.expression = expression;
  }
};

exports.Literal = class Literal extends ASTNode {
  constructor(value, location) {
    super(astTypes.LITERAL, location);
    this.value = value;
  }
};

exports.BinaryExpression = class BinaryExpression extends ASTNode {
  constructor(operator, left, right, location) {
    super(astTypes.BINARY_EXPRESSION, location);
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
};

/**
 * void
 * +
 * -
 * !
 * ~
 * @type {UnaryExpression}
 */
exports.UnaryExpression = class UnaryExpression extends ASTNode {
  constructor(operator, argument, location) {
    super(astTypes.UNARY_EXPRESSION, location);
    this.operator = operator;
    this.argument = argument;
  }
};

/**
 * &&
 * ||
 * @type {LogicalExpression}
 */
exports.LogicalExpression = class LogicalExpression extends ASTNode {
  constructor(operator, left, right, location) {
    super(astTypes.LOGICAL_EXPRESSION, location);
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
};

exports.Identifier = class Identifier extends ASTNode {
  constructor(name, location) {
    super(astTypes.IDENTIFIER, location);
    this.name = name;
  }
};

exports.SequenceExpression = class SequenceExpression extends ASTNode {
  constructor(expressions, location) {
    super(astTypes.SEQUENCE_EXPRESSION, location);
    this.expressions = expressions;
  }
};

exports.ConditionalExpression = class ConditionalExpression extends ASTNode {
  constructor(test, consequent, alternate, location) {
    super(astTypes.CONDITIONAL_EXPRESSION, location);
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
};

exports.MemberExpression = class MemberExpression extends ASTNode {
  constructor(object, property, computed, location) {
    super(astTypes.MEMBER_EXPRESSION, location);
    this.object = object;
    this.property = property;
    this.computed = computed;
  }
};

exports.UpdateExpression = class UpdateExpression extends ASTNode {
  constructor(operator, argument, prefix, location) {
    super(astTypes.UPDATE_EXPRESSION, location);
    this.operator = operator;
    this.argument = argument;
    this.prefix = prefix;
  }
};

exports.ObjectExpression = class ObjectExpression extends ASTNode {
  constructor(properties, location) {
    super(astTypes.OBJECT_EXPRESSION, location);
    this.properties = properties;
  }
};

exports.Property = class Property extends ASTNode {
  constructor(key, value, method, shorthand, computed, location) {
    super(astTypes.PROPERTY, location);
    this.key = key;
    this.value = value;
    this.method = method;
    this.shorthand = shorthand;
    this.computed = computed;
  }
};

exports.ArrayExpression = class ArrayExpression extends ASTNode {
  constructor(elements, location) {
    super(astTypes.ARRAY_EXPRESSION, location);
    this.elements = elements;
  }
};

exports.CallExpression = class CallExpression extends ASTNode {
  constructor(callee, _arguments, location) {
    super(astTypes.CALL_EXPRESSION, location);
    this.callee = callee;
    this.arguments = _arguments;
  }
};

exports.AssignmentExpression = class AssignmentExpression extends ASTNode {
  constructor(operator, left, right, location) {
    super(astTypes.ASSIGNMENT_EXPRESSION, location);
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
};

exports.isBinaryExpressionOperator = function isBinaryExpressionOperator(
  operator
) {
  return (
    operator === '**' ||
    operator === '*' ||
    operator === '/' ||
    operator === '%' ||
    operator === '+' ||
    operator === '-' ||
    operator === '<<' ||
    operator === '>>' ||
    operator === '>>>' ||
    operator === '<' ||
    operator === '<=' ||
    operator === '>' ||
    operator === '>=' ||
    operator === '==' ||
    operator === '!=' ||
    operator === '===' ||
    operator === '!==' ||
    operator === '&' ||
    operator === '^' ||
    operator === '|'
  );
};

exports.isLogicalExpressionOperator = function isLogicalExpressionOperator(
  operator
) {
  return operator === '&&' || operator === '||';
};

exports.isUnaryExpressionOperator = function isUnaryExpressionOperator(
  operator
) {
  return (
    operator === 'void' ||
    operator === '!' ||
    operator === '+' ||
    operator === '-' ||
    operator === '~' ||
    operator === '...' 
  );
};

exports.isUpdateExpressionOperator = function isUpdateExpressionOperator(
  operator
) {
  return operator === '++' || operator === '--';
};
