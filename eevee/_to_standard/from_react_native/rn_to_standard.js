module.exports = function (
    content,
    filePath = undefined,
    rootSrcPath = undefined,
    readFileFunc = null,
    hooks = {processBeforeParseCode: null, processAfterParseCode: null, processBeforeParseStyle: null, processAfterParseStyle: null},
    config = {}
) {
    if (!rootSrcPath) rootSrcPath = srcFilePath ? require("path").dirname(srcFilePath) : "./";

    if (hooks && hooks.processBeforeParseCode) {
        content = hooks.processBeforeParseCode(content);
    }

    // debugger
    const tsAstNode = require("../../parser/parse_tsx.js")(content, filePath);
    let xwmlObjectNode = require("./task/tsnode_to_tsxml_object.js")(tsAstNode, ["View", "Text", "Image"]);
    const stardNode =  require("./task/tsnode_to_standard.js")(xwmlObjectNode, tsAstNode);

    require("../../processor/processor_xml_obj/clean_empty_attrs_logic.js")(stardNode);

    xwmlObjectNode.sourceType = 'react_native';
    xwmlObjectNode.childNodes.forEach(v => v.sourceType = 'react_native')

    if (hooks && hooks.processAfterParseCode) {
        hooks.processAfterParseCode(node);
    }



    return xwmlObjectNode;

       
}

