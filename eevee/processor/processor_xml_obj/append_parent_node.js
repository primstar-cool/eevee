module.exports = appendParentNode;

function appendParentNode(n, pn) {
    Object.defineProperty(
        n, "parentNode", {value: pn, enumerable: false, writable: true}
    );
    if (n.childNodes) {
        n.childNodes.forEach(
            sn => appendParentNode(sn, n)
        )
    }

    if (n.includedContent) {
        appendParentNode(n.includedContent, null)
    }
  }