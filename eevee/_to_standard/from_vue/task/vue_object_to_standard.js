/**
 * @since 20231010
 * @author blueshell
 *  class node: {
 *    tagName?: string,
 *    children?: Array<node>,
 *    attrs?: {
 *      [string]: object|string,
 *    },
 *    events?: {
 *      bind?: {
 *        [string]: object|string,
 *      },
 *      catch?: {
 *        [string]: object|string,
 *      },
 *      'capture-bind'? : {
 *  *      [string]: object|string,
 *      },
 *      'capture-catch'? : {
 *  *      [string]: object|string,
 *      }
 *    },
 *    logic?: {
 *      for?: expression|string,
 *      for-item?: expression,
 *      for-index?: expression,
 *      key?: expression|string,
 *      if?: expression,
 *      elif?: expression,
 *      else?: expression, p
 *      env-if?: enum string
 *    },
 *    includedContent: node,
 *    styleContent: object,
 *    sourceType: enum string
 *    path: string
 *  }
 */

const javascript = require('../../../parser/parse_ast/javascript/index.js');
const mustacheParser = require('../../../parser/parse_mustache.js');

const mustache = {
  parse: function (input) {
    return mustacheParser.parse(input, javascript);
  }
}


function traverse(node, visitor, parent = null) {
  visitor(node, parent);
  if (node.childNodes) {
    node.childNodes.forEach((childNode) => {
      traverse(childNode, visitor, node);
    });
  }
}

module.exports = function vue2standard(root, filePath, rootSrcPath) {

 
  traverse(root, (node) => {
    if (!node.attrs) {
      return;
    }
    tryResolveLogicFor(node);
    tryResolveLogicIf(node);
    tryResolveLogicEnvIf(node);


    if (node.data) {
      let attrValue = node.data;
      if (
        typeof attrValue === 'string' &&
        attrValue.includes('{{') &&
        attrValue.includes('}}')
      ) {
        node.data = mustache.parse(attrValue);
      }
    }

    Object.keys(node.attrs).forEach((attrName) => {
      let attrValue = node.attrs[attrName];
      // 环境判断做处理

      if (attrName[0] === ":") {
        // debugger
        delete node.attrs[attrName]
        attrName = attrName.substr(1);
        attrValue = `{{${attrValue}}}`;
      }

      if (attrName.startsWith('data-')) {
        if (!(attrValue.includes('{{') && attrValue.includes('}}'))) {
          //simple string do nothing
          // console.warn(`Literal  ${attrName}` + stringifyNode(node));
        } else {
          //in vue dataset always export as a string, for reuse function, we polyfill it;
          // debugger
          let dataAst = mustache.parse(attrValue);
          if (dataAst.type === 'Literal') {
            dataAst.value = "" + dataAst.value; //must be string
          } else if (dataAst.type === 'BinaryExpression' && dataAst.operator === '+' 
          && ((dataAst.left.type === 'Literal' && typeof dataAst.left.value === 'string')
            || (dataAst.right.type === 'Literal' && typeof dataAst.right.value === 'string'))
          ) {
            //any type plus a string it will be a string at last
          } else {
            dataAst =  {
              type: "BinaryExpression",
              left: {
                type: 'Literal',
                value: ""
              },
              operator: '+',
              right: dataAst
            }
          }
          node.attrs[attrName] = dataAst
          // debugger
        }
        // attrValue = attrValue.slice(1, -1); // remove old code and unknwon why????????
        
      } else {
        if (
          typeof attrValue === 'string' &&
          attrValue.includes('{{') &&
          attrValue.includes('}}') //&& !attrValue.includes('...scopeData') //todo : wxml2standard 支持{{...data}}
        ) {
          // parse to expression
          node.attrs[attrName] = mustache.parse(attrValue);
        } else {
          //do nothing
        }
      }

      tryResolveEvents(node, attrName, '@');
      // tryResolveEvents(node, attrName, 'catch');
      // tryResolveEvents(node, attrName, 'capture-bind');
      // tryResolveEvents(node, attrName, 'capture-catch');
    });
  });

  root.sourceType = 'vue';
  if (rootSrcPath && filePath)
    root.path = require("path").relative(rootSrcPath, filePath).replace(/\\/g, "/");
  if (root.childNodes) {
    root.childNodes.forEach(
      n => {
        // debugger
        if (n.tagName === 'template'
        || n.tagName === 'script'
        || n.tagName === 'style'
        ) 
        {
          n.sourceType = 'vue';

          if (n.tagName === 'style') {
            // debugger
            n.styleContent = require("../../../parser/parse_css_like/index.js")(n.childNodes[0].data);

          }
        } else {
          debugger
        }
      }
    );
  }
 

};



function removeEventPrefix(name, type) {
  let event = name.slice(type.length);
  if (event.startsWith(':')) {
    event = event.slice(1);
  }
  return event;
}

function tryResolveEvents(node, attrName, type) {
  if (attrName.startsWith(type)) {
    // event binding
    let eventName = removeEventPrefix(attrName, type);
    const attrValue = node.attrs[attrName];
    delete node.attrs[attrName];
    if (!node.events) {node.events = {};}

    const isCatch = attrName.endsWith(".stop")
    type = isCatch ? 'catch' : 'bind';
    if (isCatch) {
      eventName = eventName.slice(0, -5);
    }
    if (eventName === 'click') eventName = 'tap';

    if (!node.events[type]) {
      node.events[type] = {};
    }
    node.events[type][eventName] = attrValue;
  }
}


