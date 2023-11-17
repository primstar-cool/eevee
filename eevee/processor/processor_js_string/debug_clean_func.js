
module.exports = function replaceDebugInfo(
  content,
  filename
) {
  if (!content) return content;

  let regRep = /console\.(log|info|debug|warn|error|ASSERT|LOG|WARN|ERROR)\s*\(/g;
  content = content.replace(
    regRep, function(
      rawText
    ) {

    if (rawText.includes("ERROR(")) {
        return rawText.replace("ERROR(", "error(")
    } 
    else if (rawText.includes("WARN(")) {
      return rawText.replace("WARN(", "warn(")
    } 
    else if (rawText.includes("LOG(")) {
          return rawText.replace("LOG(", "log(")
    } 
    else {
        return ";//" + rawText.substr(3)
      }
    }
  );


  let debugStartIndex = 0;
  let debugEndIndex = 0;


  while((debugStartIndex = content.indexOf("/*DEBUG_START*/", debugEndIndex)) !== -1) {

    debugEndIndex = content.indexOf("/*DEBUG_END*/", debugStartIndex + 15) + 13;

    if (debugEndIndex < debugStartIndex) {
      console.error("remove debug error:" + filename);
      break;}

    let substring = content.substring(debugStartIndex + 15, debugEndIndex);
    let matches = substring.match(/\/\*DEBUG_START\*\//g);

    let extraDebugEndNeeded = matches ? matches.length : 0;

    while (extraDebugEndNeeded > 0) {
      let nextDebugEndIndex = content.indexOf("/*DEBUG_END*/", debugEndIndex) + 13;;
      if (nextDebugEndIndex === -1 || nextDebugEndIndex < debugEndIndex) {
        console.error("unpair DEBUG_END:" + filename);
        extraDebugEndNeeded = -1;
        break;
      }
      debugEndIndex = nextDebugEndIndex
      extraDebugEndNeeded--;
    }


    if (extraDebugEndNeeded === -1) {
      break;
    }

    let rawText = content.substring(debugStartIndex, debugEndIndex);
    let replaceText = rawText.replace(/\*\//g, "**");
    replaceText = replaceText.substring(0, replaceText.length-1) + '/';


    // content = content.replace(
    //   rawText, replaceText
    // )//会中括号会有奇怪的错误；

    content = content.substr(0, debugStartIndex) + replaceText + content.substr(debugEndIndex);
    
    
    // callback(debugStartIndex, debugEndIndex, content.substring(debugStartIndex, debugEndIndex));

  }
  
  return content;
};
