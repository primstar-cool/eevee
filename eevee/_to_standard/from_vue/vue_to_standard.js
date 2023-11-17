module.exports = function (
    content,
    filePath = undefined,
    rootSrcPath = undefined,
    readFileFunc = null,
    hooks = {processBeforeParseXML: null, processAfterParseXML: null, processBeforeParseStyle: null, processAfterParseStyle: null},
    config = {}
) {
    if (!rootSrcPath) rootSrcPath = srcFilePath ? require("path").dirname(srcFilePath) : "./";

    if (hooks && hooks.processBeforeParseXML) {
        content = hooks.processBeforeParseXML(content);
    }

    const node = require("./task/vue_to_vue_object.js")(content, filePath, rootSrcPath, readFileFunc);

    if (hooks && hooks.processAfterParseXML) {
        hooks.processAfterParseXML(node);
    }

    require("./task/vue_object_to_standard.js")(node, filePath, rootSrcPath);
    require("../../processor/processor_xml_obj/clean_empty_attrs_logic.js")(node);

    return node;
    
}

