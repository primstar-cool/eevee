const less = require('less');
// const remove_untarget_platform_func = require("../processor/processor_wxss_string/remove_untarget_platform_func.js");
const path = require("path");

module.exports = function (
  lessContent,
  filePath = undefined,
  rootSrcPath = undefined,
  readFileFn = null,
  hooks = {processBeforeParseStyle: null, processAfterParseStyle: null},
  processImport = true,
  reserveImport = false,
) {
  
    // debugger
    if (processImport) {
        if (!readFileFn) {
            readFileFn = function (absPath) {
                return require("fs").readFileSync(absPath, "utf8");
            }
        }

        if (!filePath || !rootSrcPath) {
          throw new Error("lack filePath or rootSrcPath!!");
        }     
    }

    const wxssParser = require("./parse_wxss.js");
    let cssContent = lessToCss(lessContent, filePath, rootSrcPath, reserveImport);
    let result = wxssParser(cssContent, filePath, rootSrcPath, 
        (absPath) => {
            let lessContent = readFileFn(absPath);
            let cssConvString = lessToCss(lessContent, absPath, rootSrcPath, reserveImport);
            return cssConvString;
            
        }
        , hooks, processImport
    );

    return result;

}

function lessToCss(lessContent, filePath, rootSrcPath, reserveImport) {

    let replaceArr;
    if (reserveImport) {
        replaceArr = [];
        lessContent = replaceImportToPh(lessContent, replaceArr);
    }    
    
    let cssConvString;

    less.render(
        lessContent, 
        {
            filename: filePath,
            paths: [rootSrcPath],
            syncImport: true,
        },
        (err, output)=> {
            // debugger

            if (err) throw err;

            cssConvString = output.css;
        }
    );

    if (!cssConvString) throw new Error("conv less fail")

    if (reserveImport) {
        cssConvString = replacePhToImport(cssConvString, replaceArr);
    }
    return cssConvString;
}

function replaceImportToPh(cssContent, replaceArr) {

    const importReserveKey = "SPEC_IPT_REV_" + Date.now();

    const regEpx = /@import\s+[\'|\"]([^\"^\']+)[\'|\"][;]*([^\n]*)/g;
    let r;
    while ((r = regEpx.exec(cssContent))) {
    //   debugger
    //   _onFindAImport(r[1]);
        replaceArr.push({raw:r[0]})
    }

    replaceArr.forEach( v => {
        if (!v.raw.startsWith("@import")) throw new Error("parse import error");
        let newStr = "/*!" + importReserveKey + v.raw.substring(7) + "*/";
        v.ph = newStr;
        cssContent = cssContent.replace(v.raw, newStr);
    });
    return cssContent;
}

function replacePhToImport(cssConvString, replaceArr) {
    replaceArr.forEach( v => {
        cssConvString = cssConvString.replace(v.ph, v.raw);
    });

    return cssConvString;
}

// function _replaceImport(cssContent, fromPath, readFileFn, targetEnv) {
//     const path = require("path");
//     cssContent = cssContent.replace(/\/\*[\s]*@import/g, "/*#import");
//     var dest = cssContent.replace(/@import\s+[\'|\"]([^\"^\']+)[\'|\"][;]*([^\n]*)/g, 
//       function(all, inPath, componentInfo) {
//         let componentInfoArray;
//         if (componentInfo && componentInfo.startsWith("/*#component#")) {
//           componentInfoArray = componentInfo.split("#");
//         }

//         var importPath = path.join(fromPath, inPath);
//         var importContent = readFileFn(importPath);
//         importContent = remove_untarget_platform_func(importContent, targetEnv)

//         if (importContent.indexOf("@import") !== -1)
//           importContent = _replaceImport(importContent, path.dirname(importPath), readFileFn, targetEnv);
        
//         if (componentInfoArray) {
//           let componentName = componentInfoArray[componentInfoArray.length - 2];
        
//           const css = require("css");
//           let cssObj = css.parse(importContent);
//           const injectComponentCssFunc = require("../processor/processor_css_obj/convertor/plugins/inject_component_domain.js");
//           injectComponentCssFunc(`.component-${componentName} `)(cssObj);
//           const exporterCss = require("../exporter/exporter_css.js");

//           return "/*import componenet " + importPath + "*/\n" + exporterCss(cssObj);

//         }


//         return "/*import " + importPath + "*/\n" + importContent;
//       }
//     );

//     return dest;
// }

