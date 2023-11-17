module.exports = mergeAttrs;

function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}
const ensureProperty = require("../helpers/ensure_property.js");
const javascript = require('../../parser/parse_ast/javascript');

function mergeAttrs(fromNode, toNode, cleanFromNode = false) {
  mergePureAttrs(fromNode, toNode, cleanFromNode);
  mergeEvents(fromNode, toNode, cleanFromNode);
  mergeLogic(fromNode, toNode, cleanFromNode);
}

function mergePureAttrs(fromNode, toNode, cleanFromNode) {
  Object.keys(fromNode.attrs).filter(v => ['class'].includes(v)).forEach((attrName) => {

    // if (attrName === "src") debugger

    if(!toNode.attrs) toNode.attrs = {};

    if (!toNode.attrs.hasOwnProperty(attrName)) {
      toNode.attrs[attrName] = fromNode.attrs[attrName];
      if (cleanFromNode) delete fromNode.attrs[attrName];
      return
    }

    if (typeof fromNode.attrs[attrName] === 'string' && typeof toNode.attrs[attrName] === 'string') {
        // fromNode.attrs[attrName] === 'string' && toNode.attrs[attrName] === 'string'
        if (toNode.attrs[attrName] === '') {
          toNode.attrs[attrName] = fromNode.attrs[attrName];
          if (cleanFromNode) delete fromNode.attrs[attrName];
          return
        }
        if (fromNode.attrs[attrName] === '') {
          return;
        }
        toNode.attrs[attrName] = toNode.attrs[attrName] + ' ' + fromNode.attrs[attrName];
        if (cleanFromNode)  delete fromNode.attrs[attrName];

      /**
       * fromNode.attrs[attrName] === 'string' && toNode.attrs[attrName] === 'object'
       *
       * class="container" => "class": "container"
       *
       * class="{{animation}}" =>
       * ```json
       *  {
       *    "class": {
       *      "type": "Identifier",
       *      "value": "animation"
       *    }
       *  }
       * ```
       *
       * =>
       *
       * class="container {{animation}}" =>
       * ```json
       *  {
       *    "class": {
       *      "type": "BinaryExpression",
       *      "operator": "+",
       *      "left": {
       *        "type": "Literal",
       *        "value": " container"
       *      }
       *      "right": {
       *        "type": "Identifier",
       *        "value": "animation"
       *      }
       *    }
       *  }
       * ```
       *
       * @type {Literal|*}
       */


      const fromNodeAttrValue = new javascript.astFactory.Literal(
        ' ' + fromNode.attrs[attrName]
      );
      toNode.attrs[attrName] = new javascript.astFactory.BinaryExpression(
        '+',
        toNode.attrs[attrName],
        fromNodeAttrValue
      );
    } else if (typeof fromNode.attrs[attrName] === 'object' &&  typeof toNode.attrs[attrName] === 'string') {

      if (fromNode.attrs[attrName].type === "BinaryExpression"
        && fromNode.attrs[attrName].operator === '+'
        && (fromNode.attrs[attrName].left.type === 'Literal' || fromNode.attrs[attrName].right.type === 'Literal')
      ) {
        if (fromNode.attrs[attrName].left.type === 'Literal') {
          fromNode.attrs[attrName].left.value = toNode.attrs[attrName] + " " + fromNode.attrs[attrName].left.value;
        } else if (fromNode.attrs[attrName].right.type === 'Literal') {
          fromNode.attrs[attrName].left.value = fromNode.attrs[attrName].right.value + " " + toNode.attrs[attrName];
        } else {
          ASSERT(false)
        }

        toNode.attrs[attrName] = fromNode.attrs[attrName];
      } else {
        toNode.attrs[attrName] = new javascript.astFactory.BinaryExpression(
          '+',
          new javascript.astFactory.Literal(toNode.attrs[attrName] + " "),
          fromNode.attrs[attrName]
        );
      }
    } else if (typeof fromNode.attrs[attrName] === 'string' &&  typeof toNode.attrs[attrName] === 'object') {

      if (toNode.attrs[attrName].type === "BinaryExpression"
        && toNode.attrs[attrName].operator === '+'
        && (toNode.attrs[attrName].left.type === 'Literal' || toNode.attrs[attrName].right.type === 'Literal')
      ) {
        if (toNode.attrs[attrName].right.type === 'Literal') {
          toNode.attrs[attrName].left.value = toNode.attrs[attrName].right.value + " " + fromNode.attrs[attrName];
        } else if (toNode.attrs[attrName].left.type === 'Literal') {
          toNode.attrs[attrName].left.value = fromNode.attrs[attrName] + " " + toNode.attrs[attrName].left.value;
        } else {
          ASSERT(false)
        }

      } else {
        toNode.attrs[attrName] = new javascript.astFactory.BinaryExpression(
          '+',
          toNode.attrs[attrName],
          new javascript.astFactory.Literal(" " + fromNode.attrs[attrName]),
        );
      }
    } else if (typeof fromNode.attrs[attrName] === 'object' &&  typeof toNode.attrs[attrName] === 'object') {
      toNode.attrs[attrName] = new javascript.astFactory.BinaryExpression(
        '+',
        toNode.attrs[attrName],
        new javascript.astFactory.BinaryExpression(
          '+',
          new javascript.astFactory.Literal(" "),
          fromNode.attrs[attrName],
        )
      );
    } else {
      ASSERT(false)
    }

    if (cleanFromNode) delete fromNode.attrs[attrName];


    // fromNode.attrs[attrName] === 'object' && toNode.attrs[attrName] === 'object'
    const space = new javascript.astFactory.Literal(' ');
    const leftBinaryExpression = new javascript.astFactory.BinaryExpression(
      '+',
      toNode.attrs[attrName],
      space
    );
    toNode.attrs[attrName] = new javascript.astFactory.BinaryExpression(
      '+',
      leftBinaryExpression,
      fromNode.attrs[attrName]
    );
    return delete fromNode.attrs[attrName];
  });
}

