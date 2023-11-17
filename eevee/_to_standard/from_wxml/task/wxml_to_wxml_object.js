const removeEmptyNode = require("../../../processor/processor_xml_obj/remove_empty_node.js");

module.exports = wxml_to_wxml_object;


function wxml_to_wxml_object (content, filePath, rootSrcPath, readFileFunc, processInclude, processIncludeTreeLevelLimit) {

    if (processInclude === undefined) processInclude = true;
    if (processIncludeTreeLevelLimit === undefined) processIncludeTreeLevelLimit = Infinity;


    var parseXml = require("../../../parser/parse_xml.js");

    var node = parseXml(content);
    removeEmptyNode(node, true);

    // const replaceConstWXIf = require("../../../processor/processor_xml_obj/replace_const_wxif.js"); 
    // replaceConstWXIf(node, targetEnv);

    if (processInclude) {
        if (!filePath || !readFileFunc) {
            throw new Error("lack filePath or readFileFunc");
        }
        require("../../../processor/processor_xml_obj/process_include.js")(node, filePath, rootSrcPath, readFileFunc, wxml_to_wxml_object, processInclude, processIncludeTreeLevelLimit)
        
    }

    return node;
}
