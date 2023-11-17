const path = require('path');
const javascript = require("../../../parser/parse_ast/javascript/index.js");
const mustache = require('../../../_from_standard/helpers/mustache.js');

const createResolveTag = require("../../helpers/create_resolve_tag.js");
const replaceRpx2Rem = require("../../helpers/replace_rpx_to_rem.js");
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



module.exports = function standard2h5(
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
      inlineInclude = true
    } = {}
  ) {

    if (!rootSrcPath) rootSrcPath = srcFilePath ? require("path").dirname(srcFilePath) : "./";
    const isFromMP = root.sourceType === 'wxml'|| root.sourceType === 'wxmp';

    if (isFromMP) {
      resolveInclude(root, {
        srcFilePath,
        destFilePath,
        rootSrcPath,
        getIncludedStandardTreeFn,
        onFoundImportTemplateFn,
        inlineInclude
      });
      resolveBlock(root);
    }

    if (isFromMP) {
        traverse(root, (node) => {

        // resolveTagTemplate(node, { onFoundImportTemplateFn });
            createResolveTag('view', 'div')(node);
            createResolveTag('button', 'button', "wxmp-button")(node);
            createResolveTag('text', 'span', "wxmp-text" )(node); //TODO deal spec text attrs
    
            resolveTagImage(node);
            transformStyleRpx2Rem(node);
    
        });
    } else if (root.sourceType === 'react_native') {
      traverse(root, (node) => {
        createResolveTag('view', 'div', 'rn-view')(node);
        transformStyleRpx2Rem(node);
      })
    }
   
  };
  
  
  
  
  
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
  
  /**
   * Convert `<image />` to `<img >`
   */
  function resolveTagImage(node) {
    if (node.tagName === 'image') {
      node.tagName = 'img';
      //TODO deal spec image attrs
    }
  }
  
  function transformStyleRpx2Rem(node) {
    if (node.attrs && node.attrs.style) {
      if (
        typeof node.attrs.style === 'string' &&
        node.attrs.style.includes('rpx')
      ) {
        node.attrs.style = replaceRpx2Rem(node.attrs.style);
      } else if (typeof node.attrs.style === 'object') {
        javascript.traverse(node.attrs.style, (ast) => {
          if (
            ast.type === javascript.astTypes.LITERAL &&
            typeof ast.value === 'string' &&
            ast.value.includes('rpx')
          ) {
            ast.value = replaceRpx2Rem(ast.value);
          }
        });
      }
    }
  }
  

  

