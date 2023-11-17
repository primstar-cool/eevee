
// const remove_untarget_platform_func = require("../processor/processor_wxss_string/remove_untarget_platform_func.js");
const cssParse = require("./parse_css_like/index.js");
const path = require("path");

module.exports = function (
  cssContent,
  filePath = undefined,
  rootSrcPath = undefined,
  readFileFn = null,
  hooks = {processBeforeParseStyle: null, processAfterParseStyle: null},
  processImport = true
) {

  if (hooks && hooks.processBeforeParseStyle) {
      content = hooks.processBeforeParseStyle(cssContent);
  }

  if (!rootSrcPath && filePath) {
    rootSrcPath = path.dirname(filePath);
  }

    // debugger
    // if (cssPath.includes("home.wxsss")) debugger
    // cssContent = remove_untarget_platform_func(cssContent, targetEnv)
   
    let allImportNodes = {
      [filePath]: cssContent
    }

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

    let resultNodes = [];
    let processd = {};

    while (resultNodes.length < Object.keys(allImportNodes).length) {
      Object.keys(allImportNodes).forEach (key => {

        if (processd[key]) return

        let ret =  {
          tagName: "style",
          sourceType: key.substring(key.lastIndexOf(".") + 1),
          styleContent: cssParse(allImportNodes[key]),
          src: path.relative(rootSrcPath, key)
        }
        resultNodes.push(ret)
        processd[key] = 1;

        if (processImport)
          _findImport(allImportNodes[key], ret.styleContent, key, rootSrcPath, allImportNodes, readFileFn, processImport);
        
      });
    }
      

    if (hooks && hooks.processAfterParseStyle) {
      hooks.processAfterParseStyle(resultNodes);
  }

    return resultNodes;

}

function _findImport(cssContent, contentObject, filePath, rootSrcPath, allImportNodes, readFileFn, processImport) {
  var importPath;

  if (contentObject && contentObject.stylesheet) {

    if (contentObject.stylesheet.rules) {
      contentObject.stylesheet.rules.forEach(
        (r, index) => {
          if (r.type === 'import') {
            _onFindAImport(eval(r.import));
          }
        }
      )
    }
    

  } else if (cssContent) {

    const regEpx = /@import\s+[\'|\"]([^\"^\']+)[\'|\"][;]*([^\n]*)/g;
    let r;
    while ((r = regEpx.exec(cssContent))) {
      // debugger
      _onFindAImport(r[1]);
    
    }
  }

  function _onFindAImport(inPath) {
  
    if (inPath.startsWith("/")) { 
      importPath = path.resolve(rootSrcPath||'./', "." + inPath);
    } else {
      importPath = path.resolve(filePath ? path.dirname(filePath) : './', inPath);
    }

    if (!allImportNodes[importPath]) {
      allImportNodes[importPath] = readFileFn(importPath);
    }
  }

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

