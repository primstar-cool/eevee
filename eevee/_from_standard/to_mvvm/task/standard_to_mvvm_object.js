const path = require('path');
// const javascript = require("../../../parser/parse_ast/javascript/index.js");
// const mustache = require('../../../_from_standard/helpers/mustache.js');

// const cleanNodeLogic = require('../../helpers/clean_node_logic.js');
// const cleanProperty = require('../../helpers/clean_property.js');
const ensureProperty = require('../../helpers/ensure_property.js');
// const getEventName = require('../../helpers/get_event_name.js');
// const createResolveTag = require("../../helpers/create_resolve_tag.js");
// const mergeAttrs = require("../../helpers/merge_attrs.js");
const replaceRemT2Rpx = require("../../helpers/replace_rem_t_to_rpx.js");

// const serializeLogic = require("../../helpers/serialize_logic_to_attr.js");
// const resolveEventByType = require("../../helpers/resolve_event_by_type.js");
const stringifyStyleObject = require("../../helpers/stringify_style_object.js");
const analysisIsStaticNode = require("../../helpers/analysis_is_static_node.js");

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

module.exports = function standard2mvvm(
    root,
    {
      srcFilePath,
      destFilePath,
      rootSrcPath,
      mainClassName,
      analysisReferKeysDepth,
      analysisStatic,

      getIncludedStandardTreeFn,
      onFoundImportTemplateFn,
      onFoundEventHandlerFn,
      resolveAssetsPathFn,
      cssDomain
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

    traverse(root, (node) => {
      // resolveTagTemplate(node, { onFoundImportTemplateFn });
      mergeTextNode(node);
      camelDatasetAtrrs(node);

      transformStyleRem2Rpx(node, cssDomain);
      expanedLiteralAttrsExpression(node);
      expanedLiteralDataExpression(node);
      expanedLiteralLogicUuidExpression(node);

    });

    if (analysisStatic) analysisIsStaticNode(root);
    const defineNodeUUID = require("../../../processor/processor_xml_obj/define_node_uuid.js");
    defineNodeUUID(root, '', mainClassName, true);
  
    if (analysisReferKeysDepth) {
      loopReferKeys(root, analysisReferKeysDepth);
    }

    traverse(root, (node) => {
     
      expanedLiteralLogicUuidExpression(node);
      removeEmptyAtrrs(node);
      removeEmptyLogic(node);
      removeEmptyChildNodes(node);

    });
  
    delete root.path;
    delete root.sourceType;

    // debugger
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


  
  function removeEmptyLogic(node) {
    if (node.logic && Object.keys(node.logic).length === 0)
        delete node.logic;
  }

  function removeEmptyChildNodes(node) {

    if (!node.childNodes) {
      delete node.childNodes;
    } else if (node.childNodes && node.childNodes.length === 0)
        delete node.logic;
  }
  

  function removeEmptyAtrrs(node) {
    if (node.attrs && Object.keys(node.attrs).length === 0)
        delete node.attrs;
  }

  // text 无子节点 所以可以加在自己身上
  function mergeTextNode(node) {

    // debugger
    if ((node.tagName === 'text' || node.tagName === 'span')
      && node.childNodes
      && node.childNodes.length === 1
      && !node.childNodes[0].tagName
    ) {
      node.data = node.childNodes[0].data;
      node.childNodes = null;
    }
  }

  function camelDatasetAtrrs(node) {
    if (node.attrs)
    {
      let keys = Object.keys(node.attrs).filter(key => key.startsWith("data-"));

      keys.forEach(
        key => {
          let camelKey = "data-" + key.substr(5).toLowerCase().replace(/-(\w)/g, ($,$1)=>$1.toUpperCase());
          if (camelKey !== key) {
            node.attrs[camelKey] = node.attrs[key];
            delete node.attrs[key];
          }
          
        }
      )
      
    }
  }
  
  function expanedLiteralAttrsExpression(node) {
    if (!node.attrs) {
      return;
    }
  
    Object.keys(node.attrs).forEach((attrName) => {
      let attrValue = node.attrs[attrName];
      if (typeof attrValue === 'object' && attrValue.type === "Literal" && typeof attrValue.value === 'string') {
        node.attrs[attrName] = attrValue.value;
      }
    });
  }

  function expanedLiteralDataExpression(node) {
    if (!node.data) {
      return;
    }
    if (typeof node.data === 'object' && node.data.type === "Literal" && typeof node.data.value === 'string') {
      node.data = node.data.value;
    }
  }

  function expanedLiteralLogicUuidExpression(node) {
    if (!node.logic) {
      return;
    }
    if (typeof node.logic === 'object' && typeof node.logic.uuid === 'object' && node.logic.uuid.type === "Literal" && typeof node.logic.uuid.value === 'string') {
      node.logic.uuid = node.logic.uuid.value;
    }
  }
  
  
  function loopReferKeys(node, depth) {
    ASSERT(depth >= 1);
    const createMappedFunction = require("../../../processor/processor_xml_obj/create_mapped_function.js");

    if (depth === 1 || !node.childNodes || !node.childNodes.length) {
      const {functionArray, referKeys} = createMappedFunction(node, false, true);
      ensureProperty(node, 'logic');
      if (referKeys && referKeys.length)
        node.logic.rks = referKeys;
    } else {
      node.childNodes.forEach(
        sbn => loopReferKeys(sbn, depth-1)
      );

      ensureProperty(node, 'logic');
      let mergerRks = [];
      node.logic.rks = mergerRks;

      node.childNodes.forEach(
        sbn => {
          if (sbn.logic && sbn.logic.rks) {
            sbn.logic.rks.forEach(
              sbnRk => {
                if (!mergerRks.includes(sbnRk)) {
                  mergerRks.push(sbnRk);
                }
              }
            )
          }
        }
      );
    }
  }
  
  
  function transformStyleRem2Rpx(node, cssDomain) {

    const replaceRem2Rpx = replaceRemT2Rpx(7.5);

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
  
