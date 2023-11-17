
const path = require("path");
module.exports = function replaceDebugInfo(
  content,
  filename,
  targetPlatform
) {
  if (!content) return content;

  replacedOffsest = 0;

  

  let regRep = /require[\s]*\(['"](.*)\/target_compile_platform\.js['"][\s]*\)/g;

  let rp;
  // let needReplacedFiles = [];
  while((rp = regRep.exec(content))) {
    
    var replaceText = rp[0];
    var subString = content.substr(0, rp.index);
    var letIndex = subString.lastIndexOf("let ");
    var constIndex = subString.lastIndexOf("const ");
    var varIndex = subString.lastIndexOf("var ");

    var startIndex = Math.max(letIndex, constIndex, varIndex);

    var endIndex =  rp.index + rp[0].length;
    var totalReplaceText = content.substring(startIndex, endIndex);

    let moduleName = (path.resolve(filename.substring(0, filename.lastIndexOf("/")) ,rp[1] + "/target_compile_platform.js"));
    // console.log(`moduleName:` + moduleName + ' filename' + filename + 'rp[1]' + rp[1])
    let oldCL = console.log;
    console.log = () => {};
    // console.log(filename)
    let m = require(moduleName);
    console.log = oldCL;

    let requireContent = totalReplaceText.substring(totalReplaceText.indexOf(" "), totalReplaceText.indexOf("require"));

    requireContent = requireContent.trim();

    const memberMode = (requireContent.includes("{"));
    let mKeys = Object.keys(m);
    mKeys.sort();
    mKeys = mKeys.reverse();
    const targetKey = "IS_" + targetPlatform;

    if (memberMode) {
      
      for (let key of mKeys) {
        let value = targetKey === key ? 1 : 0;
        let replaceString = "" + value;
        replaceString += "/*";
  
        replaceString += key.substring(replaceString.length, key.length);
  
        totalReplaceText = totalReplaceText.replace(
          new RegExp(key,"g"), replaceString
        )
  
      }
    } else {
      requireContent = requireContent.substring(0, requireContent.indexOf('=')).trim();
    }
    

    let newText = totalReplaceText.replace(/\*\//g, "**");
    newText = newText.replace(/require/g, "REQ_INL");
    newText = "/*" + newText.substr(2, newText.length - 4) + "*/"
    content = content.substr(0, startIndex) + newText + content.substr(endIndex);
    // debugger;
     //callback(rp.index, rp.index + rp[0].length, rp[0]);

      
     for (let key of mKeys) {
       
      let value = targetKey === key ? 1 : 0;
      let replaceString;
      let originalString = memberMode ? key : `${requireContent}.${key}`;

      let originalStringN = "!"+originalString;
      replaceString = "/*"
      replaceString += originalStringN.substring(5);
      replaceString += "*/";
      replaceString += (1 - value);
      if (originalStringN.length !== replaceString.length) {
        console.warn("replace will cause different coloum");
      }

      let repIndex = 0;
      while((repIndex = content.indexOf(originalStringN, repIndex)) !== -1) {
        content = content.substring(0, repIndex) + replaceString + content.substring(repIndex + originalStringN.length);
        repIndex += replaceString.length - originalStringN.length;
      }



      replaceString = "/*"
      replaceString += originalString.substring(5);
      replaceString += "*/";
      replaceString += value;
      if (originalString.length !== replaceString.length) {
        console.warn("replace will cause different coloum");
      }
      repIndex = 0;
      while((repIndex = content.indexOf(originalString, repIndex)) !== -1) {
        content = content.substring(0, repIndex) + replaceString + content.substring(repIndex + originalString.length);
        repIndex += replaceString.length - originalString.length;
      }

    }

  }

  if (
      (targetPlatform === "BROWSER" || targetPlatform === "NODE")
    &&(content.includes("IS_VUE") || content.includes("IS_REACT"))
  ) {
    
    let repIndex;
    let replaceString;
    let originalString;

    content = content.replace(/(const|var|let)[\s]+(IS_REACT|IS_VUE)/g, 
      function (r) {

        return "//" + r.substring(2);
      }
    );

    
    repIndex = 0;
    originalString = "IS_REACT";
    replaceString = "/*REA*/" + (process.env.USE_VDOM === "VUE" ? 0 : 1);
    while((repIndex = content.indexOf(originalString, repIndex)) !== -1) {
      content = content.substring(0, repIndex) + replaceString + content.substring(repIndex + originalString.length);
      repIndex += replaceString.length - originalString.length;
    }

    repIndex = 0;
    originalString = "IS_VUE";
    replaceString = "/**/" + (process.env.USE_VDOM === "VUE" ? 1 : 0);
    while((repIndex = content.indexOf(originalString, repIndex)) !== -1) {
      content = content.substring(0, repIndex) + replaceString + content.substring(repIndex + originalString.length);
      repIndex += replaceString.length - originalString.length;
    }
  }

  content = content.replace(/\*\/1[\s]+&&/g, " 1 &&*/");
  content = content.replace(/\n([^\n]*)\/\*[A-Za-z0-9_]*\*\/0[\s]+&&/g, 
    function (totalText, checker) {
      if (totalText) {
        if (checker.trim() === "") {
          return totalText.replace(/\*\/0[\s]+&&/, "*/;//0");
        } else {
          return totalText;
        }
      }
    }
  );



  return content;
};
