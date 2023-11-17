function cleanNodeLogic(node) {
  require('./clean_property.js')(node, 'logic');
}

module.exports = cleanNodeLogic;
