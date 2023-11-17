module.exports = removeEmptyNode;

function removeEmptyNode(node, retainComment) {
    if (node.childNodes) {
        for (var i = 0; i < node.childNodes.length;) {
            var cNode = node.childNodes[i];
            removeEmptyNode(cNode, retainComment);
            if (!cNode.tagName && typeof cNode.data === 'string') {
                let text = cNode.data ? cNode.data.trim() : null;
                if (!text
                || (!retainComment && text.startsWith("<!--"))
                ) {
                    node.childNodes.splice(i , 1);
                    continue;
                }
            }
            i++;
        }
    }
}
