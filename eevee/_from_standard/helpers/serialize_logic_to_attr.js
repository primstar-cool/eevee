const javascript = require('../../parser/parse_ast/javascript');
const mustache = require('../../_from_standard/helpers/mustache.js');

module.exports = function serializeLogic(node, logicKey, attrName, useMustache) {
    if (node.logic && node.logic[logicKey]) {
      if (!node.attrs) node.attrs = {};
  
      let statement = node.logic[logicKey];
      if (typeof statement === 'object') {
        statement = (useMustache ? mustache : javascript).serialize(statement);
      }
      node.attrs[attrName] = statement;
      delete node.logic[logicKey];
    }
  }
  