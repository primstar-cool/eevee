module.exports = function serializeHtml(rootNode, minify = true, enableXmlTypeClose = false, depth = -1) {
    var dest = '';
    var indent = '';
    if (!minify) {
        indent = (depth < 0) ? '' : '\n';
        for (let i = 0; i < depth; i++) {
            indent += '\t';
        }
    }
    if (rootNode.tagName) {
        dest += indent + '<' + rootNode.tagName;

        if (rootNode.attrs) {
        for (var key in rootNode.attrs) {
            if (rootNode.attrs[key] === true) dest += ' ' + key;
            else dest += ' ' + key + '=' + JSON.stringify(rootNode.attrs[key]);
        }
        }

        dest += '>';
    }

    let hasChildNodes = rootNode.childNodes && rootNode.childNodes.length;
    let hasTaggedChildNodes = false;

    if (hasChildNodes) {
        for (var i = 0; i < rootNode.childNodes.length; i++) {
            if (rootNode.childNodes[i].tagName) {
                hasTaggedChildNodes = true;
            }
            dest += serializeHtml(rootNode.childNodes[i], minify, enableXmlTypeClose, depth+1);
        }
    }

    if (rootNode.data) {
        dest += rootNode.data;
    }

    if (rootNode.tagName) {
        if (!rootNode.data && !hasChildNodes && enableXmlTypeClose) {
            dest = dest.substring(0, dest.length - 1) + "/>";
        } else {
            if (!hasTaggedChildNodes) {
                if (!rootNode.data && (rootNode.tagName === 'img' || rootNode.tagName === 'br' || rootNode.tagName === 'hr')) {
                    dest = dest.slice(0, -1) + "/>"
                } else {
                    dest += '</' + rootNode.tagName + '>';
                }
            } else {
                dest += indent + '</' + rootNode.tagName + '>';
            }
        }
    }

    if (depth === -1) {
        return dest.trim();
    } else {
        return dest;
    }
}