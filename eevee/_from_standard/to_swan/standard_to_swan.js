
function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}
const path = require("path");

module.exports = function (node, 
  config = {
    env: "SWAN",
    hooks: {
      processBeforeConvert: undefined,
      processAfterConvert: undefined,
    },
    readFileFn: undefined,
    srcFilePath: undefined,
    destFilePath: undefined,
    mainClassName: undefined,
    resolveAssetsPathFn: undefined, // function mapping local assets path (wxmp)
    getIncludedStandardTreeFn: undefined, // function how to get include tree, if stardtree does not  containe external-include tree.
    minifyCss: undefined,
    minifyXml: undefined,
    screenWidthRem: undefined
  }
  
  ) {


  if (!node || !node.childNodes) return node;

  let templateNode = node.childNodes.find(v=>v.tagName === 'template');

  if (!node.hasOwnProperty("parentNode")) {
    require("../../processor/processor_xml_obj/append_parent_node.js")(templateNode, null);
  }
  require("../../processor/processor_xml_obj/remove_envif.js")(templateNode, config.env || "SWAN");
  require("../../processor/processor_xml_obj/remove_constif.js")(templateNode, config.env || "SWAN");
  
  // debugger
  if (config && config.hooks && hooks.processBeforeConvert) {
      hooks.processBeforeConvert(node);
  }

  let {readFileFn, srcFilePath, destFilePath = "", mainClassName = ""} = config||{};


  if (!mainClassName) {
    if (destFilePath) {
      mainClassName = destFilePath.substring(destFilePath.lastIndexOf("/") + 1);
      mainClassName = mainClassName[0].toLowerCase() + mainClassName.substr(1);
    } else {
      let str = JSON.stringify(node);
      mainClassName = require("../helpers/gen_anony_classname.js")(str);
    }
  }
  let destFileDict = {}

  /////////////////deal with context////////////////
  let contextNode = node.childNodes.find(v=>v.tagName === 'context');
  // debugger
  if (contextNode) {
    require("../to_wxmp/task/process_context.js")(
      contextNode,
      templateNode,
      mainClassName,
      destFileDict
    )
  }
 
  
  /////////////////deal with template////////////////
  let screenWidthRem = config.screenWidthRem;
  if (screenWidthRem === undefined) screenWidthRem = 7.5;
  let referIncludeNode = [];
  require("./task/standard_to_swan_object.js")(templateNode, 
    {
      srcFilePath,
      destFilePath,
      mainClassName,
      screenWidthRem,
      getIncludedStandardTreeFn: (node, src, parentSrc, rootSrcPath, rootDestPath) => {
        
        let retNode;
        if (config.getIncludedStandardTreeFn) {
          
          retNode = config.getIncludedStandardTreeFn(node , src, parentSrc, rootSrcPath, rootDestPath);
        } else {
          retNode = node.includedContent;
        }

        if (retNode) {
          let childPath = parentSrc ? path.join(path.dirname(parentSrc), src) : src;
          if (rootSrcPath) {
            childPath = path.relative(rootSrcPath, childPath);
          }
          referIncludeNode.push({
            path: src.startsWith("/") ? src.substr(1) : childPath,
            node: node.includedContent,
          });
        }
       
        // debugger
        return retNode;
        
      }
    }
    
  );

  referIncludeNode.unshift(
    {
      path: `${mainClassName}.swan`,
      node: templateNode
    }
  );


  let templateString;
  const exporter_html = require("../../exporter/exporter_html.js")

  referIncludeNode.forEach(
    (pn, idx) => {
      let templateStringInner;
      pn.node.converedContent = exporter_html(templateNode, config.minifyXml);
      templateStringInner = pn.node.childNodes.map(
        sn => exporter_html(sn, config.minifyXml)
      ).join(config.minifyXml ? "" : '\n');


      destFileDict[(pn.path).replace("." + path.extname, ".swan") ] = templateStringInner;
      if (idx === 0) templateString = templateStringInner;

    }
  );




  /////////////////deal with style////////////////
  const processorCssObj = require("../../processor/processor_css_obj/convertor/index.js");
  const exporterCss = require("../../exporter/exporter_css.js");

  let styleNodes =  node.childNodes.filter(v=>v.tagName === 'style')
  styleNodes.forEach(
    n=> {
      if (n.convertedStyle) return;

      processorCssObj(n.styleContent, n.src, n.sourceType, "SWAN");

      n.convertedStyle = exporterCss(n.styleContent, config.minifyCss);

      if (n.src) {
        destFileDict[`${n.src.substr(0, n.src.lastIndexOf("."))}.css`] = n.convertedStyle;
      } else {
        destFileDict[`${mainClassName}.css`] = n.convertedStyle;
      }
    }
  )

  if (config && config.hooks && hooks.processAfterConvert) {
    hooks.processAfterConvert(node);
  }
  
  // debugger

  let cssApp = `${templateString.includes("h5-span") ? ".h5-span {display: inline}" : ''}`;
  cssApp += `${templateString.includes("rn-view") ? ".rn-view {position: relative}" : ''}`;

  if (cssApp) {
    destFileDict[`app.seg.css`] = cssApp;
  }


  if (config && config.hooks && hooks.processAfterConvert) {
    hooks.processAfterConvert(node);
  }

  
  return destFileDict;
  
}
