module.exports = clean_empty_attrs_logic;
function clean_empty_attrs_logic(node) {

    if (node.attrs && Object.keys(node.attrs).length === 0) {
        delete node.attrs;
    }
    if (node.logic && Object.keys(node.logic).length === 0) {
        delete node.logic;
    }


    if (node.childNodes && node.childNodes.length === 0) {
        delete node.childNodes;
    }

    
    if (node.childNodes === null) {
        delete node.childNodes;
    }
    
    if (node.data === null) {
        delete node.data;
    }

    if (node.tagName === null) {
        delete node.tagName;
    }



    if (node.childNodes) {
        node.childNodes.forEach(sn=> clean_empty_attrs_logic(sn));
    }

    if (node.includedContent) {
        clean_empty_attrs_logic(node.includedContent)
    }
}
