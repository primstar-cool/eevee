module.exports =  `function getAutoTextStyle(parentStyle: any) {
    
  let ret = {
    backgroundColor: "transparent",
    margin: 0,
    padding: 0,
  };

  if (parentStyle) {
    // maybe inline style has font-size, color, ect. but will clean margin & padding for parent already settled
    ret = Object.assign({}, parentStyle, ret);
  }

  return ret;
}`