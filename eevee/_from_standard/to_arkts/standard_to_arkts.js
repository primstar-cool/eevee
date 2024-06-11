const defaultGetImportedStyleContent = 
require('../helpers/get_imported_style_content.js');

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
    judgeWrapTextFn: undefined, // check when make inline texts
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

  styleNodes.unshift(
    {
      tagName: 'style',
      styleContent: {
        type: 'stylesheet',
        stylesheet: {
          rules: [
            {
              type: 'rule',
              selectors: ["input"],
              declarations: [
                {
                  property: 'border-radius',
                  type:'declaration',
                  value: '0',
                },
                {
                  property: 'padding',
                  type:'declaration',
                  value: '0',
                },
                {
                  property: 'background-color',
                  type:'declaration',
                  value: 'transparent',
                }
              ]
            }
          ]
        }
      }

    }
  )

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
      require("../../processor/processor_css_obj/convertor/plugins_extra/border_longhand.js")(),
      require("../../processor/processor_css_obj/convertor/plugins_extra/background_image_normalize.js")(),
      require("../../processor/processor_css_obj/convertor/plugins_extra/color_normalize.js")("ARGB"),
      require("../../processor/processor_css_obj/convertor/plugins_extra/padding_longhand.js")(),
      require("../../processor/processor_css_obj/convertor/plugins_extra/margin_longhand.js")(),
      require("../../processor/processor_css_obj/convertor/plugins_extra/overflow_longhand.js")(),

    ]
  );


  styleNodes.forEach(
    n=> {
        // if (n.convertedStyle) return;
        processorCssObj(n.styleContent, n.src, n.sourceType, config.env || "HARMONY", config.getImportedStyleContentFn || defaultGetImportedStyleContent(styleNodes, rootSrcPath), {inlineImport: true, splitImportant: true}, extraPlugin);
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
      resolveAssetsPathFn: config.resolveAssetsPathFn,
      judgeWrapTextFn: config.judgeWrapTextFn  || _judgeWrapTextFn,
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

function _judgeWrapTextFn(nodeInfos, mergeFunc) {

  let mergeArr = [];

  if (nodeInfos.length < 2) return;

  for (let i = 0; i < nodeInfos.length; i++) {
    let v = nodeInfos[i];
    if (
      v.node._convertedTagName === 'Text' &&
      (v.node.computedStyle.display === "inline" || v.node.computedStyle.display === "inline-block")
      // && v.node.attrs.className.includes("rich-text") // shoule mark it by project specification
 
    ) { 
      // debugger
      mergeArr.push(v);
    } else {
      if (mergeArr.length >= 2) { // modify it as you wish
        mergeFunc(mergeArr);
      }        
      mergeArr = [];

    }

  }

  if (mergeArr.length >= 3) { // modify it as you wish
    mergeFunc(mergeArr);
  }        
  mergeArr =[];

}