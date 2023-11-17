/**
 * @since 20180822 15:08
 * @author ___xy
 */

const astTypes = require('../helpers/ast-types.js');
const astFactory = require('../helpers/ast-factory.js');
const traverse = require('./traverse.js');
const binaryOperatorPrecedences = require('../helpers/binary-operator-precedences.js');

const codesString = 'azAZ09_$"\'.\\ \n\r\t()[]+-*/%&|!^~<>=?:,;{}';
let codes = {};
codesString.split('').forEach((item) => {
  codes[item] = item.charCodeAt(0);
});

module.exports = function parse(input) {
  let i = 0;

  let program = new astFactory.Program([]);
  while (i < input.length) {
    program.body.push(parseExpressionStatement(i, input.length, 0));
  }

  return program;

  function parseExpressionStatement(startIndex, endIndex) {
    let expressionStatement = null;
    let operators = [];
    i = startIndex;

    while (i < endIndex) {
      let code = input.charCodeAt(i);

      if (
        isNumber(code) ||
        (code === codes['.'] && isNumber(input.charCodeAt(i + 1)))
      ) {
        let hasDot = code === codes['.'];
        const start = i;
        while (i < input.length) {
          i++;
          code = input.charCodeAt(i);
          if (!isNumber(code) && (hasDot || code !== codes['.'])) {
            break;
          }
          hasDot = hasDot || code === codes['.'];
        }
        consumeNode(new astFactory.Literal(Number(input.slice(start, i))));
        continue;
      }

      //bluie add 20210810
      if (
        code === codes['{'] && input.charCodeAt(i + 1) !== codes['{']
      ) {

        let start = i;
        let braceLeft = codes['{'];
        let braceRight = codes['}'];

        let extraBraceLeft = 1;
        i++;
        for (;;) {
          let c = input.charCodeAt(i++);
          if (c === braceLeft) {
            extraBraceLeft++;
          } else if (c === braceRight) {
            extraBraceLeft--;
            if (!extraBraceLeft) {
              break;
            }
          }
        }
        
        let expression = (input.slice(start, i));
        console.log(expression);
        // debugger
        //bluie add 20221229 not well deal with , in a string or expression such as {a: '1,'}
        let objectPropertys = [];
        expression = expression.trim();
        expression = expression.substring(1, expression.length - 1);

        for (let si = 0; si < expression.length;) {
          let c = expression[si];
          if (c === ' ') {
            si++
            continue;
          }
          
          let dobj = {};

          let keyEnd = si
          while (expression[keyEnd] !== ':') {
            keyEnd++;
          }

          let key = expression.substring(si, keyEnd).trim();

          if (key[0] === "\"" || key[0] === "'") {
            key = key.substring(1, key.length - 1);
          }

          dobj.key = new astFactory.Literal(key);


          si = keyEnd+1;

          let valueEnd = si;
          let inObjMode = 0;
          while ((expression[valueEnd] !== ','||inObjMode) && valueEnd < expression.length) {
            if (expression[valueEnd] === "{") {
              inObjMode++;
            } else if (expression[valueEnd] === "}") {
              inObjMode--;
            }
            valueEnd++;
          }

          let value = expression.substring(si, valueEnd).trim();
          si = valueEnd+1;

          let v = parse(value)
          dobj.value = v.body[0].expression;

          objectPropertys.push(dobj)
          // debugger

        }
        


        consumeNode(new astFactory.ObjectExpression(objectPropertys));
        continue;
      }

      if (matchToken('true')) {
        i += 4;
        consumeNode(new astFactory.Literal(true));
        continue;
      }

      if (matchToken('false')) {
        i += 5;
        consumeNode(new astFactory.Literal(false));
        continue;
      }

      if (matchToken('null')) {
        i += 4;
        consumeNode(new astFactory.Literal(null));
        continue;
      }

      if (matchToken('undefined')) {
        i += 9;
        consumeNode(new astFactory.Identifier('undefined'));
        continue;
      }

      if (isStringStart(code)) {
        const startIndex = i;
        const endIndex = getStringEndIndex(code, startIndex, input);
        const quote = String.fromCharCode(code);
        const string = input
          .slice(startIndex + 1, endIndex)
          .replace(new RegExp('\\\\' + quote, 'g'), quote);
        consumeNode(new astFactory.Literal(string));
        i = endIndex + 1;
        continue;
      }

      if (matchToken('void')) {
        operators.push('void');
        i += 4;
        continue;
      }

      if (isIdentifierStart(code)) {
        consumeNode(new astFactory.Identifier(getIdentifier()));
        continue;
      }

      if (isWhiteSpace(code)) {
        i++;
        continue;
      }

      if (code === codes['(']) {
        const _endIndex = getCodeIndex(input, i, codes[')']);
        /**
         * (a, b)
         */
        const expr = parseExpressionStatement(i + 1, _endIndex).expression;
        consumeParenNodes(expr);
        i = _endIndex + 1;
        continue;
      }

      if (code === codes['.']) {

        if (matchToken('...')) {
          operators.push('...');
          i += 3;
          continue;
        } else {
          i++;
          consumeMemberExpression(
            new astFactory.Identifier(getIdentifier()),
            false
          );
          continue;
        }
        
      }

      if (code === codes['[']) {
        const _startIndex = i;
        const _endIndex = getCodeIndex(input, _startIndex, codes[']']);
        if (operators.length || !expressionStatement) {
          consumeArrayExpression(_startIndex + 1, _endIndex);
        } else {
          consumeMemberExpression(
            parseExpressionStatement(_startIndex + 1, _endIndex).expression,
            true
          );
        }
        i = _endIndex + 1;
        continue;
      }

      if (code === codes['!']) {
        if (matchToken('!==')) {
          operators.push('!==');
          i += 3;
          continue;
        }
        if (matchToken('!=')) {
          operators.push('!=');
          i += 2;
          continue;
        }
        operators.push('!');
        i++;
        continue;
      }

      if (code === codes['+'] || code === codes['-']) {
        if (matchToken('++')) {
          operators.push('++');
          i += 2;
          continue;
        }
        if (matchToken('--')) {
          operators.push('--');
          i += 2;
          continue;
        }
        operators.push(String.fromCharCode(code));
        i++;
        continue;
      }

      if (code === codes['~']) {
        operators.push('~');
        i++;
        continue;
      }

      if (code === codes['*']) {
        if (matchToken('**')) {
          operators.push('**');
          i += 2;
          continue;
        }
        operators.push('*');
        i++;
        continue;
      }

      if (code === codes['/']) {
        operators.push('/');
        i++;
        continue;
      }

      if (code === codes['%']) {
        operators.push('%');
        i++;
        continue;
      }

      if (code === codes['<']) {
        if (matchToken('<<')) {
          operators.push('<<');
          i += 2;
          continue;
        }
        if (matchToken('<=')) {
          operators.push('<=');
          i += 2;
          continue;
        }
        operators.push('<');
        i++;
        continue;
      }

      if (code === codes['>']) {
        if (matchToken('>>>')) {
          operators.push('>>>');
          i += 3;
          continue;
        }
        if (matchToken('>>')) {
          operators.push('>>');
          i += 2;
          continue;
        }
        if (matchToken('>=')) {
          operators.push('>=');
          i += 2;
          continue;
        }
        operators.push('>');
        i++;
        continue;
      }

      if (code === codes['=']) {
        if (matchToken('===')) {
          operators.push('===');
          i += 3;
          continue;
        }
        if (matchToken('==')) {
          operators.push('==');
          i += 2;
          continue;
        }
      }

      if (code === codes['&']) {
        if (matchToken('&&')) {
          operators.push('&&');
          i += 2;
          continue;
        }
        operators.push('&');
        i++;
        continue;
      }

      if (code === codes['^']) {
        operators.push('^');
        i++;
        continue;
      }

      if (code === codes['|']) {
        if (matchToken('||')) {
          operators.push('||');
          i += 2;
          continue;
        }
        operators.push('|');
        i++;
        continue;
      }

      if (code === codes['?']) {
        // find :
        const start = i;
        const colonIndex = getCodeIndex(input, start, codes[':']);
        cleanUp();
        consumeConditionalExpression(
          new astFactory.ConditionalExpression(
            expressionStatement.expression,
            parseExpressionStatement(start + 1, colonIndex).expression,
            parseExpressionStatement(colonIndex + 1, endIndex).expression
          )
        );
        i = endIndex;
        break;
      }

      if (code === codes[',']) {
        // sequence or array or object
        i++;
        break;
      }

      if (code === codes[';']) {
        // next statement
        i++;
        continue;
      }

      throwError('Unexpected token: ' + String.fromCharCode(code));
    }

    cleanUp();

    if (operators.length) {
      throwError('Error operators: ' + operators.join(', '));
    }
    return expressionStatement;

    function cleanUp() {
      if (astFactory.isUpdateExpressionOperator(operators[0])) {
        // trailing ++ or --
        setPostfixUpdateOperator(expressionStatement, operators[0]);
        operators.pop();
      }

      // support sequence expression
      if (input.charCodeAt(i - 1) === codes[',']) {
        // is sequence expression
        expressionStatement.expression = new astFactory.SequenceExpression([
          expressionStatement.expression,
        ]);
        while (i < endIndex) {
          const expr = parseExpressionStatement(i, endIndex);
          expressionStatement.expression.expressions.push(expr.expression);
        }
      }
    }

    function consumeParenNodes(expr) {
      if (operators.length === 0 && expressionStatement !== null) {
        return consumeCallExpression(expr);
      }
      expr.paren = true;
      return consumeNode(expr);
    }

    function consumeNode(node) {
      if (expressionStatement === null) {
        while (
          astFactory.isUnaryExpressionOperator(operators[operators.length - 1])
        ) {
          const operator = operators.pop();
          node = new astFactory.UnaryExpression(operator, node);
        }
        expressionStatement = new astFactory.ExpressionStatement(node);

        if (astFactory.isUpdateExpressionOperator(operators[0])) {
          expressionStatement = new astFactory.ExpressionStatement(
            new astFactory.UpdateExpression(operators[0], node, true)
          );
          return (operators = []);
        }
        return (expressionStatement = new astFactory.ExpressionStatement(node));
      }

      if (astFactory.isBinaryExpressionOperator(operators[0])) {
        node = consumeSecondOperator(node);
        consumeBinaryExpression(node);
        return (operators = []);
      }
      if (astFactory.isLogicalExpressionOperator(operators[0])) {
        node = consumeSecondOperator(node);
        consumeLogicalExpression(node);
        return (operators = []);
      }
      throwError('Unexpected operators: ' + operators.join(', '));
    }

    function consumeConditionalExpression(expr) {
      expressionStatement.expression = expr;
    }

    function consumeCallExpression(expr) {
      let exprs = [];
      if (expr.type === astTypes.SEQUENCE_EXPRESSION) {
        exprs = expr.expressions;
      } else {
        exprs = [expr];
      }

      // expressionStatement.expression = new astFactory.CallExpression(
      //   expressionStatement.expression,
      //   exprs
      // );

      //20230814 bluie add mod callExpression
      const parent = findBottomRightParentNode(
        expressionStatement,
        shouldBreak
      );

      switch (parent.type) {
        case astTypes.EXPRESSION_STATEMENT:
          parent.expression = new astFactory.CallExpression(
            parent.expression,
            exprs,
          );
          break;
        case astTypes.BINARY_EXPRESSION:
        case astTypes.LOGICAL_EXPRESSION:
          parent.right = new astFactory.CallExpression(
            parent.right,
            exprs,
          );
          break;
        case astTypes.UNARY_EXPRESSION:
        case astTypes.UPDATE_EXPRESSION:
          parent.argument = new astFactory.CallExpression(
            parent.argument,
            exprs,
          );
          break;
        default:
          throwError('Unexpected parent.type: ' + parent.type);
      }

      function shouldBreak(ast) {
        return (
          ast.paren ||
          ast.type === astTypes.MEMBER_EXPRESSION ||
          ast.type === astTypes.ARRAY_EXPRESSION
        );
      }
      // debugger

    }

    function consumeBinaryExpression(node) {
      const parent = findBottomRightParentNode(
        expressionStatement,
        shouldBreak
      );

      switch (parent.type) {
        case astTypes.EXPRESSION_STATEMENT:
          parent.expression = new astFactory.BinaryExpression(
            operators[0],
            parent.expression,
            node
          );
          break;
        case astTypes.BINARY_EXPRESSION:
        case astTypes.LOGICAL_EXPRESSION:
          parent.right = new astFactory.BinaryExpression(
            operators[0],
            parent.right,
            node
          );
          break;
        default:
          throwError('Unexpected parent.type: ' + parent.type);
      }

      function shouldBreak(ast) {
        return (
          ast.paren ||
          ast.type === astTypes.CALL_EXPRESSION ||
          ast.type === astTypes.MEMBER_EXPRESSION ||
          ast.type === astTypes.UPDATE_EXPRESSION ||
          ast.type === astTypes.UNARY_EXPRESSION ||
          ((ast.type === astTypes.BINARY_EXPRESSION ||
            ast.type === astTypes.LOGICAL_EXPRESSION) &&
            binaryOperatorPrecedences[ast.operator] >=
              binaryOperatorPrecedences[operators[0]])
        );
      }
    }

    function consumeLogicalExpression(node) {
      const parent = findBottomRightParentNode(
        expressionStatement,
        shouldBreak
      );

      switch (parent.type) {
        case astTypes.EXPRESSION_STATEMENT:
          parent.expression = new astFactory.LogicalExpression(
            operators[0],
            parent.expression,
            node
          );
          break;
        case astTypes.BINARY_EXPRESSION:
        case astTypes.LOGICAL_EXPRESSION:
          parent.right = new astFactory.LogicalExpression(
            operators[0],
            parent.right,
            node
          );
          break;
        default:
          throwError('Unexpected parent.type: ' + parent.type);
      }

      function shouldBreak(ast) {
        return (
          ast.paren ||
          ast.type === astTypes.MEMBER_EXPRESSION ||
          ast.type === astTypes.UPDATE_EXPRESSION ||
          ast.type === astTypes.UNARY_EXPRESSION ||
          ((ast.type === astTypes.BINARY_EXPRESSION ||
            ast.type === astTypes.LOGICAL_EXPRESSION) &&
            binaryOperatorPrecedences[ast.operator] >=
              binaryOperatorPrecedences[operators[0]])
        );
      }
    }

    function consumeMemberExpression(expr, computed) {
      const parent = findBottomRightParentNode(
        expressionStatement,
        shouldBreak
      );

      switch (parent.type) {
        case astTypes.EXPRESSION_STATEMENT:
          parent.expression = new astFactory.MemberExpression(
            parent.expression,
            expr,
            computed
          );
          break;
        case astTypes.BINARY_EXPRESSION:
        case astTypes.LOGICAL_EXPRESSION:
          parent.right = new astFactory.MemberExpression(
            parent.right,
            expr,
            computed
          );
          break;
        case astTypes.UNARY_EXPRESSION:
        case astTypes.UPDATE_EXPRESSION:
          parent.argument = new astFactory.MemberExpression(
            parent.argument,
            expr,
            computed
          );
          break;
        default:
          throwError('Unexpected parent.type: ' + parent.type);
      }

      function shouldBreak(ast) {
        return (
          ast.paren ||
          ast.type === astTypes.MEMBER_EXPRESSION ||
          ast.type === astTypes.ARRAY_EXPRESSION
        );
      }
    }

    function consumeSecondOperator(node) {
      if (operators[1]) {
        if (astFactory.isUnaryExpressionOperator(operators[1])) {
          node = new astFactory.UnaryExpression(operators[1], node);
        } else if (astFactory.isUpdateExpressionOperator(operators[1])) {
          node = new astFactory.UpdateExpression(operators[1], node, true);
        } else {
          throwError('Unexpected operator: ' + operators[1]);
        }
        operators[1] = undefined;
      }
      return node;
    }

    function getIdentifier() {
      const start = i;
      let code;
      while (i < input.length) {
        i++;
        code = input.charCodeAt(i);
        if (isIdentifierEnd(code)) {
          break;
        }
      }
      return input.slice(start, i);
    }

    function matchToken(token) {
      for (let t = 0; t < token.length; t++) {
        if (token.charCodeAt(t) !== input.charCodeAt(i + t)) {
          return false;
        }
      }
      return true;
    }

    function consumeArrayExpression(_startIndex, _endIndex) {
      // [1,[2,3]]
      i = _startIndex;
      let start = i;
      const arrayExpression = new astFactory.ArrayExpression([]);
      while (i < _endIndex) {
        let code = input.charCodeAt(i);
        if (code === codes[',']) {
          arrayExpression.elements.push(
            parseExpressionStatement(start, i).expression
          );
          start = i + 1;
        }
        i++;
      }
      if (start !== i) {
        // support `[]`
        arrayExpression.elements.push(
          parseExpressionStatement(start, i).expression
        );
      }
      consumeNode(arrayExpression);
    }
  }
};

