const INDENT = '  ';

module.exports = function genIndent(depth) {
    if (depth === 1) return INDENT;
    let indent = "";
    for (var i = 0; i < depth; i++) indent += INDENT;
    return indent;
}

module.exports.INDENT = INDENT;