function tryResolveLogicFor(node) {

  if (!node.attrs) return;

  const forAttrName = 'v-for';
  // const forItemAttrName = 'wx:for-item';
  // const forIndexAttrName = 'wx:for-index';
  const keyAttrName = ':key';
  if (node.attrs.hasOwnProperty(forAttrName)) {
    if (!node.logic) node.logic = {};


    let forVarStringAll = node.attrs[forAttrName];
    forVarStringAll = forVarStringAll.replace(/[\)]/g, ") "); // (item,index)in"abc" => (item,index) in"abc"
    
    const inIndex = Math.max(forVarStringAll.indexOf(" in "), forVarStringAll.indexOf(` in"`), forVarStringAll.indexOf(` in'`));
    let forVar;
    let keyVar;

    const forVarString = forVarStringAll.substr(inIndex + 3).trim();

    if (!isNaN(forVarString)) {
      forVar = new javascript.astFactory.Literal(Number(forVarString));
      forVar.mustache = true;
    } else if (
    (forVarString[0] === `"` || forVarString[0] === `'`)
     && forVarString[0] === forVarString[forVarString,length -1]
    ) {
      forVar = new javascript.astFactory.Literal(forVarStringRaw.slice(1, -1));
      forVar.mustache = true;
    } else {
      forVar = javascript.parse(forVarString).body[0].expression;
      forVar.mustache = true;
    }

    let varIndexString = forVarStringAll.substr(0, inIndex).trim();
    if (varIndexString[0] === '(') {
      if (varIndexString[varIndexString.length-1] === ")") {
        varIndexString = varIndexString.slice(1,-1);
      } else {
        throw new Error(
          `${forVarStringAll} compiled error node: ${stringifyNode(node)}`
        );
      }
    }

    let varIndexArr = varIndexString.split(",").map(v=>v.trim());
    const forItemVarString = varIndexArr[0];
    const forIndexVarString = varIndexArr.length === 3 ? varIndexArr[2] : (varIndexArr[1] || null);
    
    if (varIndexArr.length === 3) {
      throw new Error(
        `${forVarStringAll} v-for a object with index support later: ${stringifyNode(node)}`
      );
    }

    let forKeyString = node.attrs[keyAttrName];
    if (forKeyString) {
      keyVar = javascript.parse(forKeyString).body[0].expression;
      keyVar.mustache = true;
    } else {
      // keyVar = new javascript.astFactory.Identifier(forItemVarString);
      // keyVar.mustache = true;
    }

    delete node.attrs[forAttrName];
    delete node.attrs[keyAttrName];

    if (!node.logic) {node.logic = {};}

    node.logic.for = forVar;
    if (forIndexVarString) node.logic['for-index'] = new javascript.astFactory.Literal(forIndexVarString);
    node.logic['for-item'] = new javascript.astFactory.Literal(forItemVarString);

    if (keyVar) node.logic.key = keyVar;
  }
}

function tryResolveLogicIf(node) {

  if (!node.attrs) return;

  if (node.attrs['v-if'] || node.attrs['v-else-if'] || node.attrs['v-else']) {
    if (!node.logic) node.logic = {};

    resolveLogicIfByKey(node, 'v-if', 'if');
    resolveLogicIfByKey(node, 'v-else-if', 'elif');
    resolveLogicIfByKey(node, 'v-else', 'else');
  }


}

function resolveLogicIfByKey(node, attrName, type) {
  if (node.attrs && node.attrs.hasOwnProperty(attrName)) {
    var attrValue = node.attrs[attrName];
    if (typeof attrValue === 'string') {
      // if (type === 'if' || type === 'elif') {

      //   attrValue.replace("!true ", "0 ");
      //   attrValue.replace("!false ", "1 ");
      //   attrValue.replace("true ", "1 ");
      //   attrValue.replace("false ", "0 ");
      // }
      {
        node.logic[type] = mustache.parse(`{{${attrValue}}}`);
      }
    } else if (attrValue === true) {
      node.logic[type] = new javascript.astFactory.Literal(node.attrs[attrName])
    }

    delete node.attrs[attrName];
  }
}

function tryResolveLogicEnvIf(node) {

  if (node.attrs && node.attrs["env-if"]) {
    
    if (!node.logic) node.logic = {};

    node.logic["env-if"] =  node.attrs['env-if'];
    delete node.attrs['env-if']
  }

}

// function getKey(node, attrName, forItemVarString, forIndexVarString) {
//   let attrValue = node.attrs[attrName];

//   if (attrName === ':key') {
//     if (!attrValue) {
//       attrValue = '{{' + forItemVarString + '}}';
//     } else if (attrValue === '*this') {
//       attrValue = '{{' + forItemVarString + '}}';
//     } else {
//       if (!attrValue.includes('{{')) {
//         attrValue = '{{' + forItemVarString + '.' + attrValue + '}}';
//       }
//     }
//   }

//   return new mustache.parse(attrValue);
// }



function stringifyNode(node) {
  let attsString = '';
  Object.keys(node.attrs).forEach((attrName) => {
    attsString += ` ${attrName}="${node.attrs[attrName]}"`;
  });
  return `<${node.tagName}${attsString}></${node.tagName}>`;
}
