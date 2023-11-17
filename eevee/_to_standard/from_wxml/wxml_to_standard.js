module.exports = function (
    content,
    filePath = undefined,
    rootSrcPath = undefined,
    readFileFunc = null,
    hooks = {processBeforeParseXML: null, processAfterParseXML: null},
    config = {processInclude: undefined, processIncludeTreeLevelLimit: undefined}
) {

    if (!rootSrcPath) rootSrcPath = srcFilePath ? require("path").dirname(srcFilePath) : "./";

    if (hooks && hooks.processBeforeParseXML) {
        content = hooks.processBeforeParseXML(content);
    }

    var node = require("./task/wxml_to_wxml_object.js")(content, filePath, rootSrcPath, readFileFunc, config.processInclude, config.processIncludeTreeLevelLimit);

    if (hooks && hooks.processAfterParseXML) {
        hooks.processAfterParseXML(node);
    }

    require("./task/wxml_object_to_standard.js")(node, filePath, rootSrcPath);
    require("../../processor/processor_xml_obj/clean_empty_attrs_logic.js")(node);

    return node;
    
}

