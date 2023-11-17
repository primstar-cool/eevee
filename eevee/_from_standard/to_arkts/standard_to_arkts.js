const defualtGetImportedStyleContent = require('../helpers/get_imported_style_content.js');

function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}

module.exports = function (node, 
  config = {
    env: "HARMONY",
    hooks: {
      processBeforeConvert: undefined,
      processAfterConvert: undefined,
    },
    readFileFn: undefined,
    srcFilePath: undefined,
    destFilePath: undefined,
    rootSrcPath: undefined,
    mainClassName: undefined,
    resolveAssetsPathFn: undefined, // function mapping local assets path (wxmp)
    getIncludedStandardTreeFn: undefined, // function how to get include tree, if stardtree does not  containe external-include tree.
    getImportedStyleContentFn: undefined,

    functionPaths: undefined,
    functionInject: undefined,
    enableIterObject: undefined,
    hapDesignWidth: 720
  
}) {
    
  let destFileDict = {};
  if (!node || !node.childNodes) return destFileDict;

  let templateNode = node.childNodes.find(v=>v.tagName === 'template');

  if (!node.hasOwnProperty("parentNode")) {
    require("../../processor/processor_xml_obj/append_parent_node.js")(templateNode, null);
  }
  require("../../processor/processor_xml_obj/remove_envif.js")(templateNode, config.env || "HARMONY");
  require("../../processor/processor_xml_obj/remove_constif.js")(templateNode, config.env || "HARMONY");
  
  // debugger
  // debugger
  if (config && config.hooks && hooks.processBeforeConvert) {
      hooks.processBeforeConvert(node);
  }
  let {srcFilePath, rootSrcPath, destFilePath = "", mainClassName = ""} = config||{};
  
  if (!srcFilePath) srcFilePath = './UNNAME.' + node.sourceType;
  // debugger
  if (!rootSrcPath) rootSrcPath = srcFilePath ? require("path").dirname(srcFilePath) : "./";
  

  if (!mainClassName) {
    if (destFilePath) {
      mainClassName = destFilePath.substring(destFilePath.lastIndexOf("/") + 1);
      mainClassName = mainClassName[0].toLowerCase() + mainClassName.substr(1);
    } else {
      let str = JSON.stringify(node);
      mainClassName = require("../helpers/gen_anony_classname.js")(str);
    }
  }
  

  const processorCssObj = require("../../processor/processor_css_obj/convertor/index.js");
  let styleNodes =  node.childNodes.filter(v=>v.tagName === 'style');
  let sourceType = node.sourceType;
  let extraPlugin;
  if (sourceType === "wxmp" || sourceType === "ttma" || sourceType === "ksmp" || sourceType === "swan") {
    extraPlugin = [require("../../processor/processor_css_obj/convertor/plugins/rpx_to_lpx.js")(config.hapDesignWidth)];
  } else if (sourceType === "vue" || sourceType === "react") {
    extraPlugin = [require("../../processor/processor_css_obj/convertor/plugins/rem_to_lpx.js")(7.5, config.hapDesignWidth)];
  }
  
  extraPlugin = (extraPlugin||[]).concat(
    [
      require("../../processor/processor_css_obj/convertor/plugins/vw_to_lpx.js")(config.hapDesignWidth),
      require("../../processor/processor_css_obj/convertor/plugins_extra/background_longhand.js")(),
      require("../../processor/processor_css_obj/convertor/plugins_extra/border_radius_normalize.js")(),
      require("../../processor/processor_css_obj/convertor/plugins_extra/background_image_normalize.js")(),
      require("../../processor/processor_css_obj/convertor/plugins_extra/color_normalize.js")("RGBA"),
    ]
  );

  styleNodes.forEach(
    n=> {
        // if (n.convertedStyle) return;
        processorCssObj(n.styleContent, n.src, n.sourceType, config.env || "HARMONY", config.getImportedStyleContentFn || defualtGetImportedStyleContent(styleNodes, rootSrcPath), {inlineImport: true}, extraPlugin);
    }
  );
  // debugger
  // let cssContent = node.childNodes.filter(v=>v.tagName === 'style' && v.childNodes && v.childNodes[0]).map(v=>v.childNodes[0].data.trim()).join("\n")
  // let cssResult = [];
  let cssDomain;
  let sortedCssRules;
  if (styleNodes[0]) {
    const CssDomain = require("../../processor/processor_css_obj/css_domain/css_domain.js");
    const sortCssRules  = require("../../processor/processor_css_obj/css_domain/sort_css_rules.js");
    sortedCssRules = sortCssRules(styleNodes[0].styleContent);
    cssDomain = new CssDomain({css: sortedCssRules});
  }

  // debugger
  /////////////////deal with template////////////////
  let arktsObj= require("./task/standard_object_to_arkts.js")(templateNode, 
    {
      srcFilePath,
      destFilePath,
      rootSrcPath,
      mainClassName,
      cssDomain,
      getIncludedStandardTreeFn: config.getIncludedStandardTreeFn || _getIncludedStandardTree,
      resolveAssetsPathFn: undefined,
      enableIterObject: config.enableIterObject
    }
  );

  let arktsString = arktsObj.main;
  // debugger
  destFileDict[`${mainClassName}.build.seg.ets`] = arktsObj.main;

  if (arktsObj.member) {
    destFileDict[`${mainClassName}.member.seg.ets`] = arktsObj.member;
  }


  if (config && config.hooks && hooks.processAfterConvert) {
    hooks.processAfterConvert(root);
  }

  return destFileDict;
}

function _getIncludedStandardTree(node , src) {
  ASSERT(node.tagName === 'include' && node.includedContent);
  return node.includedContent;
}   

