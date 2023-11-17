const genNodeCssXPathName = require("../../../helpers/gen_node_css_xpath_name.js");
const getNodeUUID = require("../../../helpers/get_node_uuid.js");
const getObjectDataExpression = require("../../../../exporter/string_utils/get_object_data_expression.js");
const createMappedFunction = require("../../../../processor/processor_xml_obj/create_mapped_function.js");
const javascript = require('../../../../parser/parse_ast/javascript');

function ASSERT (flag, ...args) {
  if (!flag) {
    debugger
    throw new Error(...args);
  }
}


module.exports = function genTails(node, functionArray, styleHolder, cssDomain, sourceType) {
    
    let classDict = require("../../../helpers/gen_all_possible_style.js")(Object.assign({}, node, { childNodes: null }), cssDomain, false, true);
    let cssClassNames = Object.keys(classDict);
    let cssClassStyle;
    let ret;

    if (cssClassNames.length === 0) {
      return [];
    } else if (cssClassNames.length === 1) {
      cssClassStyle = classDict[cssClassNames[0]];
      delete cssClassStyle.__routeKey;

      ret = getValueString(cssClassStyle);

    } else {
      
      ret = [];
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
        if (properyKey === "__routeKey") continue;

        let valueObj = collectKeyNum[properyKey];
        let allKeys0 = Object.keys(valueObj);

       
        if (allKeys0.length === 1 && valueObj[allKeys0[0]].length === allClasses.length) {
          ret = ret.concat(getValueString({[properyKey]: Object.keys(valueObj)[0]}))
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
              let consequents = getValueString({[properyKey]: allKeys0[0]});
              let alternates;
              
              if (allKeys0.length === 2) {
                alternates = getValueString({[properyKey]: allKeys0[1]});
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
                ret.push(propery + `(${condiText} ? ${consequent} : ${alternate})`);
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

                let consequents = getValueString({ [properyKey]: allKeys0[0] });
                let condiText = getConditionText({ test: mergedCondi });

                let alternates;
                if (allKeys0.length === 2) {
                  alternates = getValueString({[properyKey]: allKeys0[1]});
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
                  
                  if (swapTime) {
                    ret.push(propery + `(${condiText} ? ${alternate} : ${consequent})`);
                  } else {
                    ret.push(propery + `(${condiText} ? ${consequent} : ${alternate})`);
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


            let classString = createMappedFunction.createFunctionStr(node.style._classStyleRouteFull.xPathObject)
            classString = classString.substring(classString.indexOf("return") + 6, classString.lastIndexOf(";")).replace(/_cONTEXT\.genClassXPath/g, "genClassXPath").replace(/_cONTEXT\./g, "this.");
            

            let classStyleDict = cssClassNames.map(
              n => ({
                name: n, 
                value: classDict[n][properyKey]
              })
            );


            // debugger

            let allValuesObjs = classStyleDict.map(v=>getValueString({[properyKey]: v.value}));

            for (let j = 0; j < allValuesObjs[0].length; j++) {
              let allValuesObj = allValuesObjs[0][j];

              let propery = allValuesObj.substr(0, allValuesObj.indexOf("("));
              let allValues = allValuesObjs.map(v => v[j].substr(v[j].indexOf("(")));

              let objStr = classStyleDict.map(
                (v,i)=> JSON.stringify(v.name)+":" + allValues[i]
              ).join(", ")
              objStr = `{${objStr}}`;

              ret.push(propery + `(${objStr}[${classString}])`);

              // debugger
            }
             


          }
        }
          
      }

    }

    

    // debugger
  
    if (ret.length >= 2) ret.unshift("");

    return ret;
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
      testString = testString.substring(testString.indexOf("return") + 6, testString.lastIndexOf(";"));

      return `(${testString.replace(/_cONTEXT./g, "this.")})`;

    }
  }


  function getValueString(cssClassStyle) {
    let ret = [];
    Object.keys(cssClassStyle).forEach(
      n_n => {
        let nN = n_n.replace(/-[\w\W]/g, (v) => v[1].toUpperCase());
        let v = cssClassStyle[n_n];
        switch (n_n) {
          case "background-color": 
          case "color":
            if (v[0] === '#') {
              
              if (n_n === 'color') {
                nN = 'fontColor';
              } 
              ret.push(`.${nN}(0x${v.substr(1)})`)


            } else {
              ASSERT(false, 'not support yet')
            }
            // debugger
          break;
          case "width":
          case "height":
          case "font-size":

          case "margin":
          // case "margin-left":
          // case "margin-right":
          // case "margin-top":
          // case "margin-bottom":

          case "padding":
          // case "padding-left":
          // case "padding-right":
          // case "padding-top":
          // case "padding-bottom":

          case "border-width":



            if (v.endsWith("vh")) {
              v = parseFloat(v.slice(0, -2)) / 100;

              ret.push(`.${nN}(${v} * SCREEN_HEIGHT)`)

              return
            }


            ASSERT(v.endsWith("lpx") || v.endsWith("px") || v.endsWith("fp")  || v.endsWith("%") );

            ret.push(`.${nN}("${v}")`)
          break; 
          case "display":
            //TODO
          break; 
          
            
          
          case "flex-direction":
            {
              ASSERT(v === 'row' || v === 'column')
              // ret.push(`.${nN}(${v})`)
            }
          break; 
          case "font-weight":
            if (!isNaN(v)) {
              if (v <= 300) {
                v = "Lighter"
              } else if (v <= 400) {
                v = "Normal"
              } else if (v <= 500) {
                v = "Medium"
              } else if (v <= 700) {
                v = "Bold"
              } else {
                v = "Bolder"
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
              v = v[0].toUpperCase() + v.substr(1);
            }


            ASSERT(["Lighter", "Normal", "Regular", "Medium", "Bold", "Bolder"].includes(v))
            ret.push(`.${nN}(FontWeight.${v})`)
            break;
          case "text-align":
            if (v === 'left') v = "Start";
            else if (v === 'right') v = "End"; //TODO check container if reverse
            else v = v[0].toUpperCase() + v.substr(1);

            ASSERT(["Start", "Center", "End"].includes(v))

            if (isNaN(v)) {
              ret.push(`.${nN}(TextAlign.${v})`)
            } 
          break; 
          default:
            console.log(n_n)
          debugger;
        }
        // debugger
      }
    );

    return ret;
  }