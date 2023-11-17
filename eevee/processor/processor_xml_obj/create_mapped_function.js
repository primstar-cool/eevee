function ASSERT (flag, ...args) {
    if (!flag) {
      debugger
      throw new Error(...args);
    }
  }
  
let createFunctionStrMode = 0;
module.exports = createMappedFunction;
createMappedFunction.createFunctionStr = (ast) => {

    if (ast.type === "Identifier") {
        return `\t\t/*0*/\n\t\t/*${JSON.stringify(ast)}*/\n\t\tfunction (_cONTEXT) {\n\t\t\treturn (_cONTEXT.${ast.name});\n\t\t}`
    }

    

    let nodeWrapper = {data: ast};
    var {functionArray} = createMappedFunction(nodeWrapper, false, false, false);
    ASSERT(functionArray.length === 1);
    return functionArray[0];
}

function createMappedFunction(node, replaceNode, monitorFor, saveOriginalNode, targetEnv) {

    var mapArr = [];
    var referKeys = [];
    referKeys.__ignores = [];
    let functionArray =  createAMappedFunction(node, mapArr, referKeys);
    
    return {functionArray: functionArray, referKeys: referKeys};


    function createAMappedFunction(node, arr, referKeysParent) {

        // if (node.isStatic) {
        //     return arr;
        // }

        var referKeys = [];
        referKeys.__ignores = referKeysParent.__ignores;
        

        var referKeysInner = [];
        referKeysInner.__ignores = referKeys.__ignores;

        if (node.logic && (node.logic['for'])) {

            if (node.logic['for-index']) {
                referKeys.__ignores.push(node.logic['for-index'].value);
            }
            if (node.logic['for-index']) {
                referKeys.__ignores.push(node.logic['for-index'].value);
            }
            
        }

        var resultStr;

        let nodeData = node.data;

        if (typeof nodeData === "string") {
            const javascript = require("../../parser/parse_ast/javascript/index.js");
            const mustacheParser = require("../../parser/parse_mustache.js");
            // debugger
            if (!nodeData.trim().startsWith("<!--"))
            {
                nodeData = mustacheParser.parse(nodeData, javascript);
            }
            else {
                nodeData = {"type":"Literal","value": nodeData};
            }
        }

        if ((resultStr = checkAObjFunctionStr(nodeData, referKeys))){
            setNewTypeData(nodeData, resultStr, arr);

            if (replaceNode) {
                node.data = nodeData;
            }
        } else if (nodeData && nodeData.type !== "Literal") {
            // debugger
            if (replaceNode) {
                node.data = nodeData;
            }
        }

        

        if (node.attrs) {
            for (var key in node.attrs) {
                var value = node.attrs[key];

                if ((resultStr = checkAObjFunctionStr(value, referKeys))){
                    setNewTypeData(value, resultStr, arr);
                }
            }
        }

        if (node.logic) {
            for (var key in node.logic) {
                var value = node.logic[key];

                if ((resultStr = checkAObjFunctionStr(value, referKeys))){
                    setNewTypeData(value, resultStr, arr);

                }
            }
        }

        if (node.events) {
            if (node.events.bind)
            for (var key in node.events.bind) {
                var value = node.events.bind[key];

                if ((resultStr = checkAObjFunctionStr(value, referKeys))){
                    setNewTypeData(value, resultStr, arr);
                }
            }

            if (node.events.catch)
            for (var key in node.events.catch) {
                var value = node.events.catch[key];

                if ((resultStr = checkAObjFunctionStr(value, referKeys))){
                    setNewTypeData(value, resultStr, arr);

                }
            }
        }

        if (node.childNodes) {
            node.childNodes.forEach( cNode=>createAMappedFunction(cNode, arr, referKeys))
        }

        if (node.logic && (node.logic['for'])) {

            if (node.logic['for-index']) {
                referKeys.__ignores.pop();
            }
            if (node.logic['for-item']) {
                referKeys.__ignores.pop();
            }

            if (referKeys && referKeys.length) {
                let forName = node.logic['for'].name;
                var rks = referKeys.filter(v=>v !== forName);
                if (rks.length && monitorFor) {
                    node.logic["rks"] = rks;
                }
            }
            
        }

        if (referKeys.length) {
            referKeys.forEach(
                v=> {
                    if (!referKeysParent.includes(v)) {
                        referKeysParent.push(v);
                    }
                }
            )
            
        }

        delete referKeys.__ignores;
        if (!referKeys.length) {
            node.isStatic = true;
        }

        return arr;

    }

    function checkAObjFunctionStr(obj, _referKeys) {
        if (!obj || (typeof obj !== 'object')) return null;
        if (obj.type === "BinaryExpression"
           || obj.type === "MemberExpression" 
           || obj.type === "ConditionalExpression"
           || obj.type === "UnaryExpression"
           || obj.type === "LogicalExpression"
           || obj.type === "ObjectExpression"
           || obj.type === "CallExpression"
           )
           return createAObjFunctionStr(obj, _referKeys);
        else {
          if (obj.type === "Identifier") {
            addReferKey(obj.name, _referKeys);
          } 
        //   else if (obj.type === "ObjectExpression") {
        //     obj.properties.forEach(

        //         v => {
        //             checkAObjFunctionStr(v.key, _referKeys);
        //             checkAObjFunctionStr(v.value, _referKeys);
        //         }
        //     );
        //     return createAObjFunctionStr(obj, _referKeys);

        //     // debugger
        //   }

          return null;
        } 
    }

    function addReferKey(v, _referKeys) {
        if (!_referKeys.includes(v) && !_referKeys.__ignores.includes(v)) {
            _referKeys.push(v);
        }
    }

    function createAObjFunctionStr(obj, _referKeys, holder = null) {
        if (!obj || (typeof obj !== 'object')) return null;

        var ret;
        if (obj.type === "Identifier") {
            if (!holder) {
                ret = '_cONTEXT.' + obj.name;
                addReferKey(obj.name, _referKeys);
            } else {
                ret = obj.name;
            }
            
        }
        else if (obj.type === "Literal") {
            if (typeof obj.value === 'string')
                ret = JSON.stringify(obj.value)
            else 
                ret = obj.value;
        } else if (obj.type === "BinaryExpression") {
            ret = "(" + getBinaryExpressionStr(obj, _referKeys) + ")"
        } else if (obj.type === "MemberExpression") {
            if (obj.computed)
                ret = createAObjFunctionStr(obj.object, _referKeys) + '[' + createAObjFunctionStr(obj.property, _referKeys) + ']';
            else 
                ret = createAObjFunctionStr(obj.object, _referKeys) + '.' + createAObjFunctionStr(obj.property, _referKeys, obj.object);

        } else if (obj.type === "ConditionalExpression") {
            ret = "(" + createAObjFunctionStr(obj.test, _referKeys) + " ? (" + createAObjFunctionStr(obj.consequent, _referKeys) + ") : (" + createAObjFunctionStr(obj.alternate, _referKeys) + "))";
        } else if (obj.type === "UnaryExpression") {
            ret = obj.operator + createAObjFunctionStr(obj.argument, _referKeys);
        } else if (obj.type === "LogicalExpression") {
            ret = "(" + createAObjFunctionStr(obj.left, _referKeys) + obj.operator + createAObjFunctionStr(obj.right, _referKeys) + ")"
        } else if ( obj.type === "ArrayExpression") {
            // debugger
            ret = "[" + obj.elements.map(v => createAObjFunctionStr(v, _referKeys)).join(",") + "]"
        } else if ( obj.type === "ObjectExpression") {
            // debugger
            ret = "{" + obj.properties.map(v => `${createAObjFunctionStr(v.key,_referKeys)}:${createAObjFunctionStr(v.value,_referKeys)}`).join(",") + "}"
        } else if ( obj.type === "CallExpression") {
            ret = _getCallExpressionCallee(obj.callee, _referKeys) + "(" + obj.arguments.map(v=>createAObjFunctionStr(v, _referKeys)).join(", ") + ")" 
        }
        else {
            throw new Error('not support ' + obj.type)
            return null;
        }

        return ret;

        function _getCallExpressionCallee(objCallee, _referKeys) {

            // debugger


            if (objCallee.type === 'Identifier'
            && ["isNaN", "isFinite", "parseInt", "parseFloat", "Number"].includes(objCallee.name)) {
                return objCallee.name
            } 
            // else if (objCallee.type === 'MemberExpression'
            // && objCallee.object.type === 'Identifier'
            // && objCallee.property.type === 'Identifier'
            // ) {
            //     if (objCallee.object.name === "JSON"
            //     || objCallee.object.name === "Math"
            //     || objCallee.object.name === "Date"
            //     || objCallee.object.name === "String"
            //     || loopObjCallee.object.name === "Array"
            //     ) {
            //         return `${objCallee.object.name}.${objCallee.property.name}`
            //     }
              
            // } 
            else {
                // debugger
                if (objCallee.type === 'MemberExpression' && objCallee.property.type === 'Identifier') {
                    // let objectName;
                    let objectStr =  objCallee.property.name;
                    let loopObjCallee = objCallee;
                    while(loopObjCallee.object && loopObjCallee.object.type === 'MemberExpression'
                    && loopObjCallee.object.property.type === 'Identifier'
                    ) {
                        objectStr =  loopObjCallee.object.property.name + "." + objectStr
                        loopObjCallee = loopObjCallee.object;
                    }



                    if (loopObjCallee.object.type === 'Identifier') {

                        let objName = loopObjCallee.object.name;

                        if (objName.startsWith("@EXTERNAL_SCOPE__"))
                            objName = objName.substr(17);

                        if (objName === "JSON"
                        || objName === "Math"
                        || objName === "Date"
                        || objName === "String"
                        || objName === "Object"
                        || objName === "Array") {
                            return `${objName}.${objectStr}`
                        } else {
                            ASSERT(false, 'unknown object: ' + objName)
                        }
                    } else if (loopObjCallee.object.type === 'ArrayExpression') {
                        return `${createAObjFunctionStr(loopObjCallee.object, _referKeys)}.${objectStr}`
                    } else {
                        ASSERT(false, "not support yet")
                    }
                    // debugger
                }
                
            }
    
            return createAObjFunctionStr(objCallee, _referKeys);
        }
    }

    


    function getBinaryExpressionStr(obj, _referKeys) {
        switch (obj.operator) {
            case '+':
            case '-':
            case '*':
            case '/':
            case '%':
            case '>':
            case '>=':
            case '<':
            case '<=':
            case '==':
            case '!=':
            case '===':
            case '!==':
            case '&':
            case '>>':
            case '<<':
            case '||': //by ts
            case '&&': //by ts
            case '??': //by ts


                return createAObjFunctionStr(obj.left, _referKeys) + " " + obj.operator + " " + createAObjFunctionStr(obj.right, _referKeys)
            default:
                ASSERT(false)
                throw new Error('not support:' + obj.operator);
                
        }
    }

    function setNewTypeData(obj, resultStr, arr) {

        

        if (replaceNode && saveOriginalNode) {
            obj._orginalNode = Object.assign({}, obj);
        }

        var tag = JSON.stringify(obj)
        var functionStr = '\t\t/*' + tag + '*/'
            + '\n\t\tfunction (_cONTEXT) {\n\t\t\treturn ' + resultStr + ';\n\t\t}'

        if (replaceNode) {
            obj.type = "MappedFunc";
        
            delete obj.operator;
            delete obj.left;
            delete obj.right;
            delete obj.object;
            delete obj.property;
            delete obj.test;
            delete obj.consequent;
            delete obj.alternate;
            delete obj.mustache;
            
            if (arr[tag] === undefined) {
                obj.fnId = arr.length;
                functionStr = '\t\t/*' + obj.fnId + '*/\n' + functionStr;
                arr.push(functionStr);
                arr[tag] = obj.fnId;
            } else {
                obj.fnId = arr[tag];
            }
            
        } else {
            if (arr[tag] === undefined) {
                let fnId =  arr.length
                functionStr = '\t\t/*' + fnId + '*/\n' + functionStr;
                arr[tag] = fnId;
                arr.push(functionStr);

            }
        }
        

    }
}