function throwError(message) {
  throw new Error(message);
}

function getStringEndIndex(startCode, startIndex, input) {
  let i = startIndex;
  let code;
  while (i < input.length) {
    i++;
    code = input.charCodeAt(i);
    if (code === codes['\\']) {
      i++;
      continue;
    }
    if (code === startCode) {
      break;
    }
  }
  return i;
}

function isIdentifierStart(code) {
  // a-z A-Z _ $
  return (
    (code >= codes.a && code <= codes.z) ||
    (code >= codes.A && code <= codes.Z) ||
    code === codes._ ||
    code === codes.$
  );
}

function isIdentifierEnd(code) {
  // !a-z !A-Z !0-9 !_ !$
  return (
    (code < codes.a || code > codes.z) &&
    (code < codes.A || code > codes.Z) &&
    (code < codes['0'] || code > codes['9']) &&
    code !== codes._ &&
    code !== codes.$
  );
}

function isNumber(code) {
  return code >= codes['0'] && code <= codes['9'];
}

function isStringStart(code) {
  return code === codes['"'] || code === codes["'"];
}

function isWhiteSpace(code) {
  return (
    code === codes[' '] ||
    code === codes['\n'] ||
    code === codes['\r'] ||
    code === codes['\r\n'] ||
    code === codes['\t']
  );
}

