const genNodeCssXPathName = require("../../../helpers/gen_node_css_xpath_name.js");
const getNodeUUID = require("../../../helpers/get_node_uuid.js");
const getObjectDataExpression = require("../../../../exporter/string_utils/get_object_data_expression.js");
const createMappedFunction = require("../../../../processor/processor_xml_obj/create_mapped_function.js");
const javascript = require('../../../../parser/parse_ast/javascript');
const getInheritStyle = require("../../../helpers/get_inherit_style.js");
const getExpressionWithForDomain = require("../../../helpers/get_expression_with_for_domain.js");

function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}


module.exports = function genTails(node, functionArray, styleHolder, cssDomain, sourceType, appendTextStyle) {
    // if (node.tagName === 'input') debugger
    
  //  if (node.tagName.startsWith("::")) debugger

    // if (node.tagName === "input") debugger
    // if (node.attrs?.id === 'bottom-info') debugger

    let classDict = require("../../../helpers/gen_all_possible_style.js")(Object.assign({}, node, { childNodes: null }), cssDomain, false, true);
    let cssClassNames = Object.keys(classDict);
    let cssClassStyle;
    let cmds;
    let extraIf;
    let elseCmds;
    

    ASSERT(node.computedStyle);

    if (cssClassNames.length === 0) {
      cmds = [];
    } else if (cssClassNames.length === 1) {
      cssClassStyle = classDict[cssClassNames[0]];

      cmds = getValueString(cssClassStyle, node.computedStyle, node);

    } else {
      

      cmds = [];
      let allClasses = cssClassNames.map(n => classDict[n]);

      let collectKeyNum = {}


      for (let i = 0; i < allClasses.length; i++) {
        let newV = allClasses[i];
        Object.keys(newV).forEach(
          key => {
            
            if (!collectKeyNum[key]) collectKeyNum[key] = {};
            let value = newV[key];
            if (!collectKeyNum[key][value]) collectKeyNum[key][value] = [];
            collectKeyNum[key][value].push(i);
            
          }
        );

      }
      // debugger
      const collectAllPossibleRoute = require("../../../helpers/collect_all_possible_route.js")
      const _findCondition = collectAllPossibleRoute._findCondition;
      const _genEvalString = collectAllPossibleRoute._genEvalString;


      let condiArray = [];
      let copyedXPathObject = JSON.parse(JSON.stringify(node.style._classStyleRouteFull.xPathObject)); //deep clone
      _findCondition(copyedXPathObject, condiArray);

      for (var properyKey in collectKeyNum) {
        if (properyKey === "__routeKey" || properyKey === "__importantKeys") continue;

        let valueObj = collectKeyNum[properyKey];
        let allKeys0 = Object.keys(valueObj);
       
        if (allKeys0.length === 1 && valueObj[allKeys0[0]].length === allClasses.length) {
          cmds = cmds.concat(getValueString({[properyKey]: Object.keys(valueObj)[0]}, node.computedStyle, node))
        } else {
          let useConditionExpression = true;
          
          if (allKeys0.length === 1 || allKeys0.length === 2) {
            let _0Arr = valueObj[allKeys0[0]];
            let _1Arr;

            let step;
            if (_0Arr.length === allClasses.length / 2) { // 二分
              if (_0Arr.length >= 2) {
                step = _0Arr[1] - _0Arr[0];
                ASSERT(step);
                for (let k = 2; k < _0Arr.length; i++) {
                  if (_0Arr[k] - _0Arr[k-1] !== step) {
                    useConditionExpression = false;
                    break;
                  }
                }
              } else {
                step = 1;
              }

              if (allKeys0.length === 2) {
                _1Arr = valueObj[allKeys0[1]];
  
                if (_0Arr.length !== _1Arr.length || _0Arr.length !== allClasses.length / 2 
                || Array.from(new Set(_0Arr.concat(_1Arr))).length !== allClasses.length
                ) {
                  useConditionExpression = false;
                }
              }
            } else {
              useConditionExpression = false;
            }

                
            if (useConditionExpression) { // 二分
              let mIndex = Math.log2(step);

              let condi = condiArray[condiArray.length - 1 - mIndex];
              let computedStyleC = {};
              let computedStyleA = {};

              let consequents = getValueString({[properyKey]: allKeys0[0]}, computedStyleC);
              let alternates;
              
              if (allKeys0.length === 2) {
                alternates = getValueString({[properyKey]: allKeys0[1]}, computedStyleA);
              }

              let condiText = getConditionText(condi);
              
               
              for (let j = 0; j < consequents.length; j++) {
                let consequent = consequents[j];
                let propery = consequent.substr(0, consequent.indexOf("("))
                consequent = consequent.substr(consequent.indexOf("("));

                let alternate;
                if (allKeys0.length === 2) {
                  alternate = alternates[j];
                  alternate = alternate.substr(alternate.indexOf("("))
                } else {
                  alternate = "undefined"
                }
                cmds.push(propery + `(${condiText} ? ${consequent} : ${alternate})`);
                let properyKey = propery.substr(1);
                // debugger
                node.computedStyle[properyKey] = 
                new javascript.astFactory.ConditionalExpression(
                  condi,
                  computedStyleC[properyKey],
                  computedStyleA[properyKey],
                );
                Object.defineProperty(
                  node.computedStyle[properyKey], "conditionText", {value: condiText, enumerable: false}
                )
                
                // {
                //   condition: condi,
                //   conditionText: condiText,
                //   consequent: computedStyleC[propery],
                //   alternate: computedStyleA[propery],
                // }
              }
            } 
            else { // 非二分
              
              ///spec check
              let {v0Indexs, v1Indexs} = _findFitBits(copyedXPathObject, condiArray, allClasses,properyKey, allKeys0, _genEvalString);
              let shorterArr = v0Indexs.length <= v1Indexs.length ? v0Indexs : v1Indexs;
              
              if (shorterArr.length === 1 || shorterArr.length === 2) { // 简单布尔
                // if (shorterArr.length === 1) debugger
                let mergedCondiArr = [];
                let bit0 = shorterArr[0];
                let bit1 = shorterArr.length === 1 ? bit0 : shorterArr[1];

                for (let boolI = 0; boolI < condiArray.length; boolI++) {

                  if ((bit0 & (1 << boolI)) !== (bit1 & (1 << boolI))) continue; // means not important

                  if (bit0 & (1 << boolI)) {
                    mergedCondiArr.push(
                      new javascript.astFactory.UnaryExpression(
                        "!", condiArray[boolI]._orginalTest
                      )
                    )
                  } else {
                    mergedCondiArr.push(condiArray[boolI]._orginalTest)
                  }
                }
                let swapTime = shorterArr === v0Indexs ? 0 : 1;


                let mergedCondi;
                debugger

                ASSERT(mergedCondiArr.length)
                if (mergedCondiArr.length === 1) {
                  mergedCondi = mergedCondiArr[0];
                  if (mergedCondi.type === "UnaryExpression"
                    && mergedCondi.operator === '!'
                  ) {
                    mergedCondi = mergedCondi.argument;
                    swapTime++;
                  }
                } else {
                  mergedCondi = mergedCondiArr.shift();
                  while (mergedCondiArr.length) {
                    mergedCondi = new javascript.astFactory.BinaryExpression(
                      "&&",
                      mergedCondi,
                      mergedCondiArr.shift(),
                    );
                  }
                }

                let computedStyleC = {};
                let computedStyleA = {};

                let consequents = getValueString({ [properyKey]: allKeys0[0] }, computedStyleC);
                let condiText = getConditionText({ test: mergedCondi });

                let alternates;
                if (allKeys0.length === 2) {
                  alternates = getValueString({[properyKey]: allKeys0[1]}, computedStyleA);
                }
                

                for (let j = 0; j < consequents.length; j++) {
                  let consequent = consequents[j];
                  let propery = consequent.substr(0, consequent.indexOf("("))
                  consequent = consequent.substr(consequent.indexOf("("))

                  let alternate;
                  if (allKeys0.length === 2) {
                    alternate = alternates[j];
                    alternate = alternate.substr(alternate.indexOf("("))
                  } else {
                    alternate = "undefined"
                  }
                  let properyKey = propery.substr(1);

                  if (swapTime) {
                    cmds.push(propery + `(${condiText} ? ${alternate} : ${consequent})`);

                    node.computedStyle[properyKey] = new javascript.astFactory.ConditionalExpression(
                      mergedCondi,
                      (computedStyleA[properyKey]),
                      (computedStyleC[properyKey]),
                    );
                    Object.defineProperty(
                      node.computedStyle[properyKey], "conditionText", {value: condiText, enumerable: false}
                    )
                    
                  } else {
                    cmds.push(propery + `(${condiText} ? ${consequent} : ${alternate})`);
                    
                    node.computedStyle[properyKey] = new javascript.astFactory.ConditionalExpression(
                      mergedCondi,
                      (computedStyleC[properyKey]),
                      (computedStyleA[properyKey]),
                    );
                    Object.defineProperty(
                      node.computedStyle[properyKey], "conditionText", {value: condiText, enumerable: false}
                    )
                    
                  }
                }
                useConditionExpression = true;
              } else {
                // 非简单布尔
                useConditionExpression = false;
              }
            

            // debugger

            } 
          } // ends of (allKeys0.length === 1 || allKeys0.length === 2)
          else {
            useConditionExpression = false;
          }

          if (!useConditionExpression) {
            // debugger


            let classString = createMappedFunction.createFunctionReturnStr(node.style._classStyleRouteFull.xPathObject)
            

            let classStyleDict = cssClassNames.map(
              n => ({
                name: n, 
                value: classDict[n][properyKey]
              })
            );


            // debugger

            let allValuesObjs = classStyleDict.map(v=>getValueString({[properyKey]: v.value}, node.computedStyle));

            for (let j = 0; j < allValuesObjs[0].length; j++) {
              let allValuesObj = allValuesObjs[0][j];

              let propery = allValuesObj.substr(0, allValuesObj.indexOf("("));
              let allValues = allValuesObjs.map(v => v[j].substr(v[j].indexOf("(")));

              let objStr = classStyleDict.map(
                (v,i)=> JSON.stringify(v.name)+":" + allValues[i]
              ).join(", ")
              objStr = `{${objStr}}`;

              cmds.push(propery + `(${objStr}[${classString}])`);

              // debugger
            }
             


          }
        }
          
      }

    }
    
    let inlineStyle = node.attrs?.style;
    if (inlineStyle) {
      // debugger
      let inlineStyleObj = getInlineStyleObject(inlineStyle, node);
      let __importantKeys = cssClassNames.map( v => classDict[v].__importantKeys || []).flat()

      if (__importantKeys.length) {
        Object.keys(inlineStyleObj).forEach(
          key => {
            if (__importantKeys.includes(key)) {
              delete inlineStyleObj[key];
              if (cssClassNames.length > 1)
                console.warn(`remove inline style ${key} for !important in css, notice it MAY cause error`);
            }
          }
        )
      }
    
      let inlineStyleStringArr = getValueString(inlineStyleObj,node.computedStyle, node, true );
      // functionArray[11]

      cmds = cmds.concat(inlineStyleStringArr);


    }

    if (cmds.find(v=>v.startsWith(".backgroundImage"))) {
      if (node.computedStyle.backgroundSizeWidth || node.computedStyle.backgroundSizeHeight)
      {
        let width = node.computedStyle.backgroundSizeWidth || '100%';
        let height = node.computedStyle.backgroundSizeHeight || '100%';

        if (width.startsWith("eval(")) width = width.slice(5, -1);
        if (height.startsWith("eval(")) height = height.slice(5, -1);
        

        if (width === 'cover') {
          cmds.push(`.backgroundImageSize(ImageSize.Cover)`)
        } else if (width === 'contain') {
          cmds.push(`.backgroundImageSize(ImageSize.Contain)`)
        } else {
          cmds.push(`.backgroundImageSize({width: "${(width)}", height: "${(height)}"})`)
        }
      }
    }

    if (node._convertedTagName === 'Text' || node._convertedTagName === 'TextInput' || appendTextStyle ) {
      // debugger
      if (!cmds.find(v=>v.startsWith(".textAlign"))) {
        let _textAlign = getInheritStyle(node, "textAlign");
        if (_textAlign === 'right' || _textAlign === 'end') {
          cmds.push('.textAlign(TextAlign.End/*inherit*/)')
          // debugger
        } else if (_textAlign === 'center') {
          cmds.push('.textAlign(TextAlign.Center/*inherit*/)')
        }
      }

      if (!cmds.find(v=>v.startsWith(".fontColor"))) {
        let _fontColor = getInheritStyle(node, "color");
        if (_fontColor && _fontColor !== '#000000') {
          cmds.push(`.fontColor(${convertColor(_fontColor)}/*inherit*/)`)
          // debugger
        } 
      }

      if (!cmds.find(v=>v.startsWith(".fontSize"))) {
        
        let _fontSize = getInheritStyle(node, "fontSize");
        if (_fontSize)
          cmds.push(`.fontSize("${_fontSize}"/*inherit*/)`);
        // debugger
      }

      if (node._convertedTagName !== 'TextInput' && !cmds.find(v=>v.startsWith(".lineHeight"))) {
        
        let _lineHeight = getInheritStyle(node, "lineHeight");
        if (_lineHeight)
          cmds.push(`.lineHeight("${_lineHeight}"/*inherit*/)`);
        // debugger
      }

      if (!cmds.find(v=>v.startsWith(".fontWeight"))) {
        // debugger
        let _fontWeight = getInheritStyle(node, "fontWeight");

        if (_fontWeight) {
          _fontWeight = convertFontWeight(_fontWeight);
          if (_fontWeight !== 'Normal'  )
            cmds.push(`.fontWeight(FontWeight.${_fontWeight}/*inherit*/)`)
        }
      }
    }

    let positionExpress = cmds.find(v=>v.startsWith(".position("));
    if (positionExpress) {

      cmds = cmds.filter(v=> (
        !v.startsWith(".position(")
       ));

      let position1 = positionExpress.slice(10 ,-1)

      // let position2 = node.computedStyle.position;

      if (position1 === '"absolute"' || position1 === '"fixed"') {
        // if (node.className === 'options-item-text') debugger
        processPostion(eval(position1), node, cmds)    
      }
      else {
        if (position1[0] !== '"') {
          // debugger
          let qArr = position1.split("?");
          let isSimpleConditionExpression;
          let consequent;
          let alternate;

          if (qArr.length === 2) {
           
            try {
              consequent = eval("1?" + qArr[1]);
              alternate = eval("0?" + qArr[1]);

              if (typeof consequent === 'string' 
              && typeof alternate === 'string' 
              ) {
                isSimpleConditionExpression = true;
              }
              
            } catch (e) {
              isSimpleConditionExpression = false;
            }
          }
         
          if (isSimpleConditionExpression) {
            extraIf = qArr[0].trim();
            while (extraIf[0] === '(' && extraIf[extraIf.length - 1] === ')') extraIf = extraIf.slice(1, -1).trim();
            elseCmds = cmds.slice();

            if (consequent === 'fixed' || consequent === 'absolute')
            {
              processPostion(consequent, node, cmds, extraIf, true);    
            }

            if (alternate === 'fixed' || alternate === 'absolute')
            {
              processPostion(alternate, node, elseCmds, extraIf, true);    
            }

            extraIf += "/*split by postion*/"
            // debugger


          } else {
            console.ASSERT(false, "unsupport dynamic position!" + position1);
          }

        } else {
  
        }
      }
    }

    cmds = cmds.filter(v=> (
      !v.startsWith(".left(")
      && !v.startsWith(".right(")
      && !v.startsWith(".top(")
      && !v.startsWith(".bottom(")
    ));

    if (elseCmds)
    elseCmds = elseCmds.filter(v=> (
      !v.startsWith(".left(")
      && !v.startsWith(".right(")
      && !v.startsWith(".top(")
      && !v.startsWith(".bottom(")
    ));

    // if (node.attrs?.id === 'abc') debugger

    

    // debugger
  
    if (cmds.length >= 2) cmds.unshift("");

    // if (node.className === "sn-name-text") debugger

    return {cmds:cmds, extraIf, elseCmds};
  }

  function processPostion(position, node, cmds, extraIf, bool = undefined) {

    if (position === 'absolute') {
      let left = cmds.find(v=>v.startsWith(".left("));
      let right = cmds.find(v=>v.startsWith(".right("));
      let top = cmds.find(v=>v.startsWith(".top("));
      let bottom = cmds.find(v=>v.startsWith(".bottom("));

      if (left) left = left.slice(6, -1);
      if (right) right = right.slice(7, -1);
      if (top) top = top.slice(5, -1);
      if (bottom) bottom = bottom.slice(8, -1);

      if (extraIf) {
        if (left) while (left.includes(extraIf))  left = left.replace(extraIf, bool ? "true" : 'false');
        if (right) while (right.includes(extraIf))  right = right.replace(extraIf, bool ? "true" : 'false')
        if (top) while (top.includes(extraIf))  top = top.replace(extraIf, bool ? "true" : 'false')
        if (bottom) while (bottom.includes(extraIf))  bottom = bottom.replace(extraIf, bool ? "true" : 'false')
      }
      
      let posX;
      let markAnchorX;
      let posY;
      let markAnchorY;

      if (left && !right) {
        posX = left;
        // markAnchorX = 0;
      } else if (!left && right) {
        markAnchorX = `"100%"`;
        if (right == 0 || right == `"0"` || right == `'0'`) {
          posX = `"100%"`;
        } else {
          if (right[0] === '"') {

          } else {
            ASSERT(false, "not support dynmaic right" + right);
          }

          let parentWidth = node.parentNode.computedStyle.width;
          if (!parentWidth) {

            debugger 
            // ASSERT(false, "not tested yet")

            // using margin-right simu right
            if (!cmds.find(v=>v.startsWith(".margin("))) {
              cmds.push(`.margin({right: ${right}/*simu by right*/})`)
            } else {
              let marginStr = cmds.find(v=>v.startsWith(".margin(")).substr(7);
              if (extraIf) {
                while (marginStr.includes(extraIf))  marginStr = marginStr.replace(extraIf, bool ? "true" : 'false');
              }
              try {

                let margin = computedStyle.margin;
                let marginNew;
                if (!margin.right) {
                  let objStartIndex = marginStr.indexOf("{")
                  marginNew = marginStr.substr(0, objStartIndex) + `{right: ${right}/*simu by right*/, ` + marginStr.substr(objStartIndex + 1);
                  marginNew = `.margin${marginNew}`
                } else {
                  right = eval(right);
                  let newMarginRight = plusPixel(right + margin.right);

                  if (typeof newMarginRight === 'object') newMarginRight = getExpressionWithForDomain(node, newMarginRight).astString;

                  newMarginRight +=`/*simu plus on right*/`
                  marginNew = marginStr.replace(/right:[\s]*\"[a-z0-9A-Z]\"+/, `right: ${newMarginRight}`);
                }
                let idx = cmds.indexOf(marginStr);
                cmds[idx] = marginNew;
                posX = `"100%"`;

              } catch (e) {
                // not a simple margin
                ASSERT(false, "not support right in a 'uncertain width' container");
              }
            }
          } else {

            right = eval(right);
            if (right[0] === '-') {
              right = right.substr(1)
            } else {
              right = "-" + right;
            }

            posX = plusPixel(parentWidth, right);
            // if (typeof posX === 'object') debugger
            if (typeof posX === 'object') posX = getExpressionWithForDomain(node, posX).astString;
            else posX = JSON.stringify(posX);

            posX +=`/*minus by parent width*/`
          }

          
        }
      } else if (left && right) {
          //expand width
          debugger
      } else if (!left && !right) {
        // debugger
        let padding = node.parentNode.computedStyle.padding;
        if (padding) {
          posX = JSON.parse(padding).left || 0
        } else {
          posX = 0;
        }
        // if (node.computedStyle.margin) {
        //   posX = plusPixel(posX, node.computedStyle.margin.left || 0);
        //   posX = plusPixel(posX, node.computedStyle.margin.right || 0);
        // }

        if (node.computedStyle.display == 'block') 
        {
          if (posX) posX = `"${posX}"/*block node only deal with padding*/`
          // must new line
        } else if ((node.parentNode._convertedTagName === 'Flex'
        || node.parentNode._convertedTagName === 'Row'
        )) {
          if (typeof node._nodeIndex === 'number') {
            for (let i = 0; i < node._nodeIndex; i++) {
              let brotherNode = node.parentNode.childNodes.find(v=>v._nodeIndex === i);
              debugger

              if (brotherNode.computedStyle.position === `eval("fixed")` ||
                brotherNode.computedStyle.position === `eval("absolute")`
              ) continue;

              if (brotherNode.computedStyle.margin) {
                let margin = brotherNode.computedStyle.margin;
                if (margin) {
                
                  posX = plusPixel(posX, margin.left || 0);
                  posX = plusPixel(posX, margin.right || 0);
                }
              }

              if (brotherNode.computedStyle.width) {
                posX = plusPixel(posX, brotherNode.computedStyle.width);
              } else {
                let bh = calcNodeWHByChild(brotherNode, false);
                ASSERT(bh !== undefined, "cann't calc absolute x with brothers who has uncertian width brother");
                posX = plusPixel(posX,bh);
              }
            }

            if (posX) {
              posX = `"${posX}"/*calc by flow brother before*/`
            }

          } else {
            let psIndex = node.parentNode.childNodes.indexOf(node);
            ASSERT(psIndex !== -1);
            
            
            //if node is inline or inblock x will start at last inline or inline block

            // if a inline nextNode is block || preNode is block will cause a new-line
            let noCommentAbsNode = node.parentNode.childNodes.slice(0, psIndex).filter((v,index) => 
              (v.tagName||typeof v.data === 'object'||(v.data&&!v.data.startsWith("<!--")))
              && v.computedStyle?.position !== `eval("fixed")`
              && v.computedStyle?.position !== `eval("absolute")`
              && v.computedStyle.display !== `block`
              && !(node.parentNode.childNodes[index + 1].computedStyle?.display === 'block' || (node.parentNode.childNodes[index - 1]||{}).computedStyle?.display === 'block'
              )
            );
            debugger // not tested
            if (!noCommentAbsNode.length) { //prenode is all block

            } else {

              if (noCommentAbsNode.find(v => v.logic?.for || v.logic?.if)) {
                ASSERT(false, "can't calc abs x with uncertain x start")
                posX = undefined;
              } else {
                for (let i = 0; i < noCommentAbsNode.length; i++) {
                  let brotherNode = noCommentAbsNode[i];
                  if (brotherNode.computedStyle.margin) {
                    let margin = brotherNode.computedStyle.margin;
                    if (margin) {
                      posX = plusPixel(posX, margin.left || 0);
                      posX = plusPixel(posX, margin.right || 0);
                    }
                  }

                  if (brotherNode.computedStyle.width) {
                    posX = plusPixel(posX, brotherNode.computedStyle.width);
                  } else {
                    let bh = calcNodeWHByChild(brotherNode, false);
                    ASSERT(bh !== undefined, "cann't calc absolute x with brothers who has uncertian width brother");
                    posX = plusPixel(posX,bh);
                  }
                }
                if (posX) {
                  posX = `"${posX}"/*calc by unblock brother before*/`
                }
              }

              

            }
          }
        } else if (node.parentNode._convertedTagName === 'Column') {
          // Column get paddingX only
        } else {
          ASSERT(false, 'unknown')
        }
        //follow flow layout
      }


      if (top && !bottom) {
        posY = top;
      } else if (!top && bottom) {
        markAnchorY = `"100%"`;
        if (bottom == 0 || bottom == `"0"` || bottom == `'0'`) {
          posY = `"100%"`;
        } else {
          if (bottom[0] === '"') {
            
          } else {
            ASSERT(false, "not support dynmaic bottom" + bottom);
          }
          let parentHeight = node.parentNode.computedStyle.height;
          // debugger
          if (!parentHeight) {

            // ASSERT(false, "not tested yet")

            if (!cmds.find(v=>v.startsWith(".margin("))) {
              cmds.push(`.margin({bottom: ${bottom}/*simu by bottom*/})`)
            } else {
              let marginStr = cmds.find(v=>v.startsWith(".margin(")).substr(7);
              if (extraIf) {
                while (marginStr.includes(extraIf))  marginStr = marginStr.replace(extraIf, bool ? "true" : 'false');
              }
              try {
                let margin = computedStyle.margin;
                let marginNew;
                if (!margin.bottom) {
                  let objStartIndex = marginStr.indexOf("{")
                  marginNew = marginStr.substr(0, objStartIndex) + `{bottom: ${bottom}/*simu by bottom*/, ` + marginStr.substr(objStartIndex + 1);
                  marginNew = `.margin${marginNew}`
                } else {
                  bottom = eval(bottom);
                  let newMarginBottom = plusPixel(bottom + margin.bottom);
                  if (typeof newMarginBottom === 'object') newMarginBottom = getExpressionWithForDomain(node, newMarginBottom).astString;

                  newMarginBottom +=`/*simu plus on bottom*/`
                  marginNew = marginStr.replace(/bottom:[\s]*\"[a-z0-9A-Z]\"+/, `bottom: ${newMarginBottom}`);
                }
                let idx = cmds.indexOf(marginStr);
                cmds[idx] = marginNew;
                posY = `"100%"`;

              } catch (e) {
                // not a simple margin
                ASSERT(false, "not support bottom in a 'uncertain height' container");
              }
            }
          } else {

            bottom = eval(bottom);
            if (bottom[0] === '-') {
              bottom = bottom.substr(1)
            } else {
              bottom = "-" + bottom;
            }

            posY = plusPixel(parentHeight, bottom);
            
            if (typeof posY === 'object') debugger
            if (typeof posY === 'object') posY = getExpressionWithForDomain(node, posY).astString;
            else posY = JSON.stringify(posY)

            posY +=`/*minus by parent height*/`
          }



        }
        // debugger
      } else if (top && bottom) {
          debugger
          //expand height

      } else if (!top && !bottom) {
        // debugger
        //follow flow layout
        let padding = node.parentNode.computedStyle.padding;
        if (padding) {
          posY = padding.top || 0;
        } else {
          posY = 0;
        }

        // if (node.computedStyle.margin) {
        //   posY = plusPixel(posY, node.computedStyle.margin.top || 0);
        //   posY = plusPixel(posY, node.computedStyle.margin.bottom || 0);
        // }

        
        if ((node.parentNode._convertedTagName === 'Flex'
        || node.parentNode._convertedTagName === 'Column'
        )) {
          if (typeof node._nodeIndex === 'number') {
            for (let i = 0; i < node._nodeIndex; i++) {
              let brotherNode = node.parentNode.childNodes.find(v=>v._nodeIndex === i);
              // debugger

              if (brotherNode.computedStyle.position === `eval("fixed")` ||
                brotherNode.computedStyle.position === `eval("absolute")`
              ) continue;

              if (brotherNode.computedStyle.margin) {
                let margin = brotherNode.computedStyle.margin;
                if (margin) {
                
                  posY = plusPixel(posY, margin.top || 0);
                  posY = plusPixel(posY, margin.bottom || 0);
                }
              }

              if (brotherNode.computedStyle.height) {
                posY = plusPixel(posY, brotherNode.computedStyle.height);
              } else {
                let bh = calcNodeWHByChild(brotherNode, true);
                ASSERT(bh !== undefined, "cann't calc absolute y with brothers who has uncertian height brother");
                posY = plusPixel(posY,bh);

              }
            }

            if (posY) {
              posY = `"${posY}"/*calc by flow brother before*/`
            }

          } else {
            let psIndex = node.parentNode.childNodes.indexOf(node);
            ASSERT(psIndex !== -1);
            
            let noCommentAbsNode = node.parentNode.childNodes.slice(0, psIndex).filter(v => 
              (v.tagName||typeof v.data === 'object'||(v.data&&!v.data.startsWith("<!--")))
              && v.computedStyle?.position !== `eval("fixed")`
              && v.computedStyle?.position !== `eval("absolute")`
            );

            if (noCommentAbsNode.length) {
              ASSERT(false, 'not support yet');
              posY = undefined;
            }
            

          }
        } else if (node.parentNode._convertedTagName === 'Row') {
          // Row get paddingY only
        } else {
          ASSERT(false, 'unknown')
        }
        
      }

      console.log(
        posX, markAnchorX, posY, markAnchorY
      )
      if (posX !== undefined && posY !== undefined) {
        // debugger

        // if (posY[0] !== `"`) debugger

        cmds.push(`.position({x:${posX}, y:${posY}})`)

        if (markAnchorX || markAnchorY) {
          let str = `.markAnchor({`;
          if (markAnchorX)
            str += "x:" + markAnchorX + (markAnchorY ? "," : "")
          if (markAnchorY)
            str += "y:" + markAnchorY
          cmds.push(str + "})")
        }


      } else {
        ASSERT(false, 'will support later');
      }
    } else if (position === '"fixed"') {
      debugger
    }
  }


  function _findFitBits(copyedXPathObject, condiArray, allClasses, properyKey, allKeys0, _genEvalString) {

    let v0Indexs = [];
    let v1Indexs = [];
    

    // debugger
    let totalTestNum = Math.pow(2, condiArray.length);
    let eval2 = eval;
    for (let bitI = 0; bitI < totalTestNum; bitI++) {

      for (let boolI = 0; boolI < condiArray.length; boolI++) {
        if (!condiArray[boolI]._orginalTest) condiArray[boolI]._orginalTest = condiArray[boolI].test;
        condiArray[boolI].test = new javascript.astFactory.Literal((bitI & (1 << boolI)) ? false : true);
      }

      let classString;
      let testStyleString = createMappedFunction.createFunctionStr(copyedXPathObject);
      try {
        let evalFunc = _genEvalString(testStyleString);
        classString = eval2(evalFunc);
      } catch (e) {
        ASSERT(false);
      }

      if (classString) {
        let value = allClasses.find(v => v.__routeKey === classString)[properyKey];

        if (value === allKeys0[0]) {
          v0Indexs.push(bitI)
        } else if (value === allKeys0[1]) {
          v1Indexs.push(bitI)
        } else {
          ASSERT(false)
        }
        // debugger
      }
    }

    return {v0Indexs, v1Indexs}
  }

  function calcNodeWHByChild(testNode, isH , depth = 2) {
    if (!depth) return undefined;

    if (!testNode.childNodes || !testNode.childNodes.length) return 0;

    // loop 1 depth
    console.warn("calc absolute wh may not corret");

    // debugger
    let noCommentAbsNode = testNode.childNodes.filter(v => 
      (v.tagName||typeof v.data === 'object'||(v.data&&!v.data.startsWith("<!--")))
      && v.computedStyle?.position !== `eval("fixed")`
      && v.computedStyle?.position !== `eval("absolute")`
    );

   if (!isH && noCommentAbsNode.find(v => !v.tagName)) {
    ASSERT(false, `can't ensure no-tag node's width`);
    return undefined
   }
    
    if (!noCommentAbsNode.length) return 0;

    console.warn("calc absolute wh may not corret");

    let valueArr = noCommentAbsNode.map(v => 
      v.computedStyle.hasOwnProperty(isH ? 'height':'width') ? v.computedStyle[isH ? 'height':'width'] : calcNodeWHByChild(v, isH, depth - 1)
    );

    if (valueArr.filter (v => v !== undefined).length !== noCommentAbsNode.length ) {
      ASSERT(false, `can't ${isH ? 'height' : 'widht'} with complex container`);
      return undefined
    }
      
    let suffixArr = valueArr.map(
      v => v === 0 ? "" : v.endsWith("lpx") ? 'lpx' : v.endsWith("px") ? "px" : undefined
    )

    if (suffixArr.filter (v => v !== undefined).length !== noCommentAbsNode.length ) {
      ASSERT(false, `cann't calc node ${isH ? 'height' : 'widht'} with brothers who has unknwon unit`);
      return undefined
    }
    
    suffixArr = suffixArr.filter(v=>v); 
      
    if (!suffixArr.length) { //all 0
      return 0;
    } 
      

    if (Array.from(new Set(suffixArr.filter(v=>v))).length !== 1) {
      ASSERT(false, `cann't calc node ${isH ? 'height' : 'widht'} with brothers who has different unit`);
      return undefined
    } 
    

    if (isH) {
      if (testNode._convertedTagName === 'Row') {
        let testNodeCalcValue;
        testNodeCalcValue = Math.max.call(Math, ...valueArr.map(v=>parseFloat(v)));
        testNodeCalcValue += suffixArr[0];
        return testNodeCalcValue;
      } else if (testNode._convertedTagName === 'Column') {
        let sum = valueArr[0];
        for (let i = 1; i < valueArr.length; i++) {
          sum = plusPixel(sum, valueArr[i]);
        }
        return sum;
      } else {
        ASSERT(false, "can't calc brother height with flex-wrap container");
      }
    } else {
      if (testNode._convertedTagName === 'Row') {
        let sum = valueArr[0];
        for (let i = 1; i < valueArr.length; i++) {
          sum = plusPixel(sum, valueArr[i]);
        }
        return sum;
      } else if (testNode._convertedTagName === 'Column') {
        let testNodeCalcValue;
        testNodeCalcValue = Math.max.call(Math, ...valueArr.map(v=>parseFloat(v)));
        testNodeCalcValue += suffixArr[0];
        return testNodeCalcValue;
      }else {
        ASSERT(false, "can't calc brother height with flex-wrap container");
      }
    }
      
    // if (testNode._convertedTagName)
    // debugger
  }

  function getConditionText(condi) {
    ASSERT(condi)
    if (condi.test.type === "Identifier") {
      return `this.${condi.test.name}`
    } else {
      let nodeWrapper = {data: JSON.parse(JSON.stringify(condi.test))};
      // debugger
      var {functionArray} = createMappedFunction(nodeWrapper, true, false, true);
      ASSERT(functionArray.length === 1);

      let testString = functionArray[0];
      testString = testString.substring(testString.indexOf("return") + 6, testString.lastIndexOf(";")).trim();

      return `(${testString.replace(/_cONTEXT./g, "this.")})`;

    }
  }

  function getInlineStyleObject(inlineStyle, node) {
    let isSimplePlusArray = true;

    let simplePlusArray = [];
    let destObj = {};

    if (typeof inlineStyle === 'string') {
      simplePlusArray = [inlineStyle];
    } else {
      ASSERT(inlineStyle._orginalNode);
      let ast = inlineStyle._orginalNode;
      // debugger

      let anaArr = [ast];

      while(anaArr.length) {
        let loopAst = anaArr.shift();

        if (loopAst.type === 'Literal') {
          simplePlusArray.push(loopAst.value);
        } else if (loopAst.type === 'BinaryExpression'
        && loopAst.operator === '+') {
          anaArr.unshift(loopAst.right);
          anaArr.unshift(loopAst.left);
        } else {
          simplePlusArray.push(loopAst)
        }
 
      }
    }
      // simplePlusArray;
      // debugger

    let mode = 0; //0 find key, 1 find value
    let lastSubStrStart = 0;
    let key = '';
    let valueArr = [];

    for (let i = 0; i < simplePlusArray.length; i++) {
      let v = simplePlusArray[i];

      if (typeof v === 'string') {
        lastSubStrStart = 0;

        for (let j = 0; j < v.length;j++) {
          let c = v[j];
          if (mode === 0) {
            if (c === ':') {
              key += v.substring(lastSubStrStart, j);
              lastSubStrStart = j+1;
              mode = 1;
            }
          } else if (mode === 1) {
            if (c === ';') {
              value = v.substring(lastSubStrStart, j);
              lastSubStrStart = j+1;
              mode = 0;

              valueArr.push(value);
              destObj[key] = valueArr;
              key = '';
              valueArr = [];
            }
          }
        }
        if (mode === 0) {
          key = v.substr(lastSubStrStart);
        } else if (mode === 1) {
          value = v.substr(lastSubStrStart);
          valueArr.push(value);
        }

      } else {
        if (mode === 0) {
          isSimplePlusArray = false;
          break;
        } else  if (mode === 1) {
          valueArr.push(v);
        }
      }
    }


    if (key && valueArr.length) {
      destObj[key] = valueArr;
    }

    if (isSimplePlusArray) {
      for (let p in destObj) {
        let valueArr = destObj[p];

        let literalString = ''
        let valueArrNew = [];

        for (let k = 0; k < valueArr.length; k++) {
          let v = valueArr[k];

          if (typeof v === 'object') {
            if (literalString) {
              valueArrNew.push(JSON.stringify(valueArrNew.length ? literalString : literalString.trimStart()))
              literalString = ""
            }
            
            let {astString} = getExpressionWithForDomain(node, v);

            valueArrNew.push(astString)

          } else if (typeof v === 'string') {
            literalString += v;
          } else {
            ASSERT(false)
          }
        }

        if (literalString) {
          valueArrNew.push(JSON.stringify(valueArrNew.length ? literalString.trimEnd() : literalString.trim()))
          literalString = null;
        }

        destObj[p] = valueArrNew.join(" + ")
        // debugger
      }
    } else {
      ASSERT(false, 'unsupport yet! complex inline style')
    }
    
    // debugger

    return destObj;

  }


  function getValueString(cssClassStyle, computedStyle, node, inlineMode) {
    let ret = [];

    let marginObject = {};
    let paddingObject = {};
    let borderWidthObject = {};
    let borderRadiusObject = {};
    let borderColorObject = {};
    let borderStyleObject = {};

    // if (cssClassStyle['border-right-style']) {
    //   debugger
    // }
    Object.keys(cssClassStyle).forEach(
      n_n => {

        if (n_n === "__routeKey" || n_n === "__importantKeys") return;

        let nN = n_n.replace(/-[\w\W]/g, (v) => v[1].toUpperCase());
        let v = cssClassStyle[n_n];
        switch (n_n) {
          case "background-color": 
          case "color":
            
            computedStyle[nN] = v;
            if (n_n === 'color') {
              nN = 'fontColor';
              computedStyle.fontColor = v;

            } 
            ret.push(`.${nN}(${convertColor(v)})`)

            // debugger
          break;
          case "width":
          case "height":
          case "font-size":
          case "opacity": 
          case "line-height":
            if (inlineMode) {
              try {v = JSON.parse(v)} catch (e) {ASSERT(false, "not support dynamic style: " + n_n + ";" + e.toString() )}
            }

            computedStyle[nN] = v;
            // debugger

            if (!(node._convertedTagName === 'TextInput' && n_n === "line-height"))
              ret.push(`.${nN}(${convertLength(v)})`)
            
            break;
          case "z-index": 
            if (inlineMode) {
              if (v[0] === '"')
                try {v = JSON.parse(v)} catch (e) {ASSERT(false, "not support dynamic style: " + n_n + ";" + e.toString() )}
            }
            ret.push(`.${nN}(${v})`)
            computedStyle[nN] =  v;

          break;
          case "display":
            if (!computedStyle.display)
              computedStyle.display = v;
            //TODO
          break; 
          case "flex-direction":
            {
              ASSERT(v === 'row' || v === 'column')
              // ret.push(`.${nN}(${v})`)
            }
            computedStyle.flexDirection = v;

          break; 
          case "font-weight":
            v = convertFontWeight(v);
            computedStyle.fontWeight = v.toLowerCase();
            ret.push(`.${nN}(FontWeight.${v})`)
            break;
          case "text-align":
            computedStyle.textAlign = v;
            if (v === 'left') v = "Start";
            else if (v === 'right') v = "End"; // TODO check container if reverse
            else v = v[0].toUpperCase() + v.substr(1);

            ASSERT(["Start", "Center", "End"].includes(v))
            if (isNaN(v)) {
              ret.push(`.${nN}(TextAlign.${v})`)
            } 
          break;

          case "padding":
          case "margin":
          case "border-width":
          case "border-border":

            if (n_n === "padding") {
              v = convertLength(v);
              paddingObject = {
                left: v, 
                right: v,
                top: v,
                bottom: v,
              }

            } else if (n_n === "margin") {
              v = convertLength(v);
              marginObject = {
                left: v, 
                right: v,
                top: v,
                bottom: v,
              }

            } else if (n_n === "border-width") {
              if (v === 'thin') v = '"1vp"';
              else if (v === 'medium') v = '"3vp"';
              else if (v === 'thick') v = '"4vp"';
              else v = convertLength(v);

              borderWidthObject = {
                left: v, 
                right: v,
                top: v,
                bottom: v,
              }
            } else if (n_n === "border-radius") {
              v = convertLength(v);
              borderRadiusObject = {
                "topLeft": v, 
                "topRight": v,
                "bottomLeft": v,
                "bottomRight": v,
              }
            }
            
            break;
            case "margin-left":
            case "margin-right":
            case "margin-top":
            case "margin-bottom":
            case "padding-left":
            case "padding-right":
            case "padding-top":
            case "padding-bottom":
            case "border-left-width":
            case "border-right-width":
            case "border-top-width":
            case "border-bottom-width":
              if (inlineMode) {
                try {v = JSON.parse(v)} catch (e) {ASSERT(false, "not support dynamic style: " + n_n + ";" + e.toString() )}
              }
              if (n_n.startsWith("padding") ){
                paddingObject[n_n.substr(8)] = convertLength(v);
              } else if (n_n.startsWith("margin") ) {
                marginObject[n_n.substr(7)] = convertLength(v);
              }  else if (n_n.startsWith("border-") ) {
                if (v === 'thin') v = '"1vp"';
                else if (v === 'medium') v = '"3vp"';
                else if (v === 'thick') v = '"4vp"';
                else v = convertLength(v);
                borderWidthObject[n_n.slice(7, -6)] = v;
              }
              break;
            case "border-color":
              v = convertColor(v);
              borderColorObject = {
                left: v, 
                right: v,
                top: v,
                bottom: v,
              }
            break;
            case "border-left-color":
            case "border-right-color":
            case "border-top-color":
            case "border-bottom-color":
              if (v === "currentcolor") {
                borderColorObject[n_n.slice(7, -6)] = `Color.Transparent`;
              } else {
                borderColorObject[n_n.slice(7, -6)] = convertColor(v);
              }
            break;

            case "border-style":
              ASSERT(v === 'dotted' || v === 'dashed' || v === 'solid' || v === 'none')
              v =  "BorderStyle." +  v[0].toUpperCase() + v.substr(1);
              borderStyleObject = {
                left: v, 
                right: v,
                top: v,
                bottom: v,
              }
            break;

            case "border-left-style":
            case "border-right-style":
            case "border-top-style":
            case "border-bottom-style":
              ASSERT(v === 'dotted' || v === 'dashed' || v === 'solid' || v === 'none')
              borderStyleObject[n_n.slice(7, -6)] = "BorderStyle." +  v[0].toUpperCase() + v.substr(1);
            break;
            case "border-top-left-radius":
            case "border-top-right-radius":
            case "border-bottom-left-radius":
            case "border-bottom-right-radius":
              borderRadiusObject[n_n.slice(7, -7).replace("-l", 'L').replace("-r", 'R')] = convertLength(v);
            break;
            case "position":
            case "top":
            case "right":
            case "bottom":
            case "left":
              
              if (inlineMode) {
                computedStyle[nN] = v;
                ret.push(`.${n_n}(${v})`)
              } else {
                computedStyle[nN] = `${v}`;
                ret.push(`.${n_n}("${v}")`)
              }
            break;
            case "vertical-align":
              // debugger  
              computedStyle.alignSelf = v;
              if (v === 'top') {
                ret.push(`.alignSelf(ItemAlign.Start)`)
              } else if (v === 'bottom') {
                ret.push(`.alignSelf(ItemAlign.End)`)
              } else if (v === 'center') {
                ret.push(`.alignSelf(ItemAlign.Center)`)
              }
              // else {
              //   if (v === 'center')
              //     ret.push(`.alignItems(VerticalAlign.Center)`)
              //   else
              //     ret.push(`.alignItems(VerticalAlign.Center/*${v}*/)`)

              // }
            
            break;
            case "box-sizing":
            case "flex-direction":
            case "flex-wrap":
              if (inlineMode) {
                try {v = JSON.parse(v)} catch (e) {ASSERT(false, "not support dynamic style: " + n_n + ";" + e.toString() )}
              }
              computedStyle[nN] = v;

            break;
            case "background-image":

            if (inlineMode) { // expression
              computedStyle[nN] = "eval(" + v + ")";
            
              if (v.startsWith('"')) {
                let vArr = v.split(" + ");
                // debugger
                if (vArr[0][0] === "\"" && vArr[vArr.length - 1][0] === "\"") {
                  vArr[0] = eval(vArr[0]).trim();
                  if (vArr[0].startsWith("url(")) {
                    vArr[0] = vArr[0].substr(4);
            
                    if (vArr[0] === "") {
                      vArr.shift();
                    } else {
                      vArr[0] = JSON.stringify(vArr[0]);
                    }
                  } else {
                    ASSERT(false, 'parse error')
                  }
            
                  let lastIndex = vArr.length - 1;
                  vArr[lastIndex] = eval(vArr[lastIndex]);
            
                  if (vArr[lastIndex].startsWith(")")) {
                    vArr[lastIndex] = vArr[lastIndex].slice(0, -1);
            
                    if (vArr[vArr.length - 1] === "") {
                      vArr.pop();
                    } else {
                      vArr[lastIndex] = JSON.stringify(vArr[lastIndex]);
                    }
                  } else {
                    ASSERT(false, 'parse error')
                  }
                  ret.push(`.backgroundImage(${vArr.join(" + ")})`);
                }  else {
                  ASSERT(false, 'parse error')
                }
                
              } else {
                debugger
                console.error('unknown bg')
                v = `(${v}).trim().slice(4, -1)`
              }
                // debugger
            } else { //un inline mode
              debugger
              let v = v.trim();
              computedStyle[nN] = v;
            
              if (v.startsWith("url(") && v.endsWith(")")) {
                v = v.slice(4, -1);
                if (v[0] === '"' || v[0] === '\'')
                try {v = JSON.parse(v)} catch (e) {ASSERT(false, "not support dynamic style: " + n_n + ";" + e.toString() )}
              } else {
                ASSERT(false)
              }
              if (v.trim())
                ret.push(`.backgroundImage("${v}")`)
            }
            break;
            case "backgroundSizeWidth": 
            case "backgroundSizeHeight": 
            case "min-height":
            case "min-width":
              if (inlineMode) {
                try {v = JSON.parse(v)} catch (e) {ASSERT(false, "not support dynamic style: " + n_n + ";" + e.toString() )}
              }
              computedStyle[nN] = v;
              
              // debugger
            break;
            

            default:
              computedStyle[nN] = inlineMode ? "eval(" + v + ")" : v;

            console.log(n_n)

            if (![
              "pointer-events",
              "text-shadow",
              "pseudo",
              "overflow-x",
              "overflow-y",
              "max-height",
              "min-width",
              "max-width",
            ].includes(n_n)) {
              debugger;
            }
          
        }
        // debugger
      }
    );

    let isNoneBorder;
    Object.keys(borderStyleObject).forEach(
      k => {
        if (borderStyleObject[k] === "BorderStyle.None") {
          delete borderStyleObject[k];
        }
      }
    );

    isNoneBorder = !Object.keys(borderStyleObject).length;
    
    if (!isNoneBorder) {
      let borderStyleString = getExpandString(borderStyleObject, 'borderStyle', computedStyle);
      ret.push(`.borderStyle(${borderStyleString})`)
    }

    if (!isNoneBorder) {
      if (Object.keys(borderWidthObject).length) {
        ret.push(`.borderWidth(${getExpandString(borderWidthObject, 'borderWidth', computedStyle)})`)
      } 
      if (Object.keys(borderColorObject).length) {
        ret.push(`.borderColor(${getExpandString(borderColorObject, 'borderColor', computedStyle)})`)
      } 
    }



    if (Object.keys(marginObject).length) {
      let str = getExpandString(marginObject, 'margin', computedStyle);
      ret.push(`.margin(${str})`);
    } 
    if (Object.keys(paddingObject).length) {
      let str = getExpandString(paddingObject, 'padding', computedStyle);
      ret.push(`.padding(${str})`);
    } 

    if (Object.keys(borderRadiusObject).length) {
      // debugger
      let str = getExpandString(borderRadiusObject, 'borderRadius', computedStyle);
      ret.push(`.borderRadius(${str})`)
    } 

    _processBoxSizing();
    
    // if (computedStyle.borderRadius === '*') debugger

    
    if (cssClassStyle.pseudo) {
      _processPseudo();
      // debugger
    }
   

    ret.forEach(
      str => {
        let strArray = str.split("(");
        let name = strArray[0].substr(1)

        // debugger
        if (!computedStyle[name]) {
          ASSERT(false);
          ASSERT(strArray.length === 2 && strArray[0][0] === '.');
          try {
            computedStyle[name] = eval("(" + strArray[1]);
          } catch (e) {
            ASSERT(false);
          }
        }
      }
    );


    return ret;

    function _processBoxSizing() {

      let minWidth = computedStyle.minWidth;
      let minHeight = computedStyle.minHeight;
      {
        
        if (minWidth || minHeight) {
          if (!node.childNodes) node.childNodes = [];
  
          let newChildName;
  
          if (minWidth && minHeight) {
            newChildName = '::min-width-height';
          } else {
            newChildName = minWidth ? '::min-width' : '::min-height';
          }
  
          node.childNodes.unshift(
            {
              get parentNode () {
                return node;
              },
              tagName: newChildName,
              _convertedTagName: "Column",
              logic: {
                uuid: typeof node.logic.uuid === 'string' ? node.logic.uuid + newChildName :
                  (
                    (node.logic.uuid.type === 'Literal') ? node.logic.uuid.value + newChildName :
                      {
                        type: "BinaryExpression",
                        left: node.logic.uuid,
                        operator: '+',
                        right: {
                          type: 'Literal',
                          value: newChildName
                        }
                      }
                  )
              },
              attrs: {
                style: (minWidth ? `width:${minWidth};margin-right:-${minWidth};` : '')
                + (minHeight ? `height:${minHeight};margin-bottom:-${minHeight};` : '')
                + `z-index:-999;`
              }
            }
          )
        }
        
      }
  
      {
        let paddingStr = ret.find(v=>v.startsWith(".padding("))
        if (paddingStr) {
          let widthStr = ret.find(v=>v.startsWith(".width("))
          let heightStr = ret.find(v=>v.startsWith(".height("))
          let paddingObjectE = computedStyle.padding;
  
          if (!computedStyle.boxSizing || computedStyle.boxSizing === 'content-box') {
  
            ASSERT(!Object.keys(paddingObjectE).filter(k => (""+paddingObjectE[k]).startsWith("eval")).length, 'content-box must has a certain padding')
            
  
            if (widthStr) {
              let v = computedStyle.width;
              let mergeLR = plusPixel(paddingObjectE.left || 0, paddingObjectE.right || 0);
  
              if (mergeLR) {
                v = plusPixel(v, (mergeLR))
                if (typeof v === 'object') {
                  v = getExpressionWithForDomain(node, v).astString;
                }
                ret[ret.indexOf(widthStr)] = `.width("${v}" /*${paddingObjectE.left||0} + ${eval(widthStr.substr(6))} + ${paddingObjectE.right||0}*/)`
              }
            }
  
            if (heightStr) {
              // debugger
              let v = computedStyle.height;
              let mergeTB = plusPixel(paddingObjectE.top || 0, paddingObjectE.bottom || 0);
              if (mergeTB) {
                v = plusPixel(v, mergeTB)
                if (typeof v === 'object') {
                  v = getExpressionWithForDomain(node, v).astString;
                }
                ret[ret.indexOf(heightStr)] = `.height("${v}" /*${paddingObjectE.top||0} + ${eval(heightStr.substr(7))} + ${paddingObjectE.bottom||0}*/)`
              }
            }
  
          } else { // border box
            let maxHeight = computedStyle.maxHeight;
            let maxWidth = computedStyle.maxWidth;
  
            if (minHeight || maxHeight || minWidth || maxWidth) {
              ASSERT(!Object.keys(paddingObjectE).filter(k => paddingObjectE(k).startsWith("eval")).length, 'content-box must has a certain padding')
            
              if (mergeLR) mergeLR = "-" + mergeLR; //padding always > 0
              if (mergeTB) mergeTB = "-" + mergeTB; //padding always > 0
              if (minHeight !== undefined) {
                minHeight = plusPixel(mergeTB, minHeight);
              }
              if (maxHeight !== undefined) {
                maxHeight = plusPixel(mergeTB, maxHeight);
              }
              if (minWidth !== undefined) {
                minWidth = plusPixel(mergeLR, minWidth);
              }
              if (maxWidth !== undefined) {
                maxWidth = plusPixel(mergeLR, maxWidth);
              }
  
              if (typeof minHeight === 'object') {
                minHeight = getExpressionWithForDomain(node, minHeight).astString;
              }
  
              if (typeof minWidth === 'object') {
                minWidth = getExpressionWithForDomain(node, minWidth).astString;
              }
  
              if (computedStyle.minHeight) {
  
                node.childNodes[0].attrs.style = node.childNodes[0].attrs.style
                  .replace(`height:${(computedStyle.minHeight)}`, `height:${(minHeight)}`)
                  .replace(`margin-bottom:${(computedStyle.minHeight)}`, `margin-bottom:${minHeight}`)
              }
              if (computedStyle.minWidth) {
                node.childNodes[0].attrs.style = node.childNodes[0].attrs.style
                  .replace(`width:${(computedStyle.minWidth)}`, `width:${(minWidth)}`)
                  .replace(`margin-right:${(computedStyle.minWidth)}`, `margin-right:${minWidth}`)
              }
  
            }
          }
  
            
        }
      }
    }
    function _processPseudo() {


      let pseudoStyles = cssClassStyle.pseudo.map(
        v => {
          // debugger
          let computedStyle = {};
          let retString = getValueString(v.style, computedStyle);
          return {
            rule: v.rule,
            depth: v.depth,
            str: retString,
            computedStyle
          }
        }
      );


      if (computedStyle.borderRadius && typeof computedStyle.borderRadius !== 'object') debugger
      

      pseudoStyles.forEach(
        (obj, _i) => {
          
          if (pseudoStyles)

          if (computedStyle.borderRadius && typeof computedStyle.borderRadius !== 'object') debugger

          let nodeIndex;
          let nodeTotal;
    
          if (obj.depth) {
            let checkNode = node;

            let depth = obj.depth;
            ASSERT(depth < 0);
            while (depth++ < 0) {
              checkNode = checkNode.parentNode;
            }
            nodeIndex = checkNode._nodeIndex;
            nodeTotal = checkNode.parentNode._childNodesLength;
            // debugger

          } else {
            nodeIndex = node._nodeIndex;
            nodeTotal = node.parentNode._childNodesLength;
          }

          let condition;
          let conditionObj;
          if (obj.rule === 'first-child') {
            // debugger
            if (!isNaN(nodeIndex)) {
              if (nodeIndex === 0) {
                mergeStyles(ret, computedStyle, obj, node);
              }
              return;
            } else {
              condition = `${nodeIndex} === 0`;
              conditionObj = new javascript.astFactory.BinaryExpression(
                "===",
                new javascript.astFactory.Identifier(nodeIndex),
                new javascript.astFactory.Literal(0),
              )
            }
          } else if (obj.rule === 'last-child') {
            
            if (!isNaN(nodeIndex) && !isNaN(nodeTotal)) {
              if (nodeIndex === nodeTotal - 1) {
                // debugger
                mergeStyles(ret, computedStyle, obj, node);
              }
              return;

            } else {
              let lengthM1 = isNaN(nodeTotal) ? `${nodeTotal} - 1` : nodeTotal - 1;
              condition = `${nodeIndex} === ${lengthM1}`;
              conditionObj = new javascript.astFactory.BinaryExpression(
                "===",
                new javascript.astFactory.Identifier(nodeIndex),
                isNaN(nodeTotal) ? javascript.parse(`${nodeTotal} - 1`).body[0].expression: new javascript.astFactory.Literal(nodeTotal - 1),
              )
            }
          } else if (obj.rule.startsWith('nth-child')) {
              
              let childFunc = obj.rule.substr(9).trim();
              ASSERT(childFunc[0] === '(' && childFunc[childFunc.length - 1] === ")");
              childFunc = childFunc.slice(1,-1);

              // console.log(childFunc)

              let _LiteralNodeIndex;
              if (!isNaN(nodeIndex)) {
                _LiteralNodeIndex = Number(nodeIndex)
              }

              if (!isNaN(childFunc)) {
                let num = Number(childFunc);
                if (_LiteralNodeIndex) {
                  if (_LiteralNodeIndex === num) {
                    mergeStyles(ret, computedStyle, obj, node);
                  }
                  return;
                } else {
                  condition = `${nodeIndex} === ${num - 1}`;
                  conditionObj = new javascript.astFactory.BinaryExpression(
                    "===",
                    new javascript.astFactory.Identifier(nodeIndex),
                    new javascript.astFactory.Literal(num - 1),
                  )
                }

              } else if (childFunc === 'even') {
                if (_LiteralNodeIndex) {
                  if (_LiteralNodeIndex & 1) {
                    mergeStyles(ret, computedStyle, obj, node);
                  }
                  return;
                } else {
                  condition = `${nodeIndex} & 1`;
                  conditionObj = new javascript.astFactory.BinaryExpression(
                    "&",
                    new javascript.astFactory.Identifier(nodeIndex),
                    new javascript.astFactory.Literal(1),
                  )
                }

              } else if (childFunc === 'even') {
                if (_LiteralNodeIndex) {
                  if (!(_LiteralNodeIndex & 1)) {
                    mergeStyles(ret, computedStyle, obj, node );
                  }
                  return;
                } else {
                  condition = `!(${nodeIndex} & 1)`;
                  conditionObj = new javascript.astFactory.UnaryExpression(
                    "!",
                    new javascript.astFactory.BinaryExpression(
                      "&",
                      new javascript.astFactory.Identifier(nodeIndex),
                      new javascript.astFactory.Literal(1),
                    )
                  )
                  
                }
              } else { //3n 3n+2
                ASSERT(childFunc.match(/[\d]+n[\+]?[\d]*/))
                let m = Number(childFunc.substr(0, childFunc.indexOf("n")));
                let t;
                if (t = childFunc.indexOf("+") !== -1) {
                  t = childFunc.substr(t + 1);
                  t = Number(t);
                } else {
                  t = 0;
                }
                ASSERT(!isNaN(t) && !isNaN(m)) 

                if (_LiteralNodeIndex) {
                  let mod = (_LiteralNodeIndex+1) % m;

                  if (mod === t) {
                    mergeStyles(ret, computedStyle, obj, node);
                  }
                  return
                } else {
                  condition = `${nodeIndex+1} % ${m} === ${t}`
                  conditionObj = new javascript.astFactory.BinaryExpression(
                    "===",
                    new javascript.astFactory.BinaryExpression(
                      "%",
                      new javascript.astFactory.BinaryExpression("+", new javascript.astFactory.Identifier(nodeIndex), new javascript.astFactory.Literal(1)),
                      new javascript.astFactory.Literal(m),
                    ),
                    new javascript.astFactory.Literal(t),
                  )
                }
                
              }

              // debugger
          } else {
            console.log("ignore: " + obj.rule);
            debugger
            return
          }


          ASSERT(condition && conditionObj)
          if (condition) {
            // debugger
            mergeStyles(ret, computedStyle, obj, node, condition, conditionObj);

          }

        }
      )
    }


  }

  function mergeStyles(cmds, computedStyle, obj, node, condi, condiObj) {

    let rule = obj.rule;
    if (obj.depth) {
      let d = obj.depth;
      while(d++ < 0) {
        rule = "parent:" + rule;
      }
    }

    obj.str.forEach(
      str => {
        let strArray = str.split("(");
        ASSERT(strArray.length === 2 && strArray[0][0] === '.');

        mergeStyle(cmds, computedStyle, str, rule, condi, condiObj);

      }
    );
  }

  function mergeStyle(cmds, computedStyle, str, rule, condi, condiObj) {
    // debugger
    let strArray = str.split("(");
    ASSERT(strArray.length === 2 && strArray[0][0] === '.');
    // debugger
    let name = strArray[0];
    
    let info = cmds.find(v => v.startsWith(name));
    let properyKey = name.substr(1);
    let value = strArray[1].slice(0, -1);

    if (!info) {
      if (condi) {
        // debugger

        
        cmds.push(`.${properyKey}((${condi}) ? ${value} : undefined/*${rule}*/)`);
        computedStyle[properyKey] = new javascript.astFactory.ConditionalExpression(
          condiObj,
          valueToAst(value),
          new javascript.astFactory.Literal(undefined),
        )
      } else {
        if (value !== 'undefined') {
          //default
          cmds.push(str.slice(0, -1) + `/*${rule}*/)`)
          computedStyle[properyKey] = valueToAst(value);
          // debugger
        }
      }
    } else {
      let vIndex = cmds.indexOf(info);
      let kIndex = info.indexOf("(");
      let oldValue = info.slice(kIndex+1, -1);
      let oldValueObj = computedStyle[properyKey];

      let newValue;
      let newValueObj;
      let mergedValue;

      let strArray = str.split("(");
      ASSERT(strArray.length === 2 && strArray[0][0] === '.');

      let objMode =["margin", "padding", "borderRadius", "borderWidth", "borderStyle","borderColor",].includes(properyKey);
      // debugger

      if (oldValue.includes("{")) {
        

        ASSERT(objMode);
        ASSERT(typeof oldValueObj === 'object');

        if (condi) {
          // debugger
          newValue = `(${condi}) ? ${value} : undefined/*${rule}*/`
          newValueObj = new javascript.astFactory.ConditionalExpression(
            condiObj,
            valueToAst(value),
            new javascript.astFactory.Literal(undefined)
          );
        } else {
          newValue = `${value}/*${rule}*/`;
          newValueObj = valueToAst(value);
        }

        if (oldValue.startsWith("Object.assign")) {
          // debugger
          ASSERT(oldValue[oldValue.length-1] === ')');
          mergedValue = oldValue.slice(0, -1) + ", " + newValue + ")";
          ASSERT(oldValueObj.type === "CallExpression");
          oldValueObj.arguments.push(newValueObj)
        } else {

          let canMergeObject = false;
          let condionExpressionArr = oldValue.split("?");
          // let isCondition = 

          let l;
          let r;
          let o = "1?"+value+":1"
          let oldCondtion;
          let oldCondtionObj;
          let oldRule = "";

          if (oldValue.includes("/*")) {
            oldRule = oldValue.substring(oldValue.indexOf("/*"), oldValue.indexOf("*/") + 2)
          }

          if (oldValue[0] === '{') {
            l = oldValue;
            try {
              l = eval(l);
              o = eval(o);
            } catch(e) {
              canMergeObject = false;
            }
          } else {
            if (condionExpressionArr.length === 2) {
              // debugger
              l = "1?" + condionExpressionArr[1];
              r = "0?" + condionExpressionArr[1];
              oldCondtion = condionExpressionArr[0];

              canMergeObject = true;
              try {
                l = eval(l);
                r = eval(r);
                o = eval(o);
              } catch(e) {
                canMergeObject = false;
              }
            }
          }

          if (canMergeObject) {
            // debugger
            let lKeys = l ? Object.keys(l) : [];
            let rKeys = r ? Object.keys(r) : [];
            let oKeys = Object.keys(o);

            if (oKeys.filter(k => lKeys.includes(k) || rKeys.includes(k) ).length === 0
            && (!r || lKeys.filter(k => rKeys.includes(k)).length === 0) // 属性正交
            ) {

              let mergeObj = {}
              let mergeAstObj = {}

              if (!oldValueObj.type) {
                debugger
                mergeAstObj = valueToAst(oldValueObj);
              } else if (oldValueObj.type === 'ConditionalExpression') {
                oldCondtionObj = oldValueObj.test
                ASSERT(oldCondtionObj)
                mergeAstObj = new javascript.astFactory.ObjectExpression(
                  []
                )
              } else {
                ASSERT(false);
                mergeAstObj = oldValueObj
              }

              lKeys.forEach(
                key => {
                  let v = typeof l[key] === 'string' ? JSON.stringify(l[key]) : l[key];

                  if (oldCondtion) {
                    mergeObj[key] = `${oldCondtion} ? ${v} : undefined${oldRule}`
                    mergeAstObj.properties.push(
                      {
                        key: new javascript.astFactory.Literal(key),
                        value: new javascript.astFactory.ConditionalExpression(
                          oldCondtionObj,
                          valueToAst(v),
                          new javascript.astFactory.Literal(undefined), 
                        )
                      }
                    )
                  } else {
                    mergeObj[key] = `${v}${oldRule}`;
                    mergeAstObj.properties.push(
                      {
                        key: new javascript.astFactory.Literal(key),
                        value: valueToAst(v),
                      }
                    )
                  }
                }
              )

              rKeys.forEach(
                key => {

                  let v = typeof r[key] === 'string' ? JSON.stringify(r[key]) : r[key];
                  if (oldCondtion) {
                    mergeObj[key] = `(!${oldCondtion}) ? ${v} : undefined${oldRule}`
                    mergeAstObj.properties.push(
                      {
                        key: new javascript.astFactory.Literal(key),
                        value: new javascript.astFactory.ConditionalExpression(
                          oldCondtionObj,
                          new javascript.astFactory.Literal(undefined), 
                          valueToAst(v),
                        )
                      }
                    )
                  } else {
                    ASSERT(false)
                    mergeObj[key] = `${v}${oldRule}`;
                    mergeAstObj.properties.push(
                      {
                        key: new javascript.astFactory.Literal(key),
                        value: valueToAst(v),
                      }
                    )
                  }
                }
              )

              oKeys.forEach(
                key => {
                  let v = typeof o[key] === 'string' ? JSON.stringify(o[key]) : o[key];

                  if (condi) {
                    // debugger
                    mergeObj[key] = `(${condi}) ? ${v} : undefined/*${rule}*/`
                    mergeAstObj.properties.push(
                      {
                        key: new javascript.astFactory.Literal(key),
                        value: new javascript.astFactory.ConditionalExpression(
                          condiObj,
                          valueToAst(v),
                          new javascript.astFactory.Literal(undefined), 
                        )
                      }
                    )
                  } else {
                    mergeObj[key] = `${v}/*${rule}*/`
                    mergeAstObj.properties.push(
                      {
                        key: new javascript.astFactory.Literal(key),
                        value: valueToAst(v),
                      }
                    )
                  }
                }
              );

              ASSERT(Object.keys(mergeObj).length === lKeys.length + rKeys.length + oKeys.length)
              mergedValue = "{" + Object.keys(mergeObj).map(key => key + ":" + mergeObj[key]).join(", ") + "}"
              computedStyle[properyKey] = mergeAstObj;
            } else {
              canMergeObject = false;
            }
            
          }
         


          if (!canMergeObject) {
            // debugger

            if (oldValue[0] = ("{")) {
              
            } else {
              debugger
              oldValue = "{}, " + oldValue
            }
  
            mergedValue = "Object.assign(" + oldValue + ", " + newValue + ")";
            let mergeAstObj;
            // debugger
            if (!oldValueObj.type) {
              mergeAstObj = valueToAst(oldValueObj)
            } else {
              mergeAstObj = oldValueObj
            }

            let args = [mergeAstObj];
            if (mergeAstObj.type !== "ObjectExpression") {
              args.unshift(new javascript.astFactory.ObjectExpression([]));
            }
            ASSERT(newValueObj)
            args.push(newValueObj);

            mergeAstObj = new javascript.astFactory.CallExpression(
              new javascript.astFactory.MemberExpression(
                new javascript.astFactory.Identifier('Object'),
                new javascript.astFactory.Identifier('assign'),
              ),
              args
            )

            computedStyle[properyKey] = mergeAstObj;

          }
        }

        cmds[vIndex] = (`.${properyKey}(${mergedValue})`);


      } else {
        debugger
        ASSERT(!objMode)

        if (condi) {
          newValue = `(${condi}) ? ${value} : ${oldValue}/*${rule}*/`
          newValueObj = new javascript.astFactory.ConditionalExpression(
            condiObj,
            valueToAst(value),
            new javascript.astFactory.Literal(undefined)
          );
        } else {
          newValue = `${value}/*${rule}*/`;
          newValueObj = typeof value === 'string' ? value : valueToAst(value);
        }
        cmds[vIndex] = (`.${properyKey}(${newValue})`);
        computedStyle[properyKey] = newValueObj;

      }

      // debugger
    }
    
  }

  function valueToAst(value) {

    if (typeof value === 'object') {
      if (value.type) {
        return value
      } else {
        return new javascript.astFactory.ObjectExpression(
          Object.keys(value).map(key => ({key: new javascript.astFactory.Literal(key), value: new javascript.astFactory.Literal(value[key])}))
        )
      }
    } else {

      if (typeof value === "number") {
        return new javascript.astFactory.Literal(value);

      } else if (typeof value === "string") {
        // debugger
        if (value.startsWith("0x")) {
          value = eval(value);
          return new javascript.astFactory.Literal(value);

        } else {
          try {
            value = JSON.parse(value);
            if (typeof value === 'object')
              return  valueToAst(value);
            else 
              return new javascript.astFactory.Literal(value);
          } catch (e) {
            debugger
            return javascript.parse(value).body[0].expression;
          }
        }
      } else {
        ASSERT(false)
      }


    }

  }

  // nerver use physics
  function plusPixel(l, r) {

    if (typeof l === 'object' || typeof r === 'object') {
      debugger
      ASSERT(false, 'not support yet')
    }

    if (l == 0) return r;
    else if (r == 0) return l;

    if (l.endsWith("lpx")) {
      if (r.endsWith("lpx"))
        return parseFloat(l) + parseFloat(r) + "lpx"
      else if (r.endsWith("vp") || r.endsWith("px")) {
        return new javascript.astFactory.BinaryExpression(
          "+",
          new javascript.astFactory.BinaryExpression(
            "+",
            new javascript.astFactory.Literal(parseFloat(l)),
            new javascript.astFactory.CallExpression(
              new javascript.astFactory.Identifier("px2lpx"),
              [
                new javascript.astFactory.CallExpression(
                  new javascript.astFactory.Identifier("vp2px"),
                  [
                    new javascript.astFactory.Literal(parseFloat(r)),
                  ]
                )
              ]
            ),
          ),
          new javascript.astFactory.Literal("lpx")
        );
      }
      else 
        ASSERT(false, 'not support plus pixel with differnt unit')
    } else if (l.endsWith("vp") || l.endsWith("px")) {
      if (r.endsWith("lpx")) {
        return new javascript.astFactory.BinaryExpression(
          "+",
          new javascript.astFactory.BinaryExpression(
            "+",
            new javascript.astFactory.Literal(parseFloat(l)),
            new javascript.astFactory.CallExpression(
              new javascript.astFactory.Identifier("px2vp"),
              [
                new javascript.astFactory.CallExpression(
                  new javascript.astFactory.Identifier("lpx2px"),
                  [
                    new javascript.astFactory.Literal(parseFloat(r)),
                  ]
                )
              ]
            ),
          ),
          new javascript.astFactory.Literal("vp")
        );
      }
      else if (r.endsWith("vp") ||r.endsWith("px"))
        return parseFloat(l) + parseFloat(r) + "vp"
      else 
        ASSERT(false, 'not support plus pixel with differnt unit');
    }
    else {
      ASSERT(false, 'not support plus pixel with differnt unit');
    }
    debugger
  }

  function getExpandString(o, key, computedStyle) {

    let ret;
    let tmpObj = {};
    if (o.hasOwnProperty("left")
      && o.left === o.right
      && o.left === o.top
      && o.left === o.bottom
      ) {
        tmpObj[key] = {left: o.left, right: o.right, top: o.top, bottom: o.bottom, }
        ret = o.left;
        
    } else if (
      o.hasOwnProperty("topLeft")
      && o.topLeft === o.topRight
      && o.topLeft === o.bottomLeft
      && o.topLeft === o.bottomRight
    ) {
      tmpObj[key] = {topLeft: o.topLeft, topRight: o.topRight, bottomLeft: o.bottomLeft, bottomRight: o.bottomRight}
      ret = o.topLeft;
    } else {
      tmpObj[key] = {}
        o.hasOwnProperty('left') && (tmpObj[key].left = o.left);
        o.hasOwnProperty('right') && (tmpObj[key].right = o.right);
        o.hasOwnProperty('top') && (tmpObj[key].top = o.top);
        o.hasOwnProperty('bottom') && (tmpObj[key].bottom = o.bottom);

        o.hasOwnProperty('topLeft') && (tmpObj[key].topLeft = o.topLeft);
        o.hasOwnProperty('topRight') && (tmpObj[key].topRight = o.topRight);
        o.hasOwnProperty('bottomLeft') && (tmpObj[key].bottomLeft = o.bottomLeft);
        o.hasOwnProperty('bottomRight') && (tmpObj[key].bottomRight = o.bottomRight);


        ret = "{" + [
          o.hasOwnProperty('left') ? `"left": ${o.left}` : 0,
          o.hasOwnProperty('right') ? `"right": ${o.right}` : 0,
          o.hasOwnProperty('top') ? `"top": ${o.top}` : 0,
          o.hasOwnProperty('bottom') ? `"bottom": ${o.bottom}` : 0,

          o.hasOwnProperty('topLeft') ? `"topLeft": ${o.topLeft}` : 0,
          o.hasOwnProperty('topRight') ? `"topRight": ${o.topRight}` : 0,
          o.hasOwnProperty('bottomLeft') ? `"bottomLeft": ${o.bottomLeft}` : 0,
          o.hasOwnProperty('bottomRight') ? `"bottomRight": ${o.bottomRight}` : 0,

        ].filter(v=>v).join(", ") + "}"
      }

      let distObj = new javascript.astFactory.ObjectExpression(
        []
      );

      for (let p in tmpObj[key]) {
        let v = tmpObj[key][p]
        try {

          if (typeof v === "number") {

          } else if (typeof v === "string") {
            if (v.startsWith("0x")) {
              v = eval(v)
            } else {
              v = JSON.parse(v)
            }
          } 

          tmpObj[key][p] = v;
          distObj.properties.push(
            {
              key: new javascript.astFactory.Literal(p),
              value: new javascript.astFactory.Literal(v),
              
            } 
          );

          Object.defineProperty(
            distObj, p, {
              value: v,
              enumerable: false
            }
          )

        } catch (e) {
          // tmpObj[key][p] = `eval(${tmpObj[key][p]})`
          // debugger
          distObj.properties.push(
            {
              key: new javascript.astFactory.Literal(p),
              value: javascript.parse(v).body[0].expression,
              
            } 
          )

          Object.defineProperty(
            distObj, p, {
              value: `eval(${v})`,
              enumerable: false
            }
          )

        }
      }

      computedStyle[key] = distObj
      // debugger

      return ret;
  }

  function convertFontWeight(_fontWeight) {
    if (!isNaN(_fontWeight)) {
      if (_fontWeight <= 300) {
        _fontWeight = "Lighter"
      } else if (_fontWeight <= 400) {
        _fontWeight = "Normal"
      } else if (_fontWeight <= 500) {
        _fontWeight = "Medium"
      } else if (_fontWeight <= 700) {
        _fontWeight = "Bold"
      } else {
        _fontWeight = "Bolder"
      }
      // 100 - Thin
      // 200 - Extra Light (Ultra Light)
      // 300 - Light
      // 400 - Normal
      // 500 - Medium
      // 600 - Semi Bold (Demi Bold)
      // 700 - Bold
      // 800 - Extra Bold (Ultra Bold)
      // 900 - Black (Heavy)

    } else {
      _fontWeight = _fontWeight[0].toUpperCase() + _fontWeight.substr(1);
    }

    ASSERT(["Lighter", "Normal", "Regular", "Medium", "Bold", "Bolder"].includes(_fontWeight))
    return _fontWeight;
  }

  function convertColor(v) {

    if (typeof v === 'string' && v[0] === '"') {
      v = eval(v);
      // debugger
      v = require("../../../../processor/processor_css_obj/convertor/utils/color_normalize.js")(v, "ARGB")
    }


    if (v === 'transparent') {
     return 'Color.Transparent';
    }

    if (v[0] === '#') {
      if (v.length === 7) {
        return '0x' + v.substr(1)
      } else if (v.length === 9 && parseInt(v.substr(1, 2), 16) > 0) { //"#00FFFFFF" => 0xFFFFFF means no alpha
        return '0x' + v.substr(1)
      } else {
        return `"${v}"`;
      }
    } else {
      ASSERT(false, 'not support yet')
    }
  }

  function convertLength(v) {
    // console.log(JSON.stringify({vlae:v}));
    if (v === 0|| v === "0") {
      return 0;
    }

    if (v.endsWith("vh")) {
      v = parseFloat(v.slice(0, -2)) / 100;
      if (v === 1)
        v = `SCREEN_HEIGHT`;
      else if (v === -1)
        v = `-SCREEN_HEIGHT`;
      else if (v === 0)
        v = 0;
      else 
        v = `${v} * SCREEN_HEIGHT`;
    } else if (v.endsWith("lpx")) {
      v = `"${v}"`
    } else if (v.endsWith("px")) {
      v = `"${v.slice(0, -2)}vp"`
    } else {
      v = `"${v}"`
    }
    ASSERT(v.endsWith(`lpx"`) || v.endsWith(`vp"`) || v.endsWith(`fp"`)  || v.endsWith(`%"`) || v.endsWith(`SCREEN_HEIGHT`));
    return v
  }