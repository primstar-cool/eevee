function ASSERT (flag, ...args) {
    if (!flag) {
        debugger
        throw new Error(...args);
    }
}

const defaultGetImportedStyleContent = require('../../helpers/get_imported_style_content.js');

module.exports = function dumpCssNode(
    root,
    {
      srcFilePath,
      destFilePath,
      rootSrcPath,
      mainClassName,
      getImportedStyleContentFn,
      minifyCss,
      nodeString
    } = {}
) {
    let destFileDict = {};
    /////////////////deal with style////////////////

    const processorCssObj = require("../../../processor/processor_css_obj/convertor/index.js");
    const exporterCss = require("../../../exporter/exporter_css.js");

    let styleNodes =  root.childNodes.filter(v=>v.tagName === 'style')
    styleNodes.forEach(
      n=> {
          if (n.convertedStyle) return;

          processorCssObj(n.styleContent, n.src, n.sourceType, "BROWSER", getImportedStyleContentFn || defaultGetImportedStyleContent(styleNodes, rootSrcPath));
          
          n.convertedStyle = exporterCss(n.styleContent, minifyCss);
      }
    )

    let allRules = styleNodes.map(v=>v.styleContent.stylesheet.rules).flat();
    let ruleDict = {};
    let allRulesUnDup = [];

    allRules.forEach(
      v => {
        let key = JSON.stringify(v);
        if (!ruleDict[key]) {
          ruleDict[key] = 1;
          allRulesUnDup.push(v);
        }
      }
    )

    // debugger

    let cssMerged;
    if (styleNodes[0]) {
        cssMerged = styleNodes.map(v=>v.convertedStyle).join("\n\n");

        let styleString = `${
            cssMerged.includes("rem;") ? "html{-webkit-text-size-adjust:none;font-size:13.33333vw ": ""
        }${
            root.sourceType==='wxmp'?"body,html {width: 100%; margin: 0 auto;}":""
        }${
            nodeString.includes("wxmp-text")?".wxmp-text {white-space: pre-wrap}":''
        }${
            nodeString.includes("wxmp-view")?".wxmp-view {-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;outline: none;-webkit-tap-highlight-color: transparent}":''
        }`;

        destFileDict[`${mainClassName}.head-seg.html`] = `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
        ${
        styleString ? `<style>${styleString}</style>\n`:"" 
        }<script>function r(){var b=document.documentElement;b.style.fontSize=b.clientWidth>768?"102.4px":"13.33333vw"}r();window.addEventListener('resize',r);</script>`;

        destFileDict[`${mainClassName}.css`] = cssMerged;
    } 

    return destFileDict;
}