function setPostfixUpdateOperator(root, operator) {
  const parent = findBottomRightParentNode(root, shouldBreak);

  switch (parent.type) {
    case astTypes.EXPRESSION_STATEMENT:
      checkIdentifier(parent.expression);
      parent.expression = new astFactory.UpdateExpression(
        operator,
        parent.expression,
        false
      );
      break;
    case astTypes.BINARY_EXPRESSION:
    case astTypes.LOGICAL_EXPRESSION:
      checkIdentifier(parent.right);
      parent.right = new astFactory.UpdateExpression(
        operator,
        parent.right,
        false
      );
      break;
    case astTypes.UNARY_EXPRESSION:
      checkIdentifier(parent.argument);
      parent.argument = new astFactory.UpdateExpression(
        operator,
        parent.argument,
        false
      );
      break;
    case astTypes.CONDITIONAL_EXPRESSION:
      checkIdentifier(parent.alternate);
      parent.alternate = new astFactory.UpdateExpression(
        operator,
        parent.alternate,
        false
      );
      break;
    default:
      throwError('Unexpected parent.type: ' + parent.type);
  }

  function shouldBreak(ast) {
    return ast.type === astTypes.MEMBER_EXPRESSION;
  }

  function checkIdentifier(node) {
    if (
      node.type !== astTypes.IDENTIFIER &&
      node.type !== astTypes.MEMBER_EXPRESSION
    ) {
      throwError('Update operator only works on identifier nodes');
    }
  }
}

