const javascript = require('../../parser/parse_ast/javascript');
const getObjectDataExpression = require("../../exporter/string_utils/get_object_data_expression.js");

function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}


module.exports = function genNodeCssXPathName(node, functionArray, styleHolder, addExtraClassTagName = false) {
  // debugger
  // if (!styleHolder) debugger

  // if (node.attrs.id) debugger

  if (node.style && node.style._classStyleRouteFull) {
    // debugger
    return node.style._classStyleRouteFull;
  }

  if (!node.style) node.style = styleHolder ? {
    _tmpStyleId: styleHolder.index++
  } : {};

  node.style._classStyleHash = genNodeCssName(node, functionArray, addExtraClassTagName);
  
  // if (node.className === 'sub-text') debugger
  
  let parentNode = node.parentNode;
  if (parentNode) {

    if (!node.isAutoCreateTextNode
      && !node.isAutoCreateBgNode
      && !node.isAutoCreateBorderNode
      ) {

      if (parentNode.style._classStyleRouteFull.isStatic
        && node.style._classStyleHash.isStatic
      ) {
        node.style._classStyleRouteFull = {
          isStatic: true,
          xPath: parentNode.style._classStyleRouteFull.xPath + ">" + node.style._classStyleHash.xPath
        }
      } else {

        // spec optimize

        if (parentNode.style._classStyleRouteFull.isStatic
          && node.style._classStyleHash.xPathObject
          && node.style._classStyleHash.xPathObject.type === "BinaryExpression"
          && node.style._classStyleHash.xPathObject.operator === "+"
          && node.style._classStyleHash.xPathObject.left.type === "Literal"
        ) {

          // debugger
          let myXPathFuncPlusIndx = node.style._classStyleHash.xPathFunc.indexOf("+");
          ASSERT(myXPathFuncPlusIndx);
          // let myFuncLeft = node.style._classStyleHash.xPathFunc.substr(0, myXPathFuncPlusIndx);
          let myFuncRight = node.style._classStyleHash.xPathFunc.substr(myXPathFuncPlusIndx);
          
          node.style._classStyleRouteFull = {
            isStatic: false,
            xPathFunc: JSON.stringify(parentNode.style._classStyleRouteFull.xPath + ">" + node.style._classStyleHash.xPathObject.left.value) + " " +  myFuncRight,
            xPathObject: new javascript.astFactory.BinaryExpression(
              '+',
              new javascript.astFactory.Literal(parentNode.style._classStyleRouteFull.xPath + ">" + node.style._classStyleHash.xPathObject.left.value),
              node.style._classStyleHash.xPathObject.right,
            )
          }

        } else if (node.style._classStyleHash.isStatic
          && parentNode.style._classStyleHash.xPathObject
          && parentNode.style._classStyleHash.xPathObject.type === "BinaryExpression"
          && parentNode.style._classStyleHash.xPathObject.operator === "+"
          && parentNode.style._classStyleHash.xPathObject.right.type === "Literal"
        ) {

          // debugger
          // ASSERT(false, 'miss genClassXPath?')
          let parentXPathFuncPlusIndx = parentNode.style._classStyleHash.xPathFunc.lastIndexOf("+");
          ASSERT(parentXPathFuncPlusIndx);
          let parentFuncLeft = parentNode.style._classStyleHash.xPathFunc.substr(0, parentXPathFuncPlusIndx+1);
          // let parentFuncRight = parentNode.style._classStyleHash.xPathFunc.substr(parentXPathFuncPlusIndx+1);
          
          node.style._classStyleRouteFull = {
            isStatic: false,
            xPathFunc: parentFuncLeft + " " + JSON.stringify(parentNode.style._classStyleHash.xPathObject.right.value + ">" +node.style._classStyleHash.xPath),
            xPathObject: new javascript.astFactory.BinaryExpression(
              '+',
              parentNode.style._classStyleHash.xPathObject.left,
              new javascript.astFactory.Literal(parentNode.style._classStyleHash.xPathObject.right.value + ">" + node.style._classStyleHash.xPath),
            )
          }

        } else {

          let parentNodeXPathStr = (parentNode.style._classStyleRouteFull.isStatic ? JSON.stringify(parentNode.style._classStyleRouteFull.xPath + ">") : `(${parentNode.style._classStyleRouteFull.xPathFunc})`)
          let parentNodeXPathObject = parentNode.style._classStyleRouteFull.isStatic ? new javascript.astFactory.Literal(parentNode.style._classStyleRouteFull.xPath+">") : parentNode.style._classStyleRouteFull.xPathObject;
  
          ASSERT(parentNodeXPathObject);
  
          let myNodeXPathStr = (node.style._classStyleHash.isStatic ? JSON.stringify(">" + node.style._classStyleHash.xPath) : `(${node.style._classStyleHash.xPathFunc})`)
          let myNodeXPathObject = node.style._classStyleHash.isStatic ? new javascript.astFactory.Literal(">" + node.style._classStyleHash.xPath) : node.style._classStyleHash.xPathObject;
  
          let isAllUnStatic = (!parentNode.style._classStyleRouteFull.isStatic && !node.style._classStyleHash.isStatic);
  
          node.style._classStyleRouteFull = {
            isStatic: false,
            xPathFunc: parentNodeXPathStr + " + " + (isAllUnStatic ? `">" + ` : '') + myNodeXPathStr,
            xPathObject: new javascript.astFactory.BinaryExpression(
              '+',
              isAllUnStatic ? 
                new javascript.astFactory.BinaryExpression('+', new javascript.astFactory.Literal(">"), parentNodeXPathObject)
                : parentNodeXPathObject
              ,
              myNodeXPathObject,
            )
          }
        }
      }



    }
    else {
      // do nothing
    }

  } else {
    // root node
    node.style._classStyleRouteFull = node.style._classStyleHash;
  }

  // if (node.style._classStyleRouteFull.xPath && node.style._classStyleRouteFull.xPath.includes("[object")) debugger

  // if (node.style._classStyleRouteFull.xPathFunc && node.style._classStyleRouteFull.xPathFunc.includes("[object")) debugger

  return node.style._classStyleRouteFull;
}
  



