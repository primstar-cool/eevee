
const path = require("path");
module.exports = function replaceDebugInfo(
  content,
  filename,
  regExp,
  remainClass
) {
  // debugger
  if (!content) return content;

  replacedOffsest = 0;
  var bannerFunctionText = {};
  
  if(!regExp) {
    regExp = /require[\s]*\([\s]*(\"|\')([^\"^\']+)\/ENUM(\/[^\.]+\.js)(\"|\')[\s]*\)/g;
    // regExp = /require[\s]*\([\s]*(\"|\')([^\"^\']+)(\/[A-Z0-9]+\.js)(\"|\')[\s]*\)/g;
  }

  let rp;
  // let needReplacedFiles = [];
  while((rp = regExp.exec(content))) {
    var replaceText = rp[0];
    var subString = content.substr(0, rp.index);
    var letIndex = subString.lastIndexOf("let ");
    var constIndex = subString.lastIndexOf("const ");
    var varIndex = subString.lastIndexOf("var ");

    const startIndex = Math.max(letIndex, constIndex, varIndex);

    const endIndex =  rp.index + rp[0].length;
    var totalReplaceText = content.substring(startIndex, endIndex);
    var modulePath = replaceText.substr(replaceText.indexOf("require") + 7).trim();
    modulePath = eval(modulePath);// " "

    let moduleName = (path.resolve(path.dirname(filename), modulePath));
    let moduleShortName = path.basename(moduleName).replace(/\./g, "_");
    let m = require(moduleName);

    let requireContent = totalReplaceText.substring(totalReplaceText.indexOf(" "), totalReplaceText.indexOf("require"));

    requireContent = requireContent.trim();

    const memberMode = (requireContent.includes("{"));
    let mKeys = Object.keys(m);
    mKeys = mKeys.sort();
    mKeys = mKeys.reverse();

    if (memberMode) {
      
      for (let key of mKeys) {
        let value = m[key];
        let replaceString = "" + value;
        replaceString += "/*";
  
        replaceString += key.substring(replaceString.length, key.length - 2);
        replaceString += "**";
  
        totalReplaceText = totalReplaceText.replace(
          new RegExp(key,"g"), replaceString
        )
      }
    } else {
      requireContent = requireContent.substring(0, requireContent.indexOf('=')).trim();
    }
    
    if (!remainClass) {
      let newText = totalReplaceText.replace(/\*\//g, "**");
      newText = newText.replace(/require/g, "REQUIRE");
      newText = "/*" + newText.substr(2, newText.length - 4) + "*/"
      content = content.substr(0, startIndex) + newText + content.substr(endIndex);
    }
    
    // debugger;
     //callback(rp.index, rp.index + rp[0].length, rp[0]);

      
     for (let key of mKeys) {
      let value = m[key];

      const isFunctionReplace = typeof value === 'function';

      if (isFunctionReplace && remainClass) {
        continue;
      } 
      if (typeof value !== 'number' && typeof value !== 'string' && !isFunctionReplace) {
        debugger
        throw new Error("can't replace enum:" + totalReplaceText + "[" + key + "]");
        continue;
      } 
      let replaceString;
      if (isFunctionReplace) {
        replaceString = moduleShortName + "_" + key;
      } else if (typeof value === 'string') {
        replaceString = '"' + value + '"';
      } else if (typeof value === 'number') {
        replaceString = "" + value;
      } 
      
      if (!isFunctionReplace) {
        replaceString += "/*";

      }

      let originalString = memberMode ? key : `${requireContent}.${key}`;

      if (!isFunctionReplace) {
        replaceString += originalString.substring(replaceString.length+2);
        replaceString += "*/";
      }

      let repIndex;
      
      if (!remainClass) {
        repIndex = endIndex;
      } else {
        repIndex = 0;
      }
     

      if (originalString.length !== originalString.length && !isFunctionReplace) {
        console.warn("replace will cause different coloum");
      }
      // if((repIndex = content.indexOf(originalString)) !== -1)
      //   content = content.replace(
      //   new RegExp(memberMode ? key : requireContent+"\\."+key,"g"), replaceString
      // );

      while((repIndex = content.indexOf(originalString, repIndex)) !== -1) {

        if (isFunctionReplace && !bannerFunctionText[replaceString]) {
          bannerFunctionText[replaceString] = `function ${moduleShortName}_` + value.toString().replace("=>", "");
        }

        content = content.substring(0, repIndex) + replaceString + content.substring(repIndex + originalString.length);
        repIndex += replaceString.length - originalString.length;
      }

    }
  }

  if (Object.keys(bannerFunctionText).length) {
    let funcs = "";
    for (let fKey in bannerFunctionText) {
      funcs += `/*dumped enum function ${fKey}*/\n` + bannerFunctionText[fKey] + "\n";
    }
    return content + "\n" + funcs;
  } else {
    return content;
  }

};