function findBottomRightParentNode(root, shouldBreak) {
  let parent = null;
  let node = root;
  traverse(node, visitor);
  return parent;

  function visitor(_node, _parent) {
    node = _node;
    parent = _parent;
    if (shouldBreak(_node)) {
      return false;
    }
  }
}

function getCodeIndex(input, startIndex, toCode) {
  let i = startIndex;
  let code;

  let parenDepth = 0;
  let computedMemberAccessDepth = 0;

  while (i < input.length) {
    i++;
    code = input.charCodeAt(i);
    if (code === codes["'"] || code === codes['"']) {
      i = getStringEndIndex(code, i, input);
      continue;
    }
    if (code === codes['(']) {
      parenDepth++;
      continue;
    }
    if (code === codes[')']) {
      parenDepth--;
      if (parenDepth < 0) {
        if (toCode === code) {
          break;
        }
        throwError('Unexpected token: ' + String.fromCharCode(code));
      }
      continue;
    }
    if (code === codes['[']) {
      computedMemberAccessDepth++;
      continue;
    }
    if (code === codes[']']) {
      computedMemberAccessDepth--;
      if (computedMemberAccessDepth < 0) {
        if (toCode === code) {
          break;
        }
        throwError('Unexpected token: ' + String.fromCharCode(code));
      }
      continue;
    }
    if (
      code === toCode &&
      parenDepth === 0 &&
      computedMemberAccessDepth === 0
    ) {
      break;
    }
  }

  return i;
}
