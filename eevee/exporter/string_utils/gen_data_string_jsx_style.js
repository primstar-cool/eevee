module.exports = function genDataString(data, functionArray, expanedMode) {
    if (!data) return null;
  
    let dataString = data;
  
    if (typeof dataString === "object")
      return getObjectDataExpression(dataString, functionArray);
  
    if (dataString.startsWith("<!--")) {
      if (expanedMode) {
        return null + `/*${dataString}*/`;
      } else {
        return `/*${dataString}*/`;
      }
    }
  
    return JSON.stringify(dataString)
  
  }