/**
 * @since 20180828 18:46
 * @author ___xy
 */

function traverse(node, visitor) {
  visitor(node);
  switch (node.type) {
    case 'stylesheet':
      node.stylesheet.rules.forEach((rule) => {
        traverse(rule, visitor);
      });
      break;
    case 'rule':
    case 'keyframe':
      node.declarations.forEach((declaration) => {
        traverse(declaration, visitor);
      });
      break;
    case 'keyframes':
      node.keyframes.forEach((keyframe) => {
        traverse(keyframe, visitor);
      });
      break;
    case 'media':
      node.rules.forEach((rule) => {
        traverse(rule, visitor);
      });
      break;
    case 'declaration':
    case 'import':
    case 'comment':
    case 'font-face':
      break;
    default:
      throw new Error('Unexpected node.type: ' + node.type);
  }
}

module.exports = traverse;
