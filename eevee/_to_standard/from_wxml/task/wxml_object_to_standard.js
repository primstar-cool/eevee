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

  if (node.includedContent) {
    traverse(node.includedContent, visitor, null);
  }
}

module.exports = function wxml2standard(root, filePath, rootSrcPath) {

  // if (!targetEnv) {
  //   throw new Error("no targetEnv");
  // }
  
  traverse(root, (node) => {
    if (!node.attrs) {
      return;
    }
    tryResolveLogicFor(node);
    tryResolveLogicIf(node);

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

      // if (attrName.startsWith ('data-')) {
        
      //   // attrValue = attrValue.slice(1, -1); // remove old code and unknwon why????????
        
      // } else
      
      {
        if (
          typeof attrValue === 'string' &&
          attrValue.includes('{{') &&
          attrValue.includes('}}') //&& !attrValue.includes('...scopeData') //todo : wxml2standard 支持{{...data}}
        ) {
          // parse to expression
          node.attrs[attrName] = mustache.parse(attrValue);
        } else {
          node.attrs[attrName] = attrValue;
        }
      }
      

      tryResolveEvents(node, attrName, 'bind');
      tryResolveEvents(node, attrName, 'catch');
      tryResolveEvents(node, attrName, 'capture-bind');
      tryResolveEvents(node, attrName, 'capture-catch');
    });
  });

  
  root.sourceType = 'wxml';
  if (rootSrcPath && filePath)
    root.path = require("path").relative(rootSrcPath, filePath);
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
    const eventName = removeEventPrefix(attrName, type);
    const attrValue = node.attrs[attrName];
    delete node.attrs[attrName];
    if (!node.events) {
      node.events = {};
    }

    if (!node.events[type]) {
      node.events[type] = {};
    }
    node.events[type][eventName] = attrValue;
  }
}

function tryResolveLogicFor(node) {
  const forAttrName = 'wx:for';
  const forItemAttrName = 'wx:for-item';
  const forIndexAttrName = 'wx:for-index';
  const keyAttrName = 'wx:key';
  if (node.attrs && node.attrs.hasOwnProperty(forAttrName)) {

    let forVarString =  node.attrs[forAttrName];
    let forVar;
    
    if (forVarString.includes('{{') && forVarString.includes('}}')) {
      forVarString = forVarString.trim();
      if (forVarString.startsWith('{{') && forVarString.endsWith('}}')) {
        forVarString = forVarString.slice(2, -2);
        forVar = javascript.parse(forVarString).body[0].expression;
        forVar.mustache = true;
      }
    }

    if (!forVar) {
      forVar = new javascript.astFactory.Literal(node.attrs[forAttrName]);
      console.warn(`${attrName} value should be in mustache at node: ${stringifyNode(node)}, or else it will be treated as a const string`);
    
    }
    

    const forItemVarString = getNoMustacheAttrValue(
      node,
      forItemAttrName,
      'item'
    );
    const forIndexVarString = getNoMustacheAttrValue(
      node,
      forIndexAttrName,
      'index'
    );

    const keyVar = getKey(node, keyAttrName, forItemVarString, forIndexVarString);

    delete node.attrs[forAttrName];
    delete node.attrs[forItemAttrName];
    delete node.attrs[forIndexAttrName];
    delete node.attrs[keyAttrName];

    if (!node.logic) {node.logic = {};}
    
    node.logic.for = forVar;
    node.logic['for-index'] = new javascript.astFactory.Literal(forIndexVarString);
    node.logic['for-item'] = new javascript.astFactory.Literal(forItemVarString);
    node.logic.key = keyVar;
  }
}

function tryResolveLogicIf(node) {
  if (!node.logic) {node.logic = {};}

  resolveLogicIfByKey(node, 'wx:if', 'if');
  resolveLogicIfByKey(node, 'wx:elif', 'elif');
  resolveLogicIfByKey(node, 'wx:else', 'else');
}

function resolveLogicIfByKey(node, attrName, type) {
  if (node.attrs && node.attrs.hasOwnProperty(attrName)) {
    var attrValue = node.attrs[attrName];
    if (
      typeof attrValue === 'string' &&
      attrValue.includes('{{') &&
      attrValue.includes('}}')
    ) {
      if (type === 'if' || type === 'elif') {

        attrValue.replace("!true ", "0 ");
        attrValue.replace("!false ", "1 ");
        attrValue.replace("true ", "1 ");
        attrValue.replace("false ", "0 ");
      }

      // if (attrValue==="{{true}}" || attrValue==="{{1}}"
      //   && nextChildNoElseIf
      // ) {

      // }
      // else
      {
        node.logic[type] = mustache.parse(attrValue);
      }
    } else {
      node.logic[type] = new javascript.astFactory.Literal(node.attrs[attrName])

      // node.logic[type] = node.attrs[attrName];
    }
    delete node.attrs[attrName];
  }
}

function getKey(node, attrName, forItemVarString, forIndexVarString) {
  let attrValue = node.attrs[attrName];

  if (attrName === 'wx:key') {
    if (!attrValue) {
      attrValue = '{{' + forItemVarString + '}}';
    } else if (attrValue === '*this') {
      attrValue = '{{' + forItemVarString + '}}';
    } else {
      if (!attrValue.includes('{{')) {
        attrValue = '{{' + forItemVarString + '.' + attrValue + '}}';
      }
    }
  }

  return new mustache.parse(attrValue);
}

function getMustacheAttrValue(node, attrName) {
  const attrValue = node.attrs[attrName];
  if (attrValue.startsWith('{{') && attrValue.endsWith('}}')) {
    return attrValue.slice(2, -2);
  }
  throw new Error(
    `${attrName} value should be in mustache at node: ${stringifyNode(node)}`
  );
}

function getNoMustacheAttrValue(node, attrName, defaultValue) {
  if (!node.attrs.hasOwnProperty(attrName)) {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(`Missing ${attrName} at node: ${stringifyNode(node)}`);
  }
  const attrValue = node.attrs[attrName];
  if (attrValue.startsWith('{{') && attrValue.endsWith('}}')) {
    console.warn(
      `${attrName} value should not be in mustache at node: ${stringifyNode(
        node
      )}`
    );
    return attrValue.slice(2, -2);
  }
  return attrValue;
}

function stringifyNode(node) {
  let attsString = '';
  Object.keys(node.attrs).forEach((attrName) => {
    attsString += ` ${attrName}="${node.attrs[attrName]}"`;
  });
  return `<${node.tagName}${attsString}></${node.tagName}>`;
}

function ensureProperty(object, property) {
  if (!object[property]) {
    object[property] = {};
  }
}
