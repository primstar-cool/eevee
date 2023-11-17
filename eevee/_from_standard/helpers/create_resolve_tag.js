const mergeAttrs = require("../helpers/merge_attrs.js");

module.exports = function create_resolve_tag(
    tagName,
    toTagName,
    addClassName = undefined
  ) {
    return function resolveTag(node) {
      if (node.tagName === tagName) {
        node.tagName = toTagName;
        if (addClassName)
        mergeAttrs({ attrs: { class: addClassName } }, node);
      }
    };
  }