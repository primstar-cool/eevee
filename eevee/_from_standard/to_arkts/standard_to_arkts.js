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
    hapDesignWidth: 720,
    tagMappingFn: undefined
  
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
      enableIterObject: config.enableIterObject,
      tagMappingFn: config.tagMappingFn
    }
  );

  // debugger
  destFileDict[`${mainClassName}.build.seg.ets`] = arktsObj.main;

  if (arktsObj.member) {
    destFileDict[`${mainClassName}.member.seg.ets`] = arktsObj.member;
  }


  let contextNodes =  node.childNodes.find(v=>v.tagName === 'context');

  // debugger
  if (contextNodes && contextNodes.childNodes) {
    // debugger
    let memberVars = contextNodes.childNodes.filter(v => v.tagName === 'identifier' );
    // debugger
    memberVars = memberVars.filter(v=>v.code && v.scope === "@CONTEXT__");
    
    if (memberVars.length) {

      let typeDict = {};

      let interfacePrefix = `GenInterface_` +  mainClassName + `_pageData`

      let pageDataInterface = interfacePrefix + ' {';
      const genIndent = require("../../exporter/string_utils/gen_indent.js");
      let indent = genIndent(1);

      destFileDict[`${mainClassName}.state.seg.ets`] = memberVars.map(
        v => {
          let dataString = '';
          if (v.code) {
            dataString = v.code.replace(new RegExp(`${v.id}[\\s]+=[\\s]*`), "");
          }
          debugger

          let kIndex = v.type.indexOf("{")
          if (kIndex === -1)
          {
            pageDataInterface += "\n" + indent + `${v.id}${v.question ? "?" : ""}: ${v.type};` + (v.comment ? " /*" + v.comment + "*/" : "");
            return `@State ${v.id}: ${v.type} = ${dataString};` + (v.comment ? " /*" + v.comment + "*/" : "");             

          } else { // simple quick mode
            let genType = interfacePrefix + '_' + v.id;
            if (kIndex === v.type.lastIndexOf("{") || 0) {
              let startIdx = v.type.indexOf("{") + 1;
              let endIdx = v.type.lastIndexOf("}");
              let objectLiterals = v.type.slice(startIdx, endIdx).trim();
              
              let interfaceDef = `interface ${genType} {\n` + indent;
              let fields = objectLiterals.split(",");
              fields = fields.map( v=> v.trim().replace(/[\s]*:[\s]*/, ': ') + ";");
              interfaceDef += fields.join("\n" + indent);
              interfaceDef += '\n}'
              typeDict[genType] = interfaceDef;
              
            } else { // complex mode
              _genInterfaceByTypeLiteral(v.type, genType, typeDict);
              // debugger
            }

            pageDataInterface += "\n" + indent + `${v.id}${v.question ? "?" : ""}: ${genType};` + (v.comment ? " /*" + v.comment + "*/" : "");

            return `@State ${v.id}: ${genType} = ${dataString};` + (v.comment ? " /*" + v.comment + "*/" : "");

          }
        }
      ).join("\n");
      pageDataInterface += "\n}\n";
      typeDict[interfacePrefix] = "interface " + pageDataInterface;

      let memberMethods = contextNodes.childNodes.filter(v => v.tagName === 'method' );
      // debugger
      memberMethods = memberMethods.filter(v=>v.code && v.scope === "@CONTEXT__");
      
      if (memberMethods.length) {

        let interfacePrefix = `GenInterface_` +  mainClassName + `_pageMethods`

        let pageMethodInterface = interfacePrefix + ' {';

        // debugger

        memberMethods.forEach(
          v => {
            pageMethodInterface += "\n" + indent + `${v.id}${v.question ? "?" : ""}: ${v.type};` + (v.comment ? " /*" + v.comment + "*/" : "");
          }
        );

        pageMethodInterface += "\n}\n";
        typeDict[interfacePrefix] = "interface " + pageMethodInterface;
      }
  

      if (Object.keys(typeDict).length) {
        destFileDict[`${mainClassName}.interface.seg.ets`] =
         Object.keys(typeDict).map(
          k => typeDict[k]
        ).join("\n")
      }
    }
    
    
  }


  if (config && config.hooks && hooks.processAfterConvert) {
    hooks.processAfterConvert(root);
  }

  return destFileDict;
}

function _genInterfaceByTypeLiteral(genType, typeName, typeDict) {
  // debugger
  const tsAstNode = require("../../parser/parse_tsx.js")(`let tmp:` + genType + ";", "");

  const typeNode = tsAstNode.children?.[0].children?.[0].children?.[0].children?.[1];
  const genIndent = require("../../exporter/string_utils/gen_indent.js");
  let indent = genIndent(1);
 
  // debugger
  _genAInterface(typeNode, typeName, typeDict);

  function _genAInterface(typeNode, nodeTypeName, typeDict) {
    let interfaceDef = `interface ${nodeTypeName} {\n`;

    interfaceDef += typeNode.children.map(v => indent + _getAFieldType(v, nodeTypeName)).join("\n");
    interfaceDef += "\n}\n"
    typeDict[nodeTypeName] = interfaceDef;
  }

  function _getAFieldType(typeNode, nodeTypeName) {
    ASSERT(typeNode.type === 'PropertySignature');

    let fieldName = typeNode.children[0];
    let fieldQuestion = typeNode.children.find(v=> v.type === 'QuestionToken')
    let fieldType = typeNode.children[ fieldQuestion ? 2 : 1];

    // debugger

    ASSERT(fieldName.type === 'Identifier');
   
    fieldName = fieldName.text.trim();
    
    if (fieldType.type === "TypeLiteral") {
      let newTypeName = nodeTypeName + "_" + fieldName;
      _genAInterface(fieldType, newTypeName, typeDict)
      return fieldName + (fieldQuestion ? "?: " : ": ") + newTypeName + ";"

    } else {
      return fieldName + (fieldQuestion ? "?: " : ": ") + fieldType.text.trim() + ";"
    }

  }


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