const getObjectDataExpression = require("../../exporter/string_utils/get_object_data_expression.js");
function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}

module.exports = function get_node_uuid(node, functionArray) {

  let myUuidString = getObjectDataExpression(node.logic.uuid, functionArray);
  if (myUuidString[0] !== '"') {
    throw new Error("error uuid");
  }

  ASSERT(node.parentNode && node.parentNode._uuid);
  
  let ancestryInLoop = node.parentNode._uuid.includes("@loop-");
  let myInLoop = node.logic && node.logic['for'];

  if (!ancestryInLoop && !myInLoop) return myUuidString; //simple string

  let uuidString = "";

  if (ancestryInLoop) {
    uuidString = " " + node.parentNode._uuid + ' + ';// add a extra space for mark this is not a simple string
  }

  uuidString += JSON.stringify(">" + JSON.parse(myUuidString));
  if (!myInLoop) return uuidString;  // not a simple string

  
  //i am in loop
  if (node.logic['key']) {
    ASSERT(node.logic["for-item"]);

    let forItemParsed = JSON.parse(getObjectDataExpression(node.logic["for-item"], functionArray));
    let keyString = getObjectDataExpression(node.logic["key"], functionArray);
    
    uuidString += " + " + keyString.replace(new RegExp(`_cONTEXT\\.${forItemParsed}`, "g"), forItemParsed) + " + "
  } else if (node.logic['for-index']) {
    ASSERT(node.logic["for-item"]);

    let forIndexParsed = JSON.parse(getObjectDataExpression(node.logic["index-item"], functionArray));
    uuidString += " + " + forIndexParsed + " + "
  } else {
    uuidString += " + __index + "
  }

  return uuidString; // not a simple string
}

  