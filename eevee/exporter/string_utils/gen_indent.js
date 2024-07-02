const INDENT = '  ';

module.exports = function genIndent(depth) {
    if (depth === 1) return INDENT;

    return INDENT.repeat(depth);
}

module.exports.INDENT = INDENT;