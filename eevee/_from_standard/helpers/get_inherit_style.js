// function ASSERT (flag, ...args) {
//     if (!flag) {
//         debugger
//         throw new Error(...args);
//     }
// }
  
module.exports = function getInheritStyle(node, key) {
    


    let loopNode = node;
    if (!loopNode || !loopNode.computedStyle) return undefined;

    let _value = loopNode.computedStyle[key];
    while (!_value) {
        loopNode = loopNode.parentNode;
        if (!loopNode || !loopNode.computedStyle) break;
        _value = loopNode.computedStyle[key];
    }
       
    return _value;
  }