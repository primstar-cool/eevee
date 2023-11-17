

function ASSERT (flag, ...args) {
    if (!flag) {
        debugger
        throw new Error(...args);
    }
}
const javascript = require('../../../parser/parse_ast/javascript');
const removeEmptyNode = require('../../../processor/processor_xml_obj/remove_empty_node');
const SUPPORT_TYPES = ["Identifier", "ElementAccessExpression", "PropertyAccessExpression", "ObjectLiteralExpression", "CallExpression", "PrefixUnaryExpression", "BinaryExpression"];
const ts = require('typescript');

module.exports = function (astNode, tagNameBuiltInList) {
    let exportClassNode = astNode.children.find(
        v => {

            if (v.type === "ClassDeclaration") {
                let childrenTypes = v.children.map(vv=>vv.type);
    
                return childrenTypes.includes("ExportKeyword") && childrenTypes.includes("DefaultKeyword")
            }
    
            return false;
            
        }
    );

    ASSERT(exportClassNode)


    let heritageClauseNode = exportClassNode.children.find(
        v => v.type === "HeritageClause"
    );
    ASSERT(heritageClauseNode)

    let exportFuncNode;
    heritageClassName = heritageClauseNode.text.trim();
    if (heritageClassName.endsWith("Component")) {
        exportFuncNode = exportClassNode.children.find(
            v => v.type === "MethodDeclaration" && v.children.find(vv=>vv.type === 'Identifier' && vv.text.trim() === 'render')
        );
    } /*else if (heritageClassName.endsWith("App")) {
        //TODO
    } */

    ASSERT(exportFuncNode);
    let exportFuncBlockNode = exportFuncNode.children.find(v=>v.type==='Block');
    

    let nodeGenReturn = exportFuncBlockNode.children.find(v=>v.type=="ReturnStatement");
    let nodeGenReturnIndex = exportFuncBlockNode.children.indexOf(nodeGenReturn);
    let nodeGenOther = exportFuncBlockNode.children.filter((v,i)=>  (i < nodeGenReturnIndex) || (i > nodeGenReturnIndex && v.type === 'FunctionDeclaration' ));
    
    let nodeGenOtherSorted = nodeGenOther.filter(v => v.type === 'FunctionDeclaration').concat(nodeGenOther.filter(v =>v.type !== 'FunctionDeclaration'))
    
    let wholeInitText = nodeGenOtherSorted.map(v=> v.text).join("\n")

    nodeGenOther = nodeGenOther.map( v=> (v.type === 'FirstStatement' && v.children.length === 1) ? v.children[0] : v);
    // nodeGenOther = nodeGenOther.map( v=> (v.type === 'VariableDeclarationList' && v.children.length === 1) ? v.children[0] : v);


    // const parse_jsx = require("../../../parser/parse_jsx.js")
    
    let variableDeclarationLists = nodeGenOther.filter( v=> (v.type === 'VariableDeclarationList'));

    let varArray = [];

    variableDeclarationLists.forEach(
        variableDeclarationList => {
            let declarationText = variableDeclarationList.text.trim();
            variableDeclarationList.children.forEach(
                variableDeclaration => {
                    // debugger
                    varArray.push(
                        {
                            identifier: variableDeclaration.children.find(v=>v.type === "Identifier").tsNode.escapedText,
                            type: (variableDeclaration.children.find(v=>v.type.endsWith("Keyword")) || {}).type,
                            kind: declarationText.substr(0, declarationText.replace(/\s/, " ").indexOf(" ")),
                            text: declarationText, 
                        }
                        
                    )
                    // debugger
                }
            )
        }
    );

    let funcDeclarationLists = nodeGenOther.filter( v=> (v.type === 'FunctionDeclaration'))
        .map(v=>v.children.find(vv=>vv.type === 'Identifier')).filter(v=>v).map(v=>v.tsNode.escapedText);
    

    // debugger
    
    let localVarNameDict = {};
    varArray.forEach(v=> {
        ASSERT(! localVarNameDict[v.identifier])
        localVarNameDict[v.identifier] = v;
    });
    let loopIgnoreIds = [];

    

    // varArray.forEach(
    //     v=> {
    //         v.funcText = `export default function () {${wholeInitText}
    //             return ${v.identifier}
    //         }`;
    //         v.funcTextTreeShaked = _getTreeShakedCode(v.funcText)

    //         ASSERT(v.funcTextTreeShaked);

    //         console.log(v.funcTextTreeShaked)

    //         // debugger
    //     }
    // );

    // debugger
    nodeGenReturn = removeParenthesizedExpression(nodeGenReturn)

    function removeParenthesizedExpression(node) {

        if (node.children) {
            node.children = node.children.map(removeParenthesizedExpression);
        }

        if (node.type === "ParenthesizedExpression") {
            ASSERT(node.children.length === 1);
            node.children[0].parentNode = node.parentNode;
            return node.children[0];
        }

        return node;
    }

    nodeJsxRoot = nodeGenReturn.children[0];

    let xmlObject = dumpNode(nodeJsxRoot)
    removeEmptyNode(xmlObject);

    let loaclVarUsed = xmlObject.logic.rks.filter(v=>v.startsWith("@LOCAL__")).map(v=>v.substr(8));

    // debugger
    // let memberVarUsed = [];

    let wholeInitTextShakedCode = (() => {
        let processString =`export default function () {${wholeInitText}
            return {${loaclVarUsed.join(", ")}};
        }`;
        return _getTreeShakedCode(processString);
        // return _getTreeShakedCode(processString).replace("function ()", `function /*${loaclVarUsed.join(", ")}*/()`)
    })();


    let localVarChildNodes = loaclVarUsed.map(
        id => {

            let varVO = localVarNameDict[id];
            varVO.funcText = `export default function () {${wholeInitText}` +
                         `     return ${varVO.identifier}` + 
                         `}`;
            varVO.funcTextTreeShaked = _getTreeShakedCode(varVO.funcText);
            
            let {rks, code} = _analysisReferKeys(varVO.funcTextTreeShaked, id);

            // memberVarUsed = memberVarUsed.concat(rks.filter(v=>v.startsWith("@MEMBER__")));
            return {
                tagName: "identifier",
                id: id,
                scope: "@LOCAL__",
                kind: varVO.kind,
                type: {
                    'BooleanKeyword': 'boolean',
                    'NumberKeyword': 'number',
                    'StringKeyword': 'string',
                }[varVO.type] || 'any',
                code: code,
                logic: {
                    rks: rks.filter(v=> v !== "@LOCAL__" + id)
                }
            }
            
        }
    );
    let allLocalRefer = localVarChildNodes.map(v=>v.logic.rks).flat();

    // debugger
    let result = {
        
        childNodes: [
        {
            tagName: 'template',
            childNodes: [xmlObject],
        },
        {
            tagName: 'context',
            childNodes: [
                {
                    tagName: 'script',
                    attrs: {
                        name: "render"
                    },
                    childNodes:[
                        {data: _analysisReferKeys(wholeInitTextShakedCode).code},
                        {data: `/*${wholeInitTextShakedCode}*/`}

                    ],
                    logic: {
                        rks: allLocalRefer
                    }
                }
            ].concat(localVarChildNodes).concat(
                funcDeclarationLists.filter(fv => allLocalRefer.includes("@LOCAL_FUNC__" + fv)).map(

                    fv => ({
                        tagName: "identifier",
                        id: fv,
                        scope: "@LOCAL_FUNC__",
                        // kind: "function",
                        // type: 'function',
                        // code: fv,  
                    })
                )


            ).concat(
                xmlObject.logic.rks.filter(v=>!v.startsWith("@")).map(
                    id => 
                        (
                            {
                            tagName: "identifier",
                            id: id,
                            scope: "@CONTEXT__",
                            kind: "var",
                            type: 'any'
                        }
                    )
                )
            ).concat(
                xmlObject.logic.rks.filter(v=>v.startsWith("@MEMBER__")).map(
                    id => 
                        (
                            {
                            tagName: "identifier",
                            id: id.substr(9),
                            scope: "@MEMBER__",
                            kind: "var",
                            type: 'any'
                        }
                    )
                )
            )
        }
    ]};
    result.childNodes.forEach(
        v =>  Object.defineProperty(
            v, "parentNode", {value: result, enumerable: false, writable: true}
        )
    );

    return result;

    function dumpNode(nodeJsx) {
    
        ASSERT(nodeJsx);
        if (!nodeJsx) return null;

        if (nodeJsx.type === "JsxElement") {
            ASSERT(nodeJsx.children[0].type === 'JsxOpeningElement' && nodeJsx.children[nodeJsx.children.length - 1].type === 'JsxClosingElement');


            if ((nodeJsx.children[0].type === 'JsxOpeningElement' && nodeJsx.children[nodeJsx.children.length - 1].type === 'JsxClosingElement')) {
                // debugger
                let childrenS = nodeJsx.children.slice(1,-1);

               
                
                
                let tagName = getTagName(nodeJsx.children[0].children[0]);
                let childNodes;
                let referKeys;

                if (tagName === 'Text') {
                    ASSERT(childrenS.length <= 1);

                    let referKeysSub = [];
                    let data;

                    if (childrenS[0]) {
                        if (childrenS[0].type === 'JsxText') {
                            data = childrenS[0].text
                        } else {
                            // debugger
                            data = convTscAstToAcornRipAst(childrenS[0] , referKeysSub)
                        }
                    } else {
                        data = "";
                    }

                    childNodes = [
                        {
                            tagName: null,
                            data: data
                        }
                    ];
                    // debugger
                    referKeys = referKeysSub;

                } else {
                    childNodes = childrenS.map(
                        dumpNode
                    ).flat().filter(v=>v);
                    referKeys = childNodes.map(childNodes => childNodes.logic ? childNodes.logic.rks || [] : []).flat();
                }

                
                // debugger
                return {
                    attrs : analysisAttrs(nodeJsx.children[0].children[1], referKeys),
                    tagName: tagName,
                    childNodes,
                    logic: {
                        rks: Array.from(new Set(referKeys)),
                    }
                }
            }

            return null;

            
        } else if (nodeJsx.type === "JsxSelfClosingElement") {
            // debugger    
            ASSERT(nodeJsx.children.length <= 2);
            let tagName = getTagName(nodeJsx.children[0]);
            if (nodeJsx.children[1]) {
                let referKeys = [];
                return {
                    attrs: analysisAttrs(nodeJsx.children[1], referKeys),
                    tagName: tagName,
                    logic: {
                        rks: Array.from(new Set(referKeys)),
                    }
                }
            } else {
                return {
                    tagName: tagName,
                }
            }
        } else if (nodeJsx.type === "JsxText") {
            return {
                data: nodeJsx.text
            }
        } else if (nodeJsx.type === "JsxExpression") {
            ASSERT(nodeJsx.children.length === 1);

            let nodeJsxExpression = nodeJsx.children[0];
            // debugger
            if (nodeJsxExpression.type === "BinaryExpression")
            {
                ASSERT(nodeJsxExpression.children.length === 3 && nodeJsxExpression.children[1].type === 'AmpersandAmpersandToken');

                if ((nodeJsxExpression.children.length === 3 && nodeJsxExpression.children[1].type === 'AmpersandAmpersandToken')) {
                    let distNode = dumpNode(nodeJsxExpression.children[2]);
                    if (!distNode.logic) distNode.logic = {};
                    let referKeys = distNode.logic.rks || [];
                    distNode.logic["if"] = genLogicIfAndRefer(nodeJsxExpression.children[0], referKeys);
                    distNode.logic["if"].mustache = true;

                    distNode.logic.rks = Array.from(new Set(referKeys));
                    return distNode;
                } else {
                    ASSERT(false)
                }
                
            } else if (nodeJsxExpression.type === "ConditionalExpression") {

                
                ASSERT(nodeJsxExpression.children.length === 5 && nodeJsxExpression.children[1].type === 'QuestionToken' && nodeJsxExpression.children[3].type === 'ColonToken');

                if (nodeJsxExpression.children.length === 5 && nodeJsxExpression.children[1].type === 'QuestionToken' && nodeJsxExpression.children[3].type === 'ColonToken') {
                    let nodeFit = dumpNode(nodeJsxExpression.children[2]);
                    let nodeUnfit  = dumpNode(nodeJsxExpression.children[4]);
                    // if ()

                    if (nodeFit) {
                        if (!nodeFit.logic) nodeFit.logic = {};
                        let referKeys = nodeFit.logic.rks || [];
                        nodeFit.logic["if"] = genLogicIfAndRefer(nodeJsxExpression.children[0], referKeys);
                        nodeFit.logic["if"].mustache = true;

                        nodeFit.logic.rks = Array.from(new Set(referKeys));

                        if (Array.isArray(nodeFit)) nodeFit.forEach(v => v.logic = nodeFit.logic);

                        if (nodeUnfit) {

                            if (!Array.isArray(nodeFit) || (Array.isArray(nodeFit) && nodeFit.length === 1) ) {
                                nodeUnfit.logic = {
                                    "else": new javascript.astFactory.Literal(""),
                                    rks: nodeFit.logic.rks
                                }
                            } else {
                                nodeUnfit.logic = {
                                    "if": new javascript.astFactory.UnaryExpression("!", nodeFit.logic["if"]),
                                    rks: nodeFit.logic.rks
                                }
                            }

                            if (Array.isArray(nodeUnfit)) nodeUnfit.forEach(v => v.logic = nodeUnfit.logic);
                                
                            return [nodeFit, nodeUnfit].flat();
                        } else {
                            return nodeFit;
                        }
                    } else {
                        if (nodeUnfit) {
                            if (!nodeUnfit.logic) nodeUnfit.logic = {};
                            let referKeys = nodeUnfit.logic.rks || [];
                            nodeUnfit.logic["if"] = new javascript.astFactory.UnaryExpression("!", 
                                genLogicIfAndRefer(nodeJsxExpression.children[0], referKeys)
                            );
                            nodeUnfit.logic["if"].mustache = true;

                            nodeUnfit.logic.rks = Array.from(new Set(referKeys));

                            
                            if (Array.isArray(nodeUnfit)) nodeUnfit.forEach(v => v.logic = nodeUnfit.logic);
                            return nodeUnfit;
                        } else {
                            ASSERT(false, "ConditionalExpression with empty export, it means call a function with void return, this is not supported yet (function will not call)")
                            return null;
                        }
                    }
                } else {
                    ASSERT(false, 'not support yet')
                }
                

            } else if (nodeJsxExpression.type === "JsxElement" || nodeJsxExpression.type === "JsxSelfClosingElement")
            {
                return dumpNode(nodeJsxExpression);
            }
            else if (nodeJsxExpression.type === "CallExpression"
            && nodeJsxExpression.children[0].type === 'PropertyAccessExpression'
            && nodeJsxExpression.children[0].children[1].type === 'Identifier'
            && nodeJsxExpression.children[0].children[1].tsNode.escapedText === 'map'

            ) {
                // debugger
                let forNodeLogic = {};
                let referKeys = [];
                forNodeLogic["for"] = convTscAstToAcornRipAst(nodeJsxExpression.children[0].children[0], referKeys);
                forNodeLogic["for"].mustache = true;

                let mapNodeAst = nodeJsxExpression.children[1];
                let forItemAst;
                let forIndexAst;
                let forReturnNode;

                if (mapNodeAst.type === 'ArrowFunction') {
                    if (mapNodeAst.children.length === 3) {
                        forItemAst = mapNodeAst.children[0];
                        ASSERT(mapNodeAst.children[1].type === "EqualsGreaterThanToken");
                        forReturnNode = mapNodeAst.children[2];

                    } else if (mapNodeAst.children.length === 4) {
                        forItemAst = mapNodeAst.children[0];
                        forIndexAst = mapNodeAst.children[1];

                        ASSERT(mapNodeAst.children[2].type === "EqualsGreaterThanToken");
                        forReturnNode = mapNodeAst.children[3];

                    } else {
                        ASSERT(false)
                    }
                } else if (mapNodeAst.type === 'FunctionExpression') {
                    let forBlockAst;
                    if (mapNodeAst.children.length === 2) {
                        forItemAst = mapNodeAst.children[0];
                        forBlockAst  = mapNodeAst.children[1];
                    } else if (mapNodeAst.children.length === 3) {
                        forItemAst = mapNodeAst.children[0];
                        forIndexAst = mapNodeAst.children[1];
                        forBlockAst  = mapNodeAst.children[2];
                    } else if (mapNodeAst.children.length === 1)  {
                        forItemAst = null
                        forBlockAst  = mapNodeAst.children[0];

                        // ASSERT(false)
                    } else {
                        ASSERT(false)
                    }

                    ASSERT(forBlockAst.type === 'Block');

                    ASSERT(forBlockAst.children.length === 1 && forBlockAst.children[0].type === "ReturnStatement", 'not support mapping funciont with code except return')
                        // debugger
                    // debugger
                    forReturnNode = forBlockAst.children[0].children[0];

                }

                if (forItemAst) {
                    ASSERT(forItemAst.type === "Parameter" && forItemAst.children.length === 1 && forItemAst.children[0].type === 'Identifier');
                    forNodeLogic["for-item"] = new javascript.astFactory.Literal(forItemAst.children[0].tsNode.escapedText);
                    loopIgnoreIds.push(forItemAst.children[0].tsNode.escapedText);

                } else {
                    // forNodeLogic["for-item"] = new javascript.astFactory.Literal("___item");
                }

                if (forIndexAst) {
                    ASSERT(forIndexAst.type === "Parameter" && forIndexAst.children.length === 1 && forIndexAst.children[0].type === 'Identifier');
                    forNodeLogic["for-index"] = new javascript.astFactory.Literal(forIndexAst.children[0].tsNode.escapedText);
                    loopIgnoreIds.push(forIndexAst.children[0].tsNode.escapedText);

                }

                
                let forNodeInner = dumpNode(forReturnNode);

                if (forIndexAst) {
                    loopIgnoreIds.pop();
                }
                if (forItemAst) {
                    loopIgnoreIds.pop();
                }
                
                
                // debugger

                if (!forNodeInner.logic) forNodeInner.logic = {};

                let forNodeInnerRks = (forNodeInner.logic.rks||[]).filter(
                    v=> (v !== '@EXTERNAL_SCOPE__' +forNodeLogic["for-item"].value ) && (v !== '@EXTERNAL_SCOPE__' + (forNodeLogic["for-index"]||{}).value)
                )

                forNodeLogic.rks = Array.from(new Set(referKeys.concat(forNodeInnerRks)));

                Object.assign(forNodeInner.logic, forNodeLogic);


                return forNodeInner
            }
            else {
                debugger
                ASSERT(false, 'not support yet')
                return null;

            }


            // debugger
        } else if (nodeJsx.type === 'NullKeyword') {
            return null;
        } else if (nodeJsx.type === 'Identifier' && nodeJsx.tsNode.escapedText === 'undefined') {
            return undefined;
        } else if (nodeJsx.type === 'ArrayLiteralExpression') {
            if (!nodeJsx.children) return null;
            let distNode = nodeJsx.children.map(dumpNode);
            distNode = distNode.flat().filter(v=>v);
            if (distNode.length === 0) return null;
            else if (distNode.length === 1) return distNode[0];
            else return distNode
        }
        else {
            ASSERT(false)
        }


        function analysisAttrs(nodeJsxAttributes, referKeys) {
            ASSERT(nodeJsxAttributes.type === "JsxAttributes");
            // debugger
            if (!nodeJsxAttributes.children) return null;
            
            let attrs = {};
            nodeJsxAttributes.children.forEach(
                n => {
                    if (n.type === "JsxAttribute" && n.children.length === 2 && n.children[0].type === 'Identifier'
                    ) {
                        let attrObj = convTscAstToAcornRipAst(n.children[1], referKeys, true);;
                        if (typeof attrObj === 'object') {
                            attrObj.mustache = true;
                        }
                        attrs[n.children[0].tsNode.escapedText] = attrObj;
                    } else {
                        ASSERT(false)
                    }
                }
            )
            // debugger
            return attrs;
        }

        function getTagName(tagObj) {

            if (tagObj) {
                if (tagObj.type === "Identifier") {
                    if (tagNameBuiltInList && tagNameBuiltInList.includes(tagObj.tsNode.escapedText)) return tagObj.tsNode.escapedText;
                    else return new javascript.astFactory.Identifier(tagObj.tsNode.escapedText);
                } else {
                    ASSERT(false);
                    return tagObj;
                }
            }
        }

        function genLogicIfAndRefer(obj, referKeys) {
            return convTscAstToAcornRipAst(obj, referKeys);
        }


    }

    function convTscAstToAcornRipAst(tscAst, referKeys, enableDirectString = false, holder = null) {

        ASSERT(referKeys);

        if (tscAst.type === "StringLiteral") {
            let text = tscAst.tsNode.text;
            if (enableDirectString) {
                return text
            } else {
                return new javascript.astFactory.Literal(text);
            }
        } else if (tscAst.type === "FirstLiteralToken") {
            // debugger
            return new javascript.astFactory.Literal(JSON.parse(tscAst.tsNode.text));
            
        } else if (tscAst.type === "JsxExpression" && tscAst.children.length === 1 && tscAst.children[0].type === "StringLiteral") {
            let text = tscAst.children[0].tsNode.text;

            if (enableDirectString) {
                return text;
            } else {
                return new javascript.astFactory.Literal(text);
            }
        } else if (tscAst.type === "PropertyAccessExpression" || tscAst.type === "ElementAccessExpression") {
            // debugger
            ASSERT(tscAst.children.length === 2);
            let distMemberObj;
            let distPropertyObj;

            let memberObjAst = tscAst.children[0];
            let propertyObjAst = tscAst.children[1];


            // debugger

            if (propertyObjAst.type === "Identifier"
                && memberObjAst.type === 'PropertyAccessExpression'
                && memberObjAst.children.length === 2
                && memberObjAst.children[0].type === 'ThisKeyword'
                && memberObjAst.children[1].type === 'Identifier'
                && memberObjAst.children[1].tsNode.escapedText === 'state'

            ) {
                // debugger
                referKeys.push(propertyObjAst.tsNode.escapedText);
                return new javascript.astFactory.Identifier(propertyObjAst.tsNode.escapedText); // context
                // if (propertyObjAst.type === )
            }  
            else if (propertyObjAst.type === "Identifier"
                && memberObjAst.type === 'ThisKeyword'
            ) {
                ASSERT(propertyObjAst.tsNode.escapedText  !== 'state');
                // debugger
                // if (("@MEMBER__" + propertyObjAst.tsNode.escapedText) == '@MEMBER__undefined') debugger
                referKeys.push("@MEMBER__" + propertyObjAst.tsNode.escapedText);
                return new javascript.astFactory.Identifier("@MEMBER__" + propertyObjAst.tsNode.escapedText); // member 
                // if (propertyObjAst.type === )
            } else if (propertyObjAst.type === "StringLiteral"
                && memberObjAst.type === 'ThisKeyword'
            ) {
                ASSERT(propertyObjAst.tsNode.escapedText  !== 'state');
                // debugger
                referKeys.push("@MEMBER__" + propertyObjAst.tsNode.text);
                return new javascript.astFactory.Identifier("@MEMBER__" + propertyObjAst.tsNode.text); // member 
                // if (propertyObjAst.type === )
            } else if (propertyObjAst.type === "Identifier"
                && memberObjAst.type === 'ElementAccessExpression'
                && memberObjAst.children.length === 2
                && memberObjAst.children[0].type === 'ThisKeyword'

            ) {
                // debugger
                if (memberObjAst.children[1].type === 'StringLiteral') {
                    
                    let pName = memberObjAst.children[1].tsNode.text;
                    if (pName === 'state') {
                        // debugger
                        referKeys.push(propertyObjAst.tsNode.escapedText);
                        return new javascript.astFactory.Identifier(propertyObjAst.tsNode.escapedText); // context
                    } else {
                        // debugger
                        referKeys.push("@MEMBER__" + pName);
                        return new javascript.astFactory.MemberExpression(
                            new javascript.astFactory.Identifier("@MEMBER__" + pName),
                            new javascript.astFactory.Identifier(propertyObjAst.tsNode.escapedText),
                            true
                        );
                    }
                } else {
                    ASSERT(false)
                }
                // debugger
                return null;
                // if (propertyObjAst.type === )
            } else if (SUPPORT_TYPES.includes(memberObjAst.type)) {
                distMemberObj = convTscAstToAcornRipAst(memberObjAst, referKeys, false, holder);
                distPropertyObj = convTscAstToAcornRipAst(propertyObjAst, referKeys, false, memberObjAst);

            } else {
                ASSERT(false);
            }

            return new javascript.astFactory.MemberExpression(
                distMemberObj,
                distPropertyObj,
                tscAst.type === "ElementAccessExpression"
            );

            // console.log(distMemberObj);
            // console.log(distPropertyObj);
            


        } else if (tscAst.type === "Identifier") {
            // debugger

            const name = tscAst.tsNode.escapedText;
            // const useDotMode = name.match(/[a-zA-Z_][a-zA-Z0-9_]*/);
            
            if (!holder) {
                if (localVarNameDict[name]) {
                    referKeys.push(`@LOCAL__${name}`)
                    return new javascript.astFactory.Identifier(`@LOCAL__${name}`);
                } else {

                    if (loopIgnoreIds.includes(name)) {
                        referKeys.push(`${name}`)
                        return new javascript.astFactory.Identifier(`${name}`);
                    } else {
                        referKeys.push(`@EXTERNAL_SCOPE__${name}`)
                        return new javascript.astFactory.Identifier(`@EXTERNAL_SCOPE__${name}`);
                    }
                    
                }
            } else {
                if (SUPPORT_TYPES.includes(holder.type)) {
                    // 成员变量
                    return new javascript.astFactory.Identifier(name);
                } else {
                    ASSERT(false);
                }
                debugger
            }
           

        } else if (tscAst.type === "BinaryExpression") {
            ASSERT(tscAst.children.length === 3);

            let operater;
            let tsscToken = tscAst.children[1].type;
            if (tsscToken === "AmpersandAmpersandToken") {
                operater = "&&"
            } else if (tsscToken === "BarBarToken") {
                operater = "||"
            } else if (tsscToken === "MinusToken") {
                operater = "-"
            } else if (tsscToken === "PlusToken") {
                operater = "+"
            } 
            else {
                operater = tscAst.children[1].text.trim();
                ASSERT(false, tscAst.children[1].type);
            }

            // debugger
            var ret = new javascript.astFactory.BinaryExpression(
                operater,
                convTscAstToAcornRipAst(tscAst.children[0], referKeys),
                convTscAstToAcornRipAst(tscAst.children[2], referKeys)
            );

            // console.log(ret)
            return ret;

        } else if (tscAst.type === "ConditionalExpression") {
            ASSERT(tscAst.children.length === 5 && tscAst.children[1].type === 'QuestionToken' && tscAst.children[3].type === 'ColonToken');


            if (tscAst.children.length === 5 && tscAst.children[1].type === 'QuestionToken' && tscAst.children[3].type === 'ColonToken') {  
                // debugger
                var ret = new javascript.astFactory.ConditionalExpression(
                    convTscAstToAcornRipAst(tscAst.children[0], referKeys),
                    convTscAstToAcornRipAst(tscAst.children[2], referKeys),
                    convTscAstToAcornRipAst(tscAst.children[4], referKeys)
                );
            }

            // console.log(ret)
            return ret;
        }
        else if (tscAst.type === "ObjectLiteralExpression") {

            let objectPropertys = [];
            // debugger
            if (tscAst.children) {
                if (tscAst.children.find(v=>v.type === "SpreadAssignment")) { // use Object assgin
                    let objArgsArray = [];
                    let lastObjectPropertys;

                    tscAst.children.forEach(
                        c => {
                            if (c.type === 'PropertyAssignment') {
                                if (!lastObjectPropertys) lastObjectPropertys = [];
                                ASSERT(c.children.length === 2 && c.children[0].type === "Identifier");

                                lastObjectPropertys.push(
                                    {
                                        key: new javascript.astFactory.Literal(c.children[0].tsNode.escapedText),
                                        value: convTscAstToAcornRipAst(c.children[1], referKeys)
                                    }
                                )
                            } else if (c.type === 'SpreadAssignment') {
                                if (lastObjectPropertys) {
                                    objArgsArray.push(
                                        new javascript.astFactory.ObjectExpression(lastObjectPropertys)
                                    )
                                    lastObjectPropertys = null;
                                }
                                ASSERT(c.children.length === 1);

                                if (!objArgsArray.length) {
                                    if (tscAst.children.length > 1) {
                                        objArgsArray.push(
                                            new javascript.astFactory.ObjectExpression([])
                                        )
                                    }
                                }// prevent change origianl object

                                objArgsArray.push(convTscAstToAcornRipAst(c.children[0], referKeys))
                                // debugger/
                            }
                        }
                    );

                    if (lastObjectPropertys) {
                        objArgsArray.push(
                            new javascript.astFactory.ObjectExpression(lastObjectPropertys)
                        )
                        lastObjectPropertys = null;
                    }

                    // debugger
                    if (objArgsArray.length > 1) {
                        return new javascript.astFactory.CallExpression(
                            new javascript.astFactory.MemberExpression(
                                new javascript.astFactory.Identifier('@EXTERNAL_SCOPE__Object'),
                                new javascript.astFactory.Identifier('assign'),
                                false
                            ),
                            objArgsArray
                        );
                    } else {
                        return objArgsArray[0];
                    }
                    

                    

                } else {
                    tscAst.children.forEach(
                        v => {
                            ASSERT(v.type === 'PropertyAssignment' && v.children.length === 2 && v.children[0].type === "Identifier");
        
                            objectPropertys.push(
                                {
                                    key: new javascript.astFactory.Literal(v.children[0].tsNode.escapedText),
                                    value: convTscAstToAcornRipAst(v.children[1], referKeys)
                                }
                            )
                        }
                    );
                }
            }

           
            return new javascript.astFactory.ObjectExpression(objectPropertys);
        } else if (tscAst.type === "CallExpression") {
            ASSERT(tscAst.children.length >= 1);
            // debugger
            let parmas = tscAst.children.map(n => convTscAstToAcornRipAst(n, referKeys));
            let _callee = parmas.shift();
            
            return new javascript.astFactory.CallExpression(
                _callee,
                parmas
            );

        } else if (tscAst.type === "PrefixUnaryExpression") {
            ASSERT(tscAst.children.length === 1);

            return new javascript.astFactory.UnaryExpression(
                "!",
                convTscAstToAcornRipAst(tscAst.children[0], referKeys)
            );

        } else if (tscAst.type === "JsxExpression" && tscAst.children.length === 1) {
            // if ("BinaryExpression" === tscAst.children[0].type) {
            //     debugger
            // }

            if (SUPPORT_TYPES.includes(tscAst.children[0].type)){
                let ret = convTscAstToAcornRipAst(tscAst.children[0], referKeys);
                ret.mustache = true;
                return ret;
            }
            
            ASSERT(false);

        } else {
            ASSERT(false);
        }        


        return tscAst;
    }
}

