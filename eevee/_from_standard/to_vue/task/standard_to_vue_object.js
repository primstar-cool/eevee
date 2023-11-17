const path = require('path');
const javascript = require("../../../parser/parse_ast/javascript/index.js");
const mustache = require('../../../_from_standard/helpers/mustache.js');

const cleanNodeLogic = require('../../helpers/clean_node_logic.js');
const cleanProperty = require('../../helpers/clean_property.js');
const ensureProperty = require('../../helpers/ensure_property.js');
const getEventName = require('../../helpers/get_event_name.js');
const createResolveTag = require("../../helpers/create_resolve_tag.js");
const mergeAttrs = require("../../helpers/merge_attrs.js");
const replaceRpx2Rem = require("../../helpers/replace_rpx_to_rem.js");
const serializeLogic = require("../../helpers/serialize_logic_to_attr.js");
const resolveEventByType = require("../../helpers/resolve_event_by_type.js");
const replaceNode =  require("../../helpers/replace_node.js");
const resolveInclude = require("../../helpers/resolve_include.js");
const resolveBlock = require("../../helpers/resolve_block.js");



function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
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



module.exports = function standard2vue(
    root,
    {
      srcFilePath,
      destFilePath,
      rootSrcPath,
      mainClassName,
      getIncludedStandardTreeFn,
      onFoundImportTemplateFn,
      onFoundEventHandlerFn,
      resolveAssetsPathFn,
      inlineInclude = true,
      useVue3
    } = {}
  ) {

    require("../../to_h5_common/task/standard_to_h5_object.js")(
      root, 
      {
        srcFilePath,
        destFilePath,
        rootSrcPath,
        mainClassName,
        getIncludedStandardTreeFn,
        onFoundImportTemplateFn,
        onFoundEventHandlerFn,
        resolveAssetsPathFn,
        inlineInclude
      }
    );

    if (!rootSrcPath) rootSrcPath = srcFilePath ? require("path").dirname(srcFilePath) : "./";


    resolveDataSet(root);
    traverse(root, (node) => {

      // createResolveTag('scroll-view')(node);
      // createResolveTag('rich-text')(node);

      resolveAttrsLogicFor(node, useVue3);
      resolveAttrsLogicIf(node);
      resolveAttrsEvents(node, onFoundEventHandlerFn);

      if (resolveAssetsPathFn) {
        resolveImageSrc(node, resolveAssetsPathFn);
      }
  
      // finally put : before computed attrs
      resolveAttrsExpression(node);
      resolveDataExpression(node);

      if (node.logic && node.logic.rks) delete node.logic.rks;

      cleanNodeLogic(node);
    });
  };
  
  
  
  function resolveDataSet(root) {
    const isFromMP = root.sourceType === 'wxml'|| root.sourceType === 'wxmp';

    traverse(root, (node) => {
      if (!node.attrs) return;
      let hasDataSet = 0;
      Object.keys(node.attrs).forEach((key) => {
        let attrValue = node.attrs[key];

        if (~key.indexOf('data-')) {
          hasDataSet++;
          if (typeof attrValue === 'object') {
            attrValue = javascript.serialize(attrValue);
            delete node.attrs[key];
            if (isFromMP) {
              node.attrs[`:${key}`] = 'JSON.stringify(' + attrValue + ')';
            } else {
              node.attrs[`:${key}`] = attrValue;
            }
          } else {
            if (isFromMP) {
              node.attrs[key] = '&quot;' + node.attrs[key] + '&quot;';
            }
          }
        }

        
      });
      // debugger
      if (hasDataSet && 
        (isFromMP
        || root.sourceType === 'swan'
        || root.sourceType === 'ttma'
        || root.sourceType === 'skmp'
        || root.sourceType === 'react'
      )
      ) {
        node.attrs['data-__data-set-need-parse'] = '1';
      }

    });
  }
  
  
  
  /**
   * Convert `<template is="name"></template>` to `<component is="tag-template__name"></component>`
   * Remove `<template name="template-name"></template>`
   */
  // function resolveTagTemplate(node, { onFoundImportTemplateFn }) {
  //   if (node.tagName === 'template') {
  //     const isAttr = node.attrs.is;
  //     const nameAttr = node.attrs.name;
  //     if (isAttr) {
  //       node.tagName = 'component';
  //       node.attrs.is = 'tag-template__' + isAttr;
  //       const dataAttr = node.attrs.data;
  //       if (dataAttr) {
  //         // todo 未处理data传值的情况
  //       }
  //     } else if (nameAttr) {
  //       if (onFoundImportTemplateFn) {
  //         onFoundImportTemplateFn({
  //           type: 'template',
  //           src: nameAttr,
  //           actNode: Object.assign({}, node),
  //         });
  //       }
  //       replaceNode(node);
  //     } else {
  //       throw new Error('Unexpected template');
  //     }
  //   }
  // }
  
 

  
  function resolveAttrsLogicFor(node, useVue3) {
    // debugger
    if (node.logic && node.logic.for) {
      ensureProperty(node, 'attrs');
  
      let useFilter = false;
      if (useVue3 && node.logic['if']) {

        const createMappedFunction = require("../../../processor/processor_xml_obj/create_mapped_function.js");
        let ifString = createMappedFunction.createFunctionStr(node.logic["if"]);

        // debugger


        let forItem = node.logic['for-item'] ? JSON.stringify(node.logic['for-item'].value) : undefined;
        let forIndex = node.logic['for-index'] ? JSON.stringify(node.logic['for-index'].value) : undefined;

        let forIndexParsed;
        let forItemParsed;
        
        if (typeof forItem === 'string' && forItem) forItemParsed = JSON.parse(forItem);
        if (typeof forIndex === 'string' && forIndex) forIndexParsed = JSON.parse(forIndex);
        
        // debugger

        let ifIncludeForItem;
        let ifIncludeForIndex;
        
        ifIncludeForItem =  forItem && ifString.includes(`_cONTEXT[${forItem}]`) || ifString.includes(`_cONTEXT.${forItemParsed}`);
        ifIncludeForIndex = forIndex && ifString.includes(`_cONTEXT[${forIndex}]`) || ifString.includes(`_cONTEXT.${forIndexParsed}`);


        let isTotalIf = !ifIncludeForItem && !ifIncludeForIndex;
   
        if (!isTotalIf) {
          // debugger

          let ifStringReturn = ifString.substring(ifString.indexOf("return") + 6, ifString.lastIndexOf(";")).trim();

          // debugger
          ifStringReturn = ifStringReturn.replace(
            new RegExp(`_cONTEXT\\.${forItemParsed}`, "g"), forItemParsed
          );
      
          if (forIndexParsed) {
            ifStringReturn = ifStringReturn.replace(
                new RegExp(`_cONTEXT\\.${forIndexParsed}`, "g"), forIndexParsed
            );
         }
          // debugger

          let filterFunc = `(${JSON.parse(forItem)}${ifIncludeForIndex? "," + JSON.parse(forIndex):""}) => ${ifStringReturn}`

          delete node.logic["if"];
          node.attrs['v-for'] = `(${node.logic['for-item'] ? node.logic['for-item'].value : '_$_item'}${node.logic['for-index'] ? ' ,' +  node.logic['for-index'].value : ''}) in ${javascript.serialize(node.logic.for)}.filter(${filterFunc})`;

          useFilter = true;
        }

      }


      if (!useFilter) {
        node.attrs['v-for'] = `(${node.logic['for-item'] ? node.logic['for-item'].value : '_$_item'}${node.logic['for-index'] ? ' ,' +  node.logic['for-index'].value : ''}) in ${javascript.serialize(node.logic.for)}`;
        
      }
     
      if (node.logic.key) {
        node.attrs[':key'] = javascript.serialize(node.logic.key);
      }
  
      delete node.logic.for;
      delete node.logic['for-item'];
      delete node.logic['for-index'];
      delete node.logic.key;
    }
  
    ASSERT(!node.logic ||
      !(node.logic.for || node.logic['for-item'] || node.logic['for-index'] || node.logic.key), 'Unhandled for logic'
    );
  }
  
  function resolveAttrsLogicIf(node) {
    
    serializeLogic(node, 'if', 'v-if', false);
    serializeLogic(node, 'elif', 'v-else-if', false);
    serializeLogic(node, 'else', 'v-else', false);

    ASSERT(!node.logic ||
      !(node.logic.if ||node.logic.elif || node.logic.else), 'Unhandled if logic'
    );
  }
  
  
  function resolveAttrsEvents(node, onFoundEventHandlerFn) {
    const eventNameMapping = {
      tap: 'click',
      get longtap() {
        ASSERT(false, 'longtap is not supported yet')
      }
    };
    resolveEventByType(node, 'bind', '@', '', eventNameMapping, {
      onFoundEventHandlerFn,
    });
    resolveEventByType(node, 'catch', '@', '.stop', eventNameMapping, {
      onFoundEventHandlerFn,
    });
    resolveEventByType(node, 'capture-bind', '@', '.capture', eventNameMapping, {
      onFoundEventHandlerFn,
    });
    resolveEventByType(node, 'capture-catch', '@', '.stop.capture', eventNameMapping, {
      onFoundEventHandlerFn,
    });
    cleanProperty(node, 'events');
  }
  
  
  function resolveAttrsExpression(node) {
    if (!node.attrs) {
      return;
    }
  
    Object.keys(node.attrs).forEach((attrName) => {
      let attrValue = node.attrs[attrName];
      if (typeof attrValue === 'object') {
        attrValue = javascript.serialize(attrValue);
        delete node.attrs[attrName];
        node.attrs[`:${attrName}`] = attrValue;
      }
    });
  }

  function resolveDataExpression(node) {
    if (!node.data) {
      return;
    }
    if (typeof node.data === 'object') {
      node.data = mustache.serialize(node.data);
    }
  }
  
  
  function resolveImageSrc(node, resolveAssetsPath) {
    if (
      resolveAssetsPath &&
      node.tagName === 'img' &&
      node.attrs &&
      node.attrs.src
    ) {
      node.attrs.src = resolveAssetsPath(node.attrs.src);
    }
  }