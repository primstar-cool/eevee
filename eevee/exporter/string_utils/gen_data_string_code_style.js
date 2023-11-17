
const getObjectDataExpression = require("./get_object_data_expression.js");

module.exports = function genDataString(data, functionArray, expanedMode) {
  if (!data) return null;

  let dataString = data;

  if (typeof dataString === "object")
    return getObjectDataExpression(dataString, functionArray);

  if (dataString.startsWith("<!--")) {
    return `/*${dataString}*/`;
  }

  return JSON.stringify(dataString);

}