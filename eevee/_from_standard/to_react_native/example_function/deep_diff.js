module.exports = `function deepDiff(newVal:any, oldVal:any, treatNaNAsSame = true) {
  
  if (newVal === oldVal) {
    return false;
  }
  var newType = typeof newVal;
  var oldType = typeof oldVal;
  
  // console.ASSERT(newType !== 'function' && oldType !== 'function', 'error deepDiff function');

  if (newType !== oldType) {
    return true;
  }
  
  if (newType === 'object') {
    if (Object.prototype.toString.call(newVal) !== Object.prototype.toString.call(oldVal)) {
      return true;
    }

    if (Object.keys(newVal).length !== Object.keys(oldVal).length)
      return true;
    
    for (var key in newVal) {
      if (!oldVal.hasOwnProperty(key))
        return true;
      var newValKeyVal = newVal[key];
      var oldValKeyVal = oldVal[key];
      
      if (newValKeyVal === oldValKeyVal) {
        continue;
      }
      
      if (deepDiff(newValKeyVal, oldValKeyVal)) {
        return true;
      }
    
    }

    return false;
  } else if (treatNaNAsSame && newType === 'number') {
    if (isNaN(newVal) && isNaN(oldVal))
      return false;
  }
  
  return true;
}
`;