function genNodeCssName(node, functionArray, addExtraClassTagName) {


  let isStatic = true;
  let _tagString = node.tagName;
  let _classString = "";
  let _classObj;
  let _idString = "";
  let _idObj;


  if (node.attrs && node.attrs.class) {
    node.className = node.attrs.class;

    // if (node.className === 'sub-text') debugger

    if (typeof node.className === 'string') {
      var classTrim = node.className.trim();
      /*DEBUG_START*/
      if (classTrim !== node.className) {
        console.warn("class \"" + node.className + "\" has redundant space")
      }
      /*DEBUG_END*/
      _classString = classTrim.split(/[\s]+/).map(v => "." + v).join("");
      if (addExtraClassTagName) {
        _classString = ".tag-" + node.tagName + _classString;
      }
    } else if (node.className.type === "Literal") {
      _classString = node.className.value.trim().split(/[\s]+/).map(v => "." + v).join("");
      if (addExtraClassTagName) {
        _classString = ".tag-" + node.tagName + _classString;
      }
    } else {
      _classObj = node.className;
      isStatic = false;
    }
    //sort outside? TODO
  }


  if (node.attrs.id) {
    // debugger
    if (typeof node.attrs.id === 'string') {
      _idString += '#' + node.attrs.id;
    } else {
      if (node.attrs.id.type === "Literal") {
        _idString += '#' + node.attrs.id.value;
      } else {
        _idObj = node.attrs.id;
        isStatic = false;
      }
    }
  }


    if (isStatic) {
      return {
        isStatic,
        xPath: _tagString + _idString + _classString
      }
    } else {

      let xPathFunc = '';
      let xPathObject;
      let start = _tagString;
      
      if (_idObj) {
        let _idFunc =  getObjectDataExpression(_idObj, functionArray);
        xPathFunc = JSON.stringify(start+"#") + ' + (' + _idFunc + ")";

        xPathObject = new javascript.astFactory.BinaryExpression(
          '+',
          new javascript.astFactory.Literal(start + "#"),
          _idObj._orginalNode || _idObj,
        );

      } else {
        ASSERT(_classObj, "should be static");
        xPathObject = new javascript.astFactory.Literal(_tagString + _idString);
        xPathFunc = JSON.stringify(xPathObject.value);
      } 

      if (_classString) {
        ASSERT(_idObj, "should be static");
        xPathFunc += " + " + JSON.stringify(_classString);
        xPathObject = new javascript.astFactory.BinaryExpression(
          '+',
          xPathObject,
          new javascript.astFactory.Literal(_classString),
        );
      } else if (_classObj) {
        let classFunc = getObjectDataExpression(_classObj, functionArray);

        const tagClassName = addExtraClassTagName ? ".tag-" + node.tagName : "";

        if (addExtraClassTagName) {
          if (xPathObject.type === 'Literal') {
            xPathObject.value += tagClassName;
            xPathFunc = `${JSON.stringify(xPathObject.value)} + genClassXPath(` + classFunc + ")";
          } else {
            xPathObject = new javascript.astFactory.BinaryExpression(
              '+',
              xPathObject,
              new javascript.astFactory.Literal(tagClassName),
            );
            xPathFunc += ` + ${JSON.stringify(tagClassName)} + genClassXPath(` + classFunc + ")";
          }

          xPathObject = new javascript.astFactory.BinaryExpression(
            '+',
            xPathObject,
            new javascript.astFactory.CallExpression(
              new javascript.astFactory.Identifier("genClassXPath"),
              [_classObj._orginalNode || _classObj],
            ),
          );
        } else {
          xPathFunc += " + genClassXPath(" + classFunc + ")";

          xPathObject = new javascript.astFactory.BinaryExpression(
            '+',
            xPathObject,
            new javascript.astFactory.CallExpression(
              new javascript.astFactory.Identifier("genClassXPath"),
              [_classObj._orginalNode || _classObj],
            ),
          );
        }
        
      }

      return {
        isStatic,
        xPathFunc,
        xPathObject,
      }


    }

}

  