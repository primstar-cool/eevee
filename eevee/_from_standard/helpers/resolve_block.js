
const replaceNode = require("../helpers/replace_node.js");
const mergeAttrs = require("../helpers/merge_attrs.js");

module.exports = resolveBlock;

function resolveBlock(root) {
    traverseBlock(root, (node) => {
      if (node.tagName === 'block') {
        if (node.attrs) {
          // 1. replace block children to block
          // 2. set block attrs onto children
          writeToValidChildNode(node);
        }
        replaceNode(node, node.childNodes);
      }
    });
  }

function traverseBlock(node, visitor, parent = null) {
    visitor(node, parent);
    if (node.childNodes) {
      for (let i = 0; i < node.childNodes.length; i++) {
        if (
          node.childNodes[i].tagName === 'block' &&
          node.childNodes[i].childNodes &&
          node.childNodes[i].childNodes.length === 0
        ) {
          continue;
        }
        traverseBlock(node.childNodes[i], visitor, node);
      }
    }
  }
  
  function writeToValidChildNode(root) {
    root.childNodes.forEach((node) => {
      if (node.tagName) {
        mergeAttrs(root, node);
      }
    });
  }