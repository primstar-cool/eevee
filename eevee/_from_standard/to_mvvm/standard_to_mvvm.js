

/**
 * this is simple format which include necessary data to render a tree
 */

const defaultGetImportedStyleContent = require('../helpers/get_imported_style_content.js');


function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}
const path = require("path");

module.exports = function (node, 
  config = {
    env: "MVVM",
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
    minifyJSON: undefined,
    analysisReferKeysDepth: undefined,
    analysisIsStatic: undefined,
    screenWidthRem: undefined,
    mvvmDesignWidth: undefined,
  }
  
  ) {


  if (!node || !node.childNodes) return node;

  let templateNode = node.childNodes.find(v=>v.tagName === 'template');

  if (!node.hasOwnProperty("parentNode")) {
    require("../../processor/processor_xml_obj/append_parent_node.js")(templateNode, null);
  }
  // MVVM version reserve all platform data
  // require("../../processor/processor_xml_obj/remove_envif.js")(templateNode, config.env || "WXMP");
  // require("../../processor/processor_xml_obj/remove_constif.js")(templateNode, config.env || "WXMP");
  
  // debugger
  if (config && config.hooks && hooks.processBeforeConvert) {
      hooks.processBeforeConvert(node);
  }

  let {readFileFn, srcFilePath, destFilePath = "", rootSrcPath, mainClassName = ""} = config||{};
  let analysisReferKeysDepth = config.analysisReferKeysDepth;
  if (analysisReferKeysDepth === undefined) analysisReferKeysDepth = 2;

  let analysisIsStatic = config.analysisIsStatic;
  if (analysisIsStatic === undefined) analysisIsStatic = true;

  let mvvmDesignWidth = config.mvvmDesignWidth;
  if (mvvmDesignWidth === undefined) mvvmDesignWidth = 750;
  
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
  let destFileDict = {}

  /////////////////deal with context////////////////
  // let contextNode = node.childNodes.find(v=>v.tagName === 'context');
  // // debugger
  // if (contextNode) {
  //   require("./task/process_context.js")(
  //     contextNode,
  //     templateNode,
  //     mainClassName,
  //     destFileDict
  //  )
  // }
 
  
  /////////////////deal with template////////////////
  let screenWidthRem = config.screenWidthRem;
  if (screenWidthRem === undefined) screenWidthRem = 7.5;
  require("./task/standard_to_mvvm_object.js")(templateNode, 
    {
      srcFilePath,
      destFilePath,
      mainClassName,
      analysisReferKeysDepth,
      analysisIsStatic,
      screenWidthRem,
      getIncludedStandardTreeFn: config.getIncludedStandardTreeFn || _getIncludedStandardTree,
      resolveAssetsPathFn: undefined,
    }
  );

  destFileDict[`${mainClassName}.mvvm-template.json`] = JSON.stringify(templateNode, null, config.minifyJSON ? undefined : 2);


  // debugger

  /////////////////deal with style////////////////
  const processorCssObj = require("../../processor/processor_css_obj/convertor/index.js");
  let styleNodes =  node.childNodes.filter(v=>v.tagName === 'style');

  let sourceType = node.sourceType;
  let extraPlugin;
  if (sourceType === "wxmp" || sourceType === "ttma" || sourceType === "ksmp" || sourceType === "swan") {

  } else if (sourceType === "vue" || sourceType === "react") {
    extraPlugin = [require("../../processor/processor_css_obj/convertor/plugins/rem_to_rpx.js")(screenWidthRem, mvvmDesignWidth)];
  }
  
  extraPlugin = (
    [
      require("../../processor/processor_css_obj/convertor/plugins_extra/background_longhand.js")(),
      require("../../processor/processor_css_obj/convertor/plugins_extra/border_radius_normalize.js")(),
      require("../../processor/processor_css_obj/convertor/plugins_extra/border_longhand.js")(),
      require("../../processor/processor_css_obj/convertor/plugins_extra/background_image_normalize.js")(),
      require("../../processor/processor_css_obj/convertor/plugins_extra/color_normalize.js")("ARGB"),
      require("../../processor/processor_css_obj/convertor/plugins_extra/padding_longhand.js")(),
      require("../../processor/processor_css_obj/convertor/plugins_extra/margin_longhand.js")(),
      require("../../processor/processor_css_obj/convertor/plugins_extra/overflow_longhand.js")(),
      
      require("../../processor/processor_css_obj/convertor/plugins/vw_to_rpx.js")(),

    ]
    .concat(extraPlugin||[])
    .concat([require("../../processor/processor_css_obj/convertor/plugins/rpx_to_num.js")(mvvmDesignWidth)])
  );


  styleNodes.forEach(
    n=> {
        // if (n.convertedStyle) return;
        processorCssObj(n.styleContent, n.src, n.sourceType, config.env || "MVVM", config.getImportedStyleContentFn || defaultGetImportedStyleContent(styleNodes, rootSrcPath), {inlineImport: true, splitImportant: true}, extraPlugin);
    }
  );
  // debugger
  // let cssContent = node.childNodes.filter(v=>v.tagName === 'style' && v.childNodes && v.childNodes[0]).map(v=>v.childNodes[0].data.trim()).join("\n")
  // let cssResult = [];
  // let cssDomain;
  let sortedCssRules;
  if (styleNodes[0]) {
    // const CssDomain = require("../../processor/processor_css_obj/css_domain/css_domain.js");
    const sortCssRules  = require("../../processor/processor_css_obj/css_domain/sort_css_rules.js");

    let allRules = styleNodes.map(v=>v.styleContent.stylesheet.rules).flat();
    let ruleDict = {};
    let allRulesUnDup = [];

    allRules.forEach(
      v => {
        let hashKey = JSON.stringify(v);

        if (!ruleDict[hashKey]) {
          ruleDict[hashKey] = 1;
          allRulesUnDup.push(v);
        }
      }
    )


    sortedCssRules = sortCssRules(
      {
        type: "stylesheet",
        stylesheet: {
          rules: allRulesUnDup
        }
      }
    );
    destFileDict[`${mainClassName}.mvvm-style.json`] = JSON.stringify(sortedCssRules, null, config.minifyJSON ? undefined : 2);

    // cssDomain = new CssDomain({css: sortedCssRules});

    sortedCssRules.forEach(
      vo => {
        if (vo.style) {
          let styleNew = {};
          let voStyle = vo.style;
          let keys = Object.keys(voStyle);

          keys.forEach(k => {

            if (k.includes("-")) {
              styleNew[k.replace(/-(\w)/g, ($,$1)=>$1.toUpperCase())] = voStyle[k];
            } else {
              styleNew[k] = voStyle[k];
            }

          });

          vo.style = styleNew;
        }
      }
    )

    // debugger

    destFileDict[`${mainClassName}.mvvm-camel-style.json`] = JSON.stringify(sortedCssRules, null, config.minifyJSON ? undefined : 2);
  }
  

  if (config && config.hooks && hooks.processAfterConvert) {
    hooks.processAfterConvert(node);
  }
  
  // // debugger

  // let cssApp = `${templateString.includes("h5-span") ? ".h5-span {display: inline}" : ''}`;
  // cssApp += `${templateString.includes("rn-view") ? ".rn-view {position: relative}" : ''}`;

  // if (cssApp) {
  //   destFileDict[`app.seg.wxss`] = cssApp;
  // }

  
  return destFileDict;
  
}

function _getIncludedStandardTree(node , src) {
  ASSERT(node.tagName === 'include' && node.includedContent);
  return node.includedContent;
}
     