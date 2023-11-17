const removeEmptyNode = require("../../../processor/processor_xml_obj/remove_empty_node.js");
const parseXml = require("../../../parser/parse_xml.js");

module.exports = function (content, filePath, rootSrcPath, readFileFunc) {

    const node = parseXml(content);

    removeEmptyNode(node, true);

    return node;
}

