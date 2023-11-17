function ensureProperty(object, property) {
  if (!object[property]) {
    object[property] = {};
  }
}

module.exports = ensureProperty;
