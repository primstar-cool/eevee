module.exports = getObjectDataExpression;

function getObjectDataExpression(expression, functionArray) {
  if (!expression) return null;

  if (typeof expression === 'string') return JSON.stringify(expression);
  else if (typeof expression !== 'object') return expression;


  if (expression.type === "Literal") {
    return `${typeof expression.value === "string" ? JSON.stringify(expression.value) : expression.value}`;
  } else if (expression.type === "MappedFunc") {

    return functionArray[expression.fnId]
    //ASSERT(domainFunc && domainFunc[expression.fnId]);
    // if (domainFunc && domainFunc[expression.fnId])
    //   return domainFunc[expression.fnId](domainData);
    // else
    //   return undefined;
  } else if (expression.type === "Identifier") {

    var expName = expression.name;

    if (typeof expName === 'string') {
      // debugger
      if (expName.match(/[a-zA-Z_][a-zA-Z0-9_]*/)) {
        return "_cONTEXT." + expName;
      } else {
        return `_cONTEXT[${JSON.stringify(expName)}]`;

      }
    } else {
      return `_cONTEXT[${expName}]`;
    }

  } else if (expression.type === "BinaryExpression") {
    //key add
    return "(" + getObjectDataExpression(expression.left, functionArray) + expression.operator + getObjectDataExpression(expression.right, functionArray) + ")"
  } else {
    throw new Error("unknwon type:" + expression.type);
    return undefined;
  }
}

  