function _analysisReferKeys(code, myName) {
    // debugger
    let ast = require("../../../parser/parse_jsx.js")(code).ast;
    let localBabelAstNode = ast.program.body[0];
    ASSERT(localBabelAstNode.type === 'ExportDefaultDeclaration');
    ASSERT(localBabelAstNode.declaration.type === 'FunctionDeclaration');

    localBabelAstNode = localBabelAstNode.declaration.body;
    ASSERT(localBabelAstNode.type === 'BlockStatement');

    let entryBody = localBabelAstNode.body;
    // debugger


    let referKeys = [];

    // referKeys.push = function(v) {
    //     if (v === '@CONTEXT__state') debugger
    //     return Array.prototype.push.call(referKeys, v)
    // }

    let localVar = [];
    let localFunc = [];
    let localSubFuncVar = [];


    var functionDepth = 0;
    loopObj(entryBody, null, entryBody);

    const generator = require('@babel/generator');
    const newCodeObj = generator.default(ast);
    const rks = Array.from(new Set(referKeys))
    const newCode = newCodeObj.code.replace(
        `default function ()`, `default function (${rks.filter(v=>v.startsWith("@CONTEXT__")).map(v=>v.substr(10)).join(", ")})${myName ? ` /*${myName}*/` : ''}`
    )
    // debugger
    return {rks, code: newCode};


    function loopObj(obj, holder, parentNode) {
        if (Array.isArray(obj))
        {
            obj.forEach(n => loopObj(n, null, obj))
        } else {
            if (typeof obj === 'object' && obj) {

                if (obj.type) { //is a node
                    obj.text = code.substring(obj.loc.start.index, obj.loc.end.index)

                    
                    if (obj.type === "VariableDeclaration") {
                        obj.declarations.forEach(
                            objV => {
                                // debugger
                                ASSERT(objV.type === 'VariableDeclarator' && objV.id && objV.id.type === 'Identifier', 'unknown');
                                if (objV.type === 'VariableDeclarator' && objV.id && objV.id.type === 'Identifier') {
                                    
                                    if (functionDepth === 0) {
                                        localVar.push(objV.id.name);
                                        referKeys.push("@LOCAL__" + objV.id.name);
                                    }
                                    else {
                                        localSubFuncVar[functionDepth].push(objV.id.name);
                                        //var in sub function
                                        // debugger
                                    }
                                    if (objV.init) {
                                        loopObj(objV.init);
                                    }
                                }
                                // debugger
                            }
                        )
                        return;
                    } else if (obj.type === "MemberExpression") {
                        // debugger

                        if (obj.object.type === 'Identifier') {
                            ASSERT(!holder)
                            if (!holder) {
                                collectARefer(obj.object.name);
                                
                            }
                            if (obj.computed) {
                                loopObj(obj.property, null, obj)
                            } else {
                                ASSERT(obj.property.type === 'Identifier')
                            }


                        } else if (obj.object.type === 'MemberExpression') {

                            loopObj(obj.object, null, obj)

                            if (obj.computed) {
                                loopObj(obj.property, obj.object, obj);
                            } else {
                                ASSERT(obj.property.type === 'Identifier')
                            }

                        } else if (obj.object.type === "ThisExpression") {
                            let testName;
                            if (obj.computed) {
                                ASSERT(obj.property.type === 'StringLiteral');

                                if (obj.property.type === 'StringLiteral') {
                                    testName = obj.property.value;
                                }

                            } else {
                                if (obj.property.type === 'Identifier') {
                                    testName = obj.property.name;
                                } else {
                                    ASSERT(false)
                                }
                            }

                            if (testName === "state") {
                                ASSERT(parentNode && parentNode.property.type === 'Identifier');
                                // debugger
                                parentNode.type = 'Identifier';
                                parentNode.name = parentNode.property.name;
                                ASSERT(parentNode.name);
                                referKeys.push("@CONTEXT__" + parentNode.name);

                            } else {
                                obj.object.type = 'Identifier';
                                obj.object.name = '@MEMBER'
                                referKeys.push("@MEMBER__" + testName);
                            }
                            

                        } 
                        return;
                    } else if (obj.type === 'Identifier') {
                        // debugger
                        ASSERT(!holder)
                        if (!holder) {
                            collectARefer(obj.name);
                        }
                        return;
                        // console.log(obj.type)
                    } else if (obj.type === 'FunctionDeclaration') {
                        // debugger

                        if (obj.id) {
                            ASSERT(obj.id.type === 'Identifier');

                            if (functionDepth === 0) {
                                localFunc.push(obj.id.name)
                            };
                        }

                        functionDepth++;
                        // debugger
                        localSubFuncVar[functionDepth] = localSubFuncVar.flat();
                        for (var key in obj) {
                            if (key !== 'id') {
                                loopObj(obj[key], null, obj);
                            }
                        }
                        functionDepth--;
                        // debugger
                        localSubFuncVar.pop();
                        return;
                        // console.log(obj.type)
                    }
                    else {
                        // console.log(obj.type)
                    }
                    
                }

                for (var key in obj) {
                    loopObj(obj[key], null, obj);
                }

            }

        }


    }

    function collectARefer(name) {
        if (functionDepth > 0 && localSubFuncVar[functionDepth].includes(name)) {
                                
            // debugger
            // local function var

        } else {
            if (localFunc.includes(name)) {
                // debugger
                // call local func  tion
                referKeys.push("@LOCAL_FUNC__" + name);

            } else {
                referKeys.push((localVar.includes(name) ? "@LOCAL__" : "@EXTERNAL_SCOPE__") + name);

            }
        }
    }
}


function _getTreeShakedCode(code) {

    // debugger
    // const sourceFile = ts.createSourceFile('tmp.ts', code, ts.ScriptTarget.ESNext, true);
    const result = ts.transpileModule(code, {
        compilerOptions: { 
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2015
        }
    })
    // debugger
    // const jsCode = result.outputFiles[0].text;
    let trimFuncStr = require("../../../processor/processor_js_string/tree_shaking_func.js")(result.outputText, null, "smallest");
    
    return `export default function (` + trimFuncStr.substring(trimFuncStr.indexOf(`function virtualEntry (`)  + 23, trimFuncStr.indexOf(`export { virtualEntry` )).trim()

}