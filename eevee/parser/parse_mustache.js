/**
 * @since 20180905 14:26
 * @author ___xy
 */

function parse(input, javascript) {

  if (!input) debugger
  let expression = null;
  let i = 0;
  let string = '';

  const braceLeft = '{'.charCodeAt(0);
  const braceRight = '}'.charCodeAt(0);
  const doubleQuote = '"'.charCodeAt(0);
  const singleQuote = "'".charCodeAt(0);
  const backSlash = '\\'.charCodeAt(0);

  while (i < input.length) {
    const code = input.charCodeAt(i);

    if (code === braceLeft && input.charCodeAt(i + 1) === braceLeft) {
      /**
       * {{ ........... }}
       * |              |
       * startIndex     endIndex
       */
      const endIndex = findMustacheEnd(i + 2);
      const program = javascript.parse(input.slice(i + 2, endIndex));
      if (
        !program.body ||
        program.body.length !== 1 ||
        program.body[0].type !== javascript.astTypes.EXPRESSION_STATEMENT
      ) {
        throw new Error('Should have a single expression statement.');
      }
      const expr = program.body[0].expression;
      expr.mustache = true;
      if (!expression && !string) {
        // {{expr}}
        expression = expr;
      } else if (!expression && string) {
        // str{{expr}}
        expression = new javascript.astFactory.BinaryExpression(
          '+',
          new javascript.astFactory.Literal(string),
          expr
        );
        string = '';
      } else if (string) {
        // {{v}}str{{expr}}
        expression = new javascript.astFactory.BinaryExpression(
          '+',
          new javascript.astFactory.BinaryExpression(
            '+',
            expression,
            new javascript.astFactory.Literal(string)
          ),
          expr
        );
        string = '';
      } else {
        // {{v}}{{expr}}
        expression = new javascript.astFactory.BinaryExpression(
          '+',
          expression,
          expr
        );
      }
      i = endIndex + 2;
      continue;
    }

    string += input.charAt(i);
    i++;
  }

  if (string && !expression) {
    return new javascript.astFactory.Literal(string);
  }

  if (string) {
    return new javascript.astFactory.BinaryExpression(
      '+',
      expression,
      new javascript.astFactory.Literal(string)
    );
  }

  return expression;

  function findMustacheEnd(startIndex) {
    let index = startIndex;
    let code = null;
    let quote = null;
    let extraBraceLeft = 0;
    while (index < input.length) {
      code = input.charCodeAt(index);
      if (code === doubleQuote || code === singleQuote) {
        if (!quote) {
          quote = code;
        } else if (quote === code) {
          quote = null;
        }
        index++;
        continue;
      }
      if (quote && code === backSlash) {
        // 忽略字符串中的 \*
        index += 2;
        continue;
      }

      if (!quote) {
        if (code === braceLeft) {
          extraBraceLeft++;
        } else if (code === braceRight) {
          if (extraBraceLeft) {
            extraBraceLeft--;
          } else {
            if (
              input.charCodeAt(index + 1) === braceRight
            ) {
              return index;
            }
          }
        }
      }

      index++;
    }
    return index;
  }
}

function serialize(ast) {
  if (ast.mustache) {
    delete ast.mustache;
    return `{{${javascript.serialize(ast)}}}`;
  }

  if (
    ast.type === javascript.astTypes.BINARY_EXPRESSION &&
    ast.operator === '+'
  ) {
    return `${serialize(ast.left)}${serialize(ast.right)}`;
  }

  if (ast.type === javascript.astTypes.LITERAL) {
    return ast.value;
  }

  return javascript.serialize(ast);
}

exports.parse = parse;
exports.serialize = serialize;
