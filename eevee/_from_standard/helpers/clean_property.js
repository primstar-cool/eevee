function cleanProperty(object, key) {
  if (object && object[key]) {
    if (Object.keys(object[key]).length) {
      throw new Error(
        `Unhandled ${object}.${key}: ' + ${Object.keys(object[key])}`
      );
    }
    delete object[key];
  }
}

module.exports = cleanProperty;
