const replaceNode = require("../helpers/replace_node.js");
const mergeAttrs = require("../helpers/merge_attrs.js");
const path = require("path");

function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}

module.exports = resolveInclude;

function resolveInclude(
  root,
  { srcFilePath, rootSrcPath, destFilePath, getIncludedStandardTreeFn, onFoundImportTemplateFn, inlineInclude }
) {
  const isFromMP = root.sourceType === 'wxml'|| root.sourceType === 'wxmp';

  if (root.childNodes) {

    if (root.childNodes.map(v=>v.tagName).includes('include')) {
      //expand if elif else

        /*
            <view wx:if="{{a}}" />
            <view wx:elif="{{b}}" />
            <inlcude wx:elif="{{c}}" />
            <view wx:else />

            will convert to

            <view wx:if="{{a}}" >
            <view wx:elif="{{b}}" >
            <inlcude wx:if="{{!(a||b) && c}}" > //{{!(a||b) && c}} will merged to sub children 
            <view wx:if="{{!(a||b||c)}}">

        */

      for (let i = 0; i < root.childNodes.length; i++) {
        const node = root.childNodes[i];
        if (node.logic && (node.logic.elif || node.logic.else)) {
          let botherIfArr = [];

          for (let j = i-1; j >= 0; j--) {
            const bnode = root.childNodes[j];
            ASSERT (bnode.logic.if || bnode.logic.elif);

            botherIfArr.unshift(bnode.logic.if || bnode.logic.elif);

            if (bnode.logic.if) {
              break;
            }
          }

          if (botherIfArr.lengh === 1) {
            node.logic._mergedIf = new javascript.astFactory.UnaryExpression(
              "!", botherIfArr[0]
            );
          } else {
            let leftCondi = botherIfArr.shift();

            while(botherIfArr.lengh) {
             leftCondi = new javascript.astFactory.LogicalExpression(
                '||',
                leftCondi,
                botherIfArr.shift()
              );
            }

            node.logic._mergedIf = new javascript.astFactory.UnaryExpression(
              "!", leftCondi
            );
          }
        }
      }

      for (let i = 0; i < root.childNodes.length; i++) {
        
        const node = root.childNodes[i];
        if (node.logic && (node.logic.elif || node.logic.else)) {
          for (let j = i-1; j >= 0; j--) {
            const bnode = root.childNodes[j];
            ASSERT(bnode.logic.if || bnode.logic.elif);

          


            if (bnode.tagName === 'include') {
              ASSERT(node.logic._mergedIf);

              node.logic.if = node.logic._mergedIf;
              delete node.logic.elif;
              delete node.logic.else;
              
            }

            if (bnode.logic.if) {
              break;
            }
          }

        }

      }
    }
    


    for (let i = 0; i < root.childNodes.length; ) {
      const node = root.childNodes[i];
      if (node.tagName === 'include') {
        ASSERT(getIncludedStandardTreeFn, 'Error getIncludedStandardTreeFn');

        const src = node.attrs.src;
        ASSERT (src, '<include /> missing src');

        // delete node.attrs.src;
        // debugger

        const includedRoot = getIncludedStandardTreeFn(node, src, srcFilePath, rootSrcPath , destFilePath ? path.dirname(destFilePath) : undefined);
        const childNodes = includedRoot.childNodes;
        
        if (inlineInclude) {
          childNodes.forEach((includedNode, index) => {
            mergeAttrs(node, includedNode, index === childNodes.length-1);
          });
        }

        // debugger
        console.log(src)
        resolveInclude(includedRoot, {
          srcFilePath: path.join(srcFilePath ? path.dirname(srcFilePath) : './', src),
          destFilePath,
          rootSrcPath,
          getIncludedStandardTreeFn, 
          onFoundImportTemplateFn,
          inlineInclude,
        });
        // resolve import relative path
        
        if (inlineInclude) {
          // if (src.includes("include_abs.wxml")) debugger;

          ASSERT(rootSrcPath, srcFilePath)
          let commentNode = {
            data: `<!--expand include from ${path.relative(rootSrcPath, path.join(path.dirname('./' + srcFilePath), src))}-->`
          };
          replaceNode(node, [commentNode].concat(includedRoot.childNodes));
          i += includedRoot.childNodes.length;
        }
       

      } else {
        if (node.childNodes) {
          resolveInclude(node, {
            srcFilePath,
            destFilePath,
            rootSrcPath,
            getIncludedStandardTreeFn,
            onFoundImportTemplateFn,
            inlineInclude
          });
        }
        i++;
      }
    }
  }
}