function mergeEvents(fromNode, toNode, cleanFromNode) {
  if (fromNode.events) {
    mergeEventsByType(fromNode, toNode, 'bind', cleanFromNode);
    mergeEventsByType(fromNode, toNode, 'catch', cleanFromNode);
  }
}

function mergeEventsByType(fromNode, toNode, type, cleanFromNode) {
  if (fromNode.events && fromNode.events[type]) {
    Object.keys(fromNode.events[type]).forEach((eventName) => {
      ensureProperty(toNode, 'events');
      ensureProperty(toNode.events, type);
      if (toNode.events[type][eventName]) {
        throw new Error(`Cannot merge event: ${eventName}`);
      }
      toNode.events[type][eventName] = fromNode.events[type][eventName];
      if (cleanFromNode) delete fromNode.events[type][eventName];
    });
  }
}

function mergeLogic(fromNode, toNode, cleanFromNode) {
  if (fromNode.logic) {
    mergeLogicFor(fromNode, toNode, cleanFromNode);
    mergeLogicIf(fromNode, toNode, cleanFromNode);
  }
}

function mergeLogicFor(fromNode, toNode, cleanFromNode) {
  if (fromNode.logic.for) {
    ensureProperty(toNode, 'logic');
    ASSERT(!toNode.logic["for"]);

    if (toNode.logic.for) {
      throw new Error('Cannot merge for');
    }
    toNode.logic.for = fromNode.logic.for;
    toNode.logic['for-item'] = fromNode.logic['for-item'];
    toNode.logic['for-index'] = fromNode.logic['for-index'];
    toNode.logic.key = fromNode.logic.key;
    
    if (cleanFromNode) {
      delete fromNode.logic.for;
      delete fromNode.logic['for-item'];
      delete fromNode.logic['for-index'];
      delete fromNode.logic.key;
    }
   
  }
}

function mergeLogicIf(fromNode, toNode, cleanFromNode) {
  if (fromNode.logic.if || fromNode.logic._mergedIf) {
    ensureProperty(toNode, 'logic');

    let fromNodeIf = fromNode.logic.if;

    if (!toNode.logic.if) {
      toNode.logic.if = fromNodeIf;
      if (cleanFromNode) delete fromNode.logic.if;
    } else if (typeof toNode.logic.if === 'object') {
      if (typeof fromNode.logic.if === 'object') {
        toNode.logic.if = new javascript.astFactory.LogicalExpression(
          '&&',
          fromNodeIf,
          toNode.logic.if
        );
        if (cleanFromNode) delete fromNode.logic.if;
      } else if (typeof fromNode.logic.if === 'string') {
        throw new Error('Why use string as logic if?');
      } else {
        throw new Error(
          'Error fromNode.logic.if type: ' + typeof fromNode.logic.if
        );
      }
    } else if (typeof toNode.logic.if === 'string') {
      throw new Error('Why use string as logic if?');
    } else {
      throw new Error('Error toNode.logic.if type: ' + typeof toNode.logic.if);
    }
  }

  if (toNode.logic.hasOwnProperty("elif")) {
    if (typeof toNode.logic.elif === 'object') {
      toNode.logic.elif = new javascript.astFactory.LogicalExpression(
        '&&',
        fromNodeIf,
        toNode.logic.elif
      );
      if (cleanFromNode) delete fromNode.logic.if;
    } else if (typeof toNode.logic.elif === 'string') {
      throw new Error('Why use string as logic if?');
    } 
  }

  if (toNode.logic.hasOwnProperty("else")) {
    delete toNode.logic.else;
    toNode.logic.elif = fromNodeIf;
    if (cleanFromNode) delete fromNode.logic.if;
  }

}