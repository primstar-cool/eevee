
function ASSERT (flag, ...args) {
  if (!flag) {
      debugger
      throw new Error(...args);
  }
}

module.exports = function (node, 
  config = {
    env: undefined, //"BORWSER" | "NODE"
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
    minifyCss: undefined,
    minifyXml: undefined,
    useJsxLib: undefined,
    enableIterObject: undefined,

}) {
  

  if (!node || !node.childNodes) return node;

  let templateNode = node.childNodes.find(v=>v.tagName === 'template');

  if (!node.hasOwnProperty("parentNode")) {
  require("../../processor/processor_xml_obj/append_parent_node.js")(templateNode, null);
  }
  require("../../processor/processor_xml_obj/remove_envif.js")(templateNode, config.env || "BROWSER");
  require("../../processor/processor_xml_obj/remove_constif.js")(templateNode, config.env || "BROWSER");
  
  // debugger
  // debugger
  if (config && config.hooks && hooks.processBeforeConvert) {
      hooks.processBeforeConvert(node);
  }
  let {readFileFn, srcFilePath, rootSrcPath, destFilePath = "", mainClassName = "", minifyCss} = config||{};
  
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

  /////////////////deal with template////////////////
  // debugger
  

  let reactFuncString = require("./task/h5_object_to_react_js.js")(templateNode, 
    {
      srcFilePath,
      destFilePath,
      mainClassName,
      getIncludedStandardTreeFn: config.getIncludedStandardTreeFn || _getIncludedStandardTree,
      resolveAssetsPathFn: undefined,
      useJsxLib: config.useJsxLib,
      enableIterObject: config.enableIterObject
    }
  );

  if (config.useJsxLib) {
    destFileDict[`${mainClassName}.react.v17.js`] = reactFuncString;
  } else {
    destFileDict[`${mainClassName}.react.js`] = reactFuncString;
  }
  // debugger

  /////////////////deal with style////////////////
  let distFileDictCss =  require("../to_h5_common/task/dump_to_css.js")(
    node, 
    {
      srcFilePath,
      destFilePath,
      rootSrcPath,
      mainClassName,
      minifyCss,
      nodeString: reactFuncString

    }
  );
  Object.assign(destFileDict, distFileDictCss);

  if (config && config.hooks && hooks.processAfterConvert) {
    hooks.processAfterConvert(root);
  }

  return destFileDict;
}

function _getIncludedStandardTree(node , src) {
  ASSERT(node.tagName === 'include' && node.includedContent);
  return node.includedContent;
}   