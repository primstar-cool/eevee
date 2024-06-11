const path = require('path');
const javascript = require("../../../parser/parse_ast/javascript/index.js");
const mustache = require('../../../_from_standard/helpers/mustache.js');

const cleanNodeLogic = require('../../helpers/clean_node_logic.js');
const cleanProperty = require('../../helpers/clean_property.js');
const ensureProperty = require('../../helpers/ensure_property.js');
const getEventName = require('../../helpers/get_event_name.js');
const createResolveTag = require("../../helpers/create_resolve_tag.js");
const mergeAttrs = require("../../helpers/merge_attrs.js");
const replaceRemT2Rpx = require("../../helpers/replace_rem_t_to_rpx.js");
const serializeLogic = require("../../helpers/serialize_logic_to_attr.js");
const resolveEventByType = require("../../helpers/resolve_event_by_type.js");
const stringifyStyleObject = require("../../helpers/stringify_style_object.js");
const convertBitOperator = require('../../../processor/processor_ast/convert_bit_operator.js');
const convertObjectArrayExpression = require('../../../processor/processor_ast/convert_object_array_expression.js');
const convertReverseOperator = require('../../../processor/processor_ast/convert_reverse_operator.js');

function convertUnsupportedAst(node, ast) {
  return convertBitOperator( convertObjectArrayExpression( convertReverseOperator(ast)));
}


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

module.exports = function standard2swan(
    root,
    {
      srcFilePath,
      destFilePath,
      rootSrcPath,
      mainClassName,
      screenWidthRem,
      getIncludedStandardTreeFn,
      onFoundImportTemplateFn,
      onFoundEventHandlerFn,
      resolveAssetsPathFn,
      cssDomain,
    } = {}
  ) {

    if (!rootSrcPath) rootSrcPath = srcFilePath ? require("path").dirname(srcFilePath) : "./";
    if (!mainClassName) {
      mainClassName = destFilePath.substr(destFilePath.lastIndexOf("/") + 1 , destFilePath.lastIndexOf("."));
      if (mainClassName === 'index') {
        mainClassName = destFilePath.substr(0, destFilePath.lastIndexOf("/")); // 倒数第二路径
        mainClassName = destFilePath.substr(destFilePath.lastIndexOf("/") + 1);
      }
      mainClassName = mainClassName[0].toUpperCase() + mainClassName.substr(1);
    }

    resolveInclude(root, {
      srcFilePath,
      destFilePath,
      rootSrcPath,
      getIncludedStandardTreeFn,
      onFoundImportTemplateFn,
    });
    // resolveBlock(root);
    // resolveAttrs(root);
    if (root.sourceType === 'vue')
    genSwanFilter(root, mainClassName);

    traverse(root, (node) => {
      // resolveTagTemplate(node, { onFoundImportTemplateFn });
      createResolveTag('div', 'view')(node);
      // createResolveTag('button')(node);
      createResolveTag('span', "span", 'h5-span')(node);

      if (root.sourceType === 'react_native'
      ) {
        createResolveTag('view', 'view', 'rn-view');// all relative
      }

      resolveTagImage(node);
      transformStyleRem2Rpx(node, cssDomain, screenWidthRem);

      resolveAttrsLogicFor(node);
      resolveAttrsLogicIf(node);
      resolveAttrsEvents(node, onFoundEventHandlerFn);
      // resolveImageSrc(node, { resolveAssetsPath });
  
      // finally put : before computed attrs
      resolveAttrsExpression(node);
      resolveDataExpression(node);

      if (node.logic && node.logic.rks) delete node.logic.rks;

      cleanNodeLogic(node);
    });
  };

  function resolveInclude(
    root,
    { srcFilePath, rootSrcPath, destFilePath, getIncludedStandardTreeFn, onFoundImportTemplateFn }
  ) {

    if (root.childNodes) {

      for (let i = 0; i < root.childNodes.length; ) {
        const node = root.childNodes[i];
        if (node.tagName === 'include') {
          ASSERT(getIncludedStandardTreeFn, 'Error getIncludedStandardTreeFn');

          const src = node.attrs.src;
          ASSERT (src, '<include /> missing src');

          node.attrs.src = src.replace("." + path.extname(src), ".wxml");
          // debugger

          const includedRoot = getIncludedStandardTreeFn(node, src, srcFilePath, rootSrcPath , destFilePath ? path.dirname(destFilePath) : undefined);
          // debugger
          resolveInclude(includedRoot, {
            srcFilePath: path.join(srcFilePath ? path.dirname(srcFilePath) : './', src),
            destFilePath,
            rootSrcPath,
            getIncludedStandardTreeFn, 
            onFoundImportTemplateFn
          });
          
          i++;

        } else {
          if (node.childNodes) {
            resolveInclude(node, {
              srcFilePath,
              destFilePath,
              rootSrcPath,
              getIncludedStandardTreeFn,
              onFoundImportTemplateFn,
            });
          }
          i++;
        }
      }
    }
  }
  
  
  function resolveBlock(root) {
    traverseBlock(root, (node) => {
      if (node.tagName === 'block') {
        if (node.attrs) {
          // 1. replace block children to block
          // 2. set block attrs onto children
          writeToValidChildNode(node);
        }
        replaceNode(node, node.childNodes);
      }
    });
  }

  function genSwanFilter(root, mainClassName) {
    const createMappedFunction = require("../../../processor/processor_xml_obj/create_mapped_function.js");
    // var { functionArray, referKeys } = createMappedFunction(node, true, true);

    traverse(root, (node) => {
      if (node.attrs)
      Object.keys(node.attrs).forEach((key) => {
        let attrValue = node.attrs[key];
  
        if (typeof attrValue === 'object') {
          let str = JSON.stringify(attrValue);
          if (str.includes("CallExpression")) {
            const mdName = _getModHash(str, mainClassName);
            attrValue = _genCallExpression(mdName, attrValue);
          }
          // delete node.attrs[key];
        } 
      });

      if (typeof node.data === 'object' && node.data !== null) {
        let str = JSON.stringify(node.data);
        // debugger
        if (str.includes("CallExpression")) {
          const mdName = _getModHash(str, mainClassName);
          node.data = _genCallExpression(mdName, node.data);
        }
      }

    });

    function _genCallExpression(mdName, expObj) {
      let fakeNode = {
        data: expObj
      }
      var { functionArray, referKeys} = createMappedFunction(fakeNode, true, false);
      // debugger
      let wxsStr = functionArray[0];
      wxsStr = wxsStr.substr(wxsStr.indexOf("function "));
      wxsStr = wxsStr.replace(
        "function (_cONTEXT)", `function (${referKeys.map(k=> "_cONTEXT_" + k).join(", ")})`
      );
      referKeys.forEach(
        k => {
          wxsStr = wxsStr.replace(new RegExp("_cONTEXT\\." + k, "g"), "_cONTEXT_" + k)
        }
      );
      // debugger

      root.childNodes.push(
        {
          tagName: 'filter',
          attrs: {
            module: "MD_" + mdName
          },
          childNodes: [
            {
              data: "export default {fn:" + wxsStr + "\n};"
            }
          ]
        }
      );
      return `{{MD_${mdName}.fn(${referKeys.join(", ")})}}`;

    }

    function _getModHash(str, mainClassName) {
      let d = 0xC29C07b9;
      str = "      " + str;//至少5位
      let r = 0 ;
      r = (str.charCodeAt(0)<<24) + (str.charCodeAt(1)<<16) + (str.charCodeAt(2)<<8) + str.charCodeAt(3)

      const len = str.length;

      for (let i = 4; i < len; i++) {
        r = ((r * 0xFF) + str.charCodeAt(i)) % d;
      }
      return (mainClassName ? mainClassName + "_" : '') + r.toString(36).toUpperCase();
    }
  }
  
  // function resolveAttrs(root) {
  //   traverse(root, (node) => {
  //     if (node.attrs)
  //     Object.keys(node.attrs).forEach((key) => {
  //       let attrValue = node.attrs[key];
  
  //       if (typeof attrValue === 'object') {
  //         attrValue = mustache.serialize(attrValue);
  //         // delete node.attrs[key];
  //         node.attrs[key] = attrValue;
  //       } 
  //     });
  //   });
  // }
  
  function traverseBlock(node, visitor, parent = null) {
    visitor(node, parent);
    if (node.childNodes) {
      for (let i = 0; i < node.childNodes.length; i++) {
        if (
          node.childNodes[i].tagName === 'block' &&
          node.childNodes[i].childNodes &&
          node.childNodes[i].childNodes.length === 0
        ) {
          continue;
        }
        traverseBlock(node.childNodes[i], visitor, node);
      }
    }
  }
  
  function writeToValidChildNode(root) {
    root.childNodes.forEach((node) => {
      if (node.tagName) {
        mergeAttrs(root, node);
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
  

  /**
   * Convert `<image />` to `<img >`
   */
  function resolveTagImage(node) {
    if (node.tagName === 'img') {
      node.tagName = 'image';
    }
  }
  
  function resolveAttrsLogicFor(node) {
    // debugger
    if (node.logic && node.logic.for) {
      ensureProperty(node, 'attrs');
  
      let useFilter = false;
      if (node.logic['if']) {

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

          let noMustacheIf = Object.assign({}, node.logic["if"]);

          if (node.attrs.style) {
            let needSemicolon = true;
            noMustacheIf.mustache = false;
            if (typeof node.attrs.style === 'string') {
              needSemicolon = !node.attrs.style.endsWith(";");
            } else if (typeof node.attrs.style === 'object') {
              if (node.attrs.style.type === 'BinaryExpression'
                && node.attrs.style.operator === '+'
                && node.attrs.style.right.type === 'Literal'
              ) {
                needSemicolon = !("" + node.attrs.style.right.value).endsWith(";");
              }

            } else {
              ASSERT(false);
            }

            let extraStyle = new javascript.astFactory.ConditionalExpression(
              noMustacheIf,
              new javascript.astFactory.Literal(`${needSemicolon?";":""}display:none;`),
              new javascript.astFactory.Literal(""),
            );
            extraStyle.mustache = true;

            node.attrs.style = new javascript.astFactory.BinaryExpression(
              "+",
              node.attrs.style,
              extraStyle,
            );
          } else {
            node.attrs.style = new javascript.astFactory.ConditionalExpression(
              noMustacheIf,
              new javascript.astFactory.Literal('display:none;'),
              new javascript.astFactory.Literal(""),
            );
            node.attrs.style.mustache = true;
          }


          if (node.childNodes) {
            node.childNodes.forEach(
              subNode => {

                if (!subNode.tagName) {
                  if (typeof subNode.data === 'string') {
                    subNode.data = new javascript.astFactory.Literal(subNode.data);
                  }
                  subNode.data = new javascript.astFactory.ConditionalExpression(
                    noMustacheIf,
                    subNode.data,
                    new javascript.astFactory.Literal(''),
                  ); 
                  subNode.data.consequent.mustache = false;
                  subNode.data.mustache = true;
                  // debugger
                  // mustache.serialize(subNode.data)

                } else {
                  ensureProperty(subNode, "logic");

                  if (subNode.logic["if"]) {
                    subNode.logic["if"] = new javascript.astFactory.LogicalExpression(
                      "&&",
                      Object.assgin({}, subNode.logic["if"]),
                      subNode.logic["if"]
                    );
                    subNode.logic["if"].mustache = true;
                    subNode.logic["if"].left.mustache = false;
                    subNode.logic["if"].right = false;

                  } else {
                    subNode.logic["if"] = node.logic["if"];
                  }


                }

              }
            )
          }

          delete node.logic["if"];

        }

      }


      node.attrs['s-for'] = `(${node.logic['for-item'] ? node.logic['for-item'].value : '_$_item'}${node.logic['for-index'] ? ' ,' +  node.logic['for-index'].value : ''}) in ${javascript.serialize(node.logic.for)}`;
        
     
      if (node.logic.key) {
        node.attrs['s-key'] = javascript.serialize(node.logic.key);
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

    if (!node.logic) return;

    if (node.logic['if']) {
      node.logic['if'] = convertUnsupportedAst(node, node.logic['if']);
    } else if (node.logic['elif']) {
      node.logic['elif'] = convertUnsupportedAst(node, node.logic['elif']);
    } else if (node.logic['else']) {
      node.logic['if'] = convertUnsupportedAst(node, node.logic['else']);
    }

    // if (node.logic.if) debugger
    serializeLogic(node, 'if', 's-if', true);
    serializeLogic(node, 'elif', 's-else-if', true);
    serializeLogic(node, 'else', 's-else', true);
    
    ASSERT(!node.logic ||
      !(node.logic.if ||node.logic.elif || node.logic.else), 'Unhandled if logic'
    );
  }
  
  
  function resolveAttrsEvents(node, onFoundEventHandlerFn) {
    const eventNameMapping = {
      click: 'tap',
      // longtap: new Error('longtap is not supported yet'),
    };

    resolveEventByType(node, 'bind','bind', '', eventNameMapping, {
      onFoundEventHandlerFn,
    });
    resolveEventByType(node, 'catch','catch', '', eventNameMapping, {
      onFoundEventHandlerFn,
    });
    resolveEventByType(node, 'capture-bind','capture-bind', '', eventNameMapping, {
      onFoundEventHandlerFn,
    });
    resolveEventByType(node, 'capture-catch','capture-catch', '', eventNameMapping, {
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
        attrValue = mustache.serialize(convertUnsupportedAst(node, attrValue));
        // delete node.attrs[attrName];
        node.attrs[attrName] = attrValue;
      }
    });
  }

  function resolveDataExpression(node) {
    if (!node.data) {
      return;
    }
  
    if (typeof node.data === 'string' )
    {

        let t = node.data;
        let tt = t.trim();
        if (tt !== t) // 百度bug会去掉最前面的空格
        {
            let index = t.indexOf(tt);
            node.data = `{{${JSON.stringify(t.substr(0, index))}}}${t.substr(index)}`;
        }
        return;
        
    } else if (node.data && typeof node.data === "object") {
        node.data = mustache.serialize(convertUnsupportedAst(node, node.data));
    }
  }
  
  function transformStyleRem2Rpx(node, cssDomain, screenWidthRem) {

    const replaceRem2Rpx = replaceRemT2Rpx(screenWidthRem);

    if (node.attrs && node.attrs.style) {
      if (
        typeof node.attrs.style === 'string' &&
        node.attrs.style.includes('rem')
      ) {
        node.attrs.style = replaceRem2Rpx(node.attrs.style);
      } else if (typeof node.attrs.style === 'object') {

        // debugger

        if (node.attrs.style.type === 'CallExpression'
        && node.attrs.style.callee.type === 'Identifier'
        && node.attrs.style.callee.name === 'stringifyStyle'
        && node.attrs.style.callee.name === 'stringifyStyle'

        ) {
          ASSERT(node.attrs.style.arguments && node.attrs.style.arguments.length === 1);
          node.attrs.style = stringifyStyleObject(node.attrs.style)
          
        }


        javascript.traverse(node.attrs.style, (ast) => {
          if (
            ast.type === javascript.astTypes.LITERAL &&
            typeof ast.value === 'string' &&
            ast.value.includes('rem')
          ) {
            ast.value = replaceRem2Rpx(ast.value);
          }
        });
      }
    }
  }
  
