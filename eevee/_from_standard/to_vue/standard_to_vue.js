
function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}

module.exports = function (node, config = 
  {
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
    useVue3: undefined
  }
) {


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
  require("./task/standard_to_vue_object.js")(templateNode, 
    {
      srcFilePath,
      destFilePath,
      mainClassName,
      getIncludedStandardTreeFn: config.getIncludedStandardTreeFn || _getIncludedStandardTree,
      resolveAssetsPathFn: undefined,
      useVue3: config.useVue3,
    }
  );

  let templateString;
  const exporter_html = require("../../exporter/exporter_html.js")
  templateNode.converedContent = exporter_html(templateNode, config.minifyXml);
  templateString = templateNode.childNodes.map(
    sn => exporter_html(sn, config.minifyXml)
  ).join(config.minifyXml ? "" : '\n');
  destFileDict[`${mainClassName}.vue-template.xml`] = templateString;

  /////////////////deal with style////////////////
  let distFileDictCss =  require("../to_h5_common/task/dump_to_css.js")(
    node, 
    {
      srcFilePath,
      destFilePath,
      rootSrcPath,
      mainClassName,
      minifyCss,
      nodeString: templateString
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
     