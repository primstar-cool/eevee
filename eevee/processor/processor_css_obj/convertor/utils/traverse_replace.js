function traverseReplace(root, replacer, filter) {
  function visitor(node, container) {
    return (!filter || filter(node)) && replacer(node, container);
  }
  function traverse(node, container) {
    let result = visitor(node, container);
    switch (node.type) {
      case 'stylesheet':
        rulesForEach(node.stylesheet.rules);
        break;
      case 'rule':
      case 'keyframe':
        rulesForEach(node.declarations);
        break;
      case 'keyframes':
        rulesForEach(node.keyframes);
        break;
      case 'media':
        rulesForEach(node.rules);
        break;
      case 'declaration':
      case 'import':
      case 'comment':
      case 'font-face':
        break;
      default:
        throw new Error('Unexpected node.type: ' + node.type);
    }
    return result;
  }
  function rulesForEach(rules) {
    for (let i = 0; i < rules.length; i++) {
      traverse(rules[i], rules) && (i--);
    }
  }
  return traverse(root, null);
}

module.exports = traverseReplace;