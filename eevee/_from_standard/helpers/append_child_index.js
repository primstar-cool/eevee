

function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}

module.exports = appendChildIndex;

function appendChildIndex(
  node, enableIterObject
) {

  // if (node.childNodes && node.childNodes[0].attrs?.class  === 'image-wrap') debugger

  // if (node.attrs?.class  === 'image-wrap') debugger
  // debugger
  if (node.data && typeof node.data === 'string' && node.data.startsWith("<!--")) {
    node._nodeLength = 0;
    return;
  }

  if (node.parentNode) {
    let myIndex = node.parentNode.childNodes.filter(noCommentChildFilter).indexOf(node);
    ASSERT(myIndex >= 0);

    let myIndexLiteral = myIndex;
    let myIndexExpression = [];
    let myIndexObj;
  
    for (let i = 0; i < node.parentNode.childNodes.length; i++) {
      let brotherNode = node.parentNode.childNodes[i];
      if (brotherNode === node) break;
      let forStr = '';
      if (brotherNode.logic?.for) {
        ASSERT(brotherNode.logic?.for.type === 'Identifier' || node.logic?.for.type === 'MemberExpression');

        let loopStr;
        loopStr = require("./get_expression_with_for_domain.js")(brotherNode, brotherNode.logic?.for).astString;
        console.log(loopStr)
        // debugger
        // debugger
        if (enableIterObject) {
          forStr = (
           `Array.isArray(${loopStr}) ? ${loopStr}.length : Object.keys(${loopStr}).length)`
          )
        } else {
          forStr = (
            loopStr + ".length"
          )
        }
      }

      if (brotherNode.logic?.if) {
        let {ifString, forItems, useIfFilter} = getIfString(brotherNode);

        if (!forStr) {
          myIndexLiteral--;
          myIndexExpression.push(`(${ifString} ? 1 : 0)`)
        } else {
          myIndexLiteral--;
          if (useIfFilter) {
            
            myIndexExpression.push(`(${forStr.substring(0,forStr.lastIndexOf(".length"))}.filter((${forItems.join(",")}) => (${ifString})).length)`);
            // debugger
          } else {
            myIndexExpression.push(`(${ifString} ? ${forStr} : 0)`)
          }
        }
        
      } else {
        if (forStr) {
          myIndexLiteral--;
          myIndexExpression.push(forStr)
        }
      }

    }

    
  
    

    let myForStr = '';
    if (node.logic?.for) {
      ASSERT(node.logic?.for.type === 'Identifier' || node.logic?.for.type === 'MemberExpression');

      let loopStr;
      loopStr = require("./get_expression_with_for_domain.js")(node, node.logic?.for).astString;

      if (enableIterObject) {
        myForStr = (
         `Array.isArray(${loopStr}) ? ${loopStr}.length : Object.keys(${loopStr}).length)`
        )
      } else {
        myForStr = (
          loopStr + ".length"
        )
      }

      if (node.logic['for-index']) {
        ASSERT(node.logic['for-index'].type === 'Literal');
        myIndexExpression.push(
          node.logic['for-index'].value
        );
        
        // debugger
      } else {
        myIndexExpression.push(
          "'__index'"
        )
      }
    }


    if (node.logic?.if) {
      // debugger
      let {ifString, forItems, useIfFilter} = getIfString(node);

      if (useIfFilter) {
        // debugger

        if (myForStr) {
          node._nodeLength =(`(${myForStr}.filter((${forItems.join(",")}) => (${ifString})).length)`)
        } else {
          node._nodeLength = `(${ifString} ? 1 : 0)`
        }

        // debugger
      } else {
        node._nodeLength = `(${ifString} ? ${myForStr || 1} : 0)`
      }


    } else {
      if (myForStr) {
        node._nodeLength = myForStr;
      } else {
        node._nodeLength = 1;
      }
    }

    

    
    
  
    if (!myIndexExpression.length) {
      ASSERT(myIndexLiteral === myIndex);
      myIndexObj = myIndex;
    } else {
      if (myIndexLiteral) {
        myIndexExpression.push(myIndexLiteral)
      }
      myIndexObj = myIndexExpression.join(" + ");

      // console.log(myIndexObj)
      // debugger
    }
  
    node._nodeIndex = myIndexObj;
  }
  
  if (node.childNodes) {
    let childLiteral = 0;
    let childUnLiteral = [];

    node.childNodes.forEach(element => {
      appendChildIndex(element, enableIterObject);
      if (element._nodeLength === 0) return;

      if (element._nodeLength === 1) childLiteral++;
      else {
        childUnLiteral.push(element._nodeLength);
      }
    });

    if (!childUnLiteral.length) {
      node._childNodesLength = childLiteral;
      ASSERT(childLiteral === node.childNodes.filter(noCommentChildFilter).length);
    } else {
      node._childNodesLength = (childLiteral ? childLiteral + ' + ' : "") + childUnLiteral.join(" + ");
      // debugger
    }


  } else {
    node._childNodesLength = 0;
  }
}

function noCommentChildFilter(v) {
  return (v.tagName||typeof v.data === 'object'||(v.data&&!v.data.startsWith("<!--")))
}

function getIfString(node) {

  let {astString, forItems, useIfFilter} = require("./get_expression_with_for_domain.js")(node, node.logic?.if);
  return {ifString:astString, forItems, useIfFilter};
}