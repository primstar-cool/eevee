const chalk = require('chalk');

function removeProperty(node, i, parentNode) {
  console.log(chalk.red(node.property + ': ' + node.value + ' not support'));
  parentNode.splice(i, 1);
  return (i -= 1);
}

module.exports = removeProperty;
