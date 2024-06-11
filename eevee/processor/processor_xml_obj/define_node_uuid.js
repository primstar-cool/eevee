module.exports = function defineNodeUUID(node, prefix, marker, ignoreStaticSubNode = false) {

    var seriseId = 0;

    defineANodeUUID(node);

    function defineANodeUUID(node) {
        if (!node.logic) {
            node.logic = {}
        }
    

        if (!node.logic.uuid) {
           
            node.logic.uuid = {
                type: "Literal",
                value: (node.attrs && node.attrs.id) ? node.attrs.id : (marker + '-s' + (seriseId++))
            }
            // debugger
            if (node.attrs && node.attrs.class) {
                if (typeof node.attrs.class === "string") {
                    node.logic.uuid.value += '-c-' + node.attrs.class.replace(/\s+/g, '-');
                } else if (node.attrs.class.operator === '+') {
                    if (node.attrs.class.left && node.attrs.class.left.type === "Literal") {
                        node.logic.uuid.value += '-cl-' + node.attrs.class.left.value.replace(/\s+/g, '-');
                    } else if (node.attrs.class.right && node.attrs.class.right.type === "Literal") {
                        node.logic.uuid.value += '-cr-' + node.attrs.class.right.value.replace(/\s+/g, '-');
                    }
                }
            }
        }

        if (node.childNodes && (!ignoreStaticSubNode || !node.isStatic)) {
            node.childNodes.forEach(defineANodeUUID);
        }
    }
    


}