module.exports = function removeDebug() {
  return (root) => {
    root.stylesheet.rules = root.stylesheet.rules.filter((node) => {
      if (node.type !== 'comment') {
        if (node.declarations) {
          node.declarations = node.declarations.filter((declaration) => {
            if (declaration.type !== 'comment') return declaration;
          });
        }
        return node;
      }
    });
  };
};
