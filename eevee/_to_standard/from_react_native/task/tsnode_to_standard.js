
function ASSERT (flag, ...args) {
    if (!flag) {
        debugger
        throw new Error(...args);
    }
}
const javascript = require('../../../parser/parse_ast/javascript');


function traverse(node, visitor, parent = null) {
    visitor(node, parent);
    if (node.childNodes) {
      node.childNodes.forEach((childNode) => {
        traverse(childNode, visitor, node);
      });
    }
  }

module.exports = function (root, tsAstNode, externalIgnores = ["Object", "Math", "JSON", "Array", "Date",]) {

    tsAstNodeChildren = tsAstNode.children.map( v=> (v.type === 'FirstStatement' && v.children.length === 1) ? v.children[0] : v);

    traverse(root, (node) => {    

        if (node.attrs && node.attrs.style) {
            delete node.attrs.style.mustache;
            node.attrs.style = 
            new javascript.astFactory.CallExpression(
                    new javascript.astFactory.Identifier("stringifyStyle"),
                    [tranversStyle(node.attrs.style, tsAstNodeChildren, externalIgnores)]
                );
            node.attrs.style.mustache = true;
        }

        if (node.tagName === 'Text') {
            node.tagName = "text";

        } else if (node.tagName === 'Image') {
            node.tagName = "image";

            if (node.attrs)
            {
                //TODO
            }
           
        } else if (node.tagName === 'View') {
            
            node.tagName = "view"
           
        }
    })
        
    return root;

}

function tranversStyle(styleObj, tsAstNodeChildren, externalIgnores) {

    // debugger
    if (styleObj.type === 'ObjectExpression') {
        for (let i = 0; i < styleObj.properties.length;) {
            let sa = styleObj.properties[i];
    
            if (sa.key && sa.key.type === 'Literal') {
            
            } else  {
                ASSERT(false)
            }
            i++;
        }
    } else if (styleObj.type === 'MemberExpression')  {

        if (styleObj.object.type === 'Identifier'
            && styleObj.object.name.startsWith("@EXTERNAL_SCOPE__") 
        ) {
            // debugger

            ASSERT(styleObj.property.type === 'Identifier');

            let styleObjKey = styleObj.property.name;


            let nameDefine = styleObj.object.name.substr(17);

            if (externalIgnores.includes(nameDefine)) return styleObj;

        
            let varDefines = tsAstNodeChildren.filter(
                v=> v.type === "VariableDeclarationList"
            ).map(v=>v.children).flat()

            let varDefine = varDefines.find( v => v.type === 'VariableDeclaration' && v.children[0].tsNode.escapedText === nameDefine);
            
            if (varDefine) {
                let objectDefine = varDefine.children[1];
                ASSERT(objectDefine.type === 'CallExpression', 'not support yet');


                ASSERT(objectDefine.children[0].type === 'PropertyAccessExpression' && objectDefine.children[0].text.trim() === "StyleSheet.create", 'not support yet');

                objectDefine = objectDefine.children[1];

                let externalStyleObj = objectDefine.children.find(
                    v => v.type === 'PropertyAssignment' && v.children[0].type === 'Identifier' && v.children && v.children[0].tsNode.escapedText === styleObjKey
                )

                ASSERT(externalStyleObj,  "can't find external define " + nameDefine + `[${styleObjKey}]`);


                ASSERT(externalStyleObj.children[1].type === "AsExpression" || externalStyleObj.children[1].type === "ObjectLiteralExpression");

                if (externalStyleObj.children[1].type === "AsExpression") {

                    externalStyleObj = externalStyleObj.children[1];
                    ASSERT(externalStyleObj.children[0].type === "ObjectLiteralExpression");
                    if (externalStyleObj.children[0].type === "ObjectLiteralExpression") externalStyleObj = externalStyleObj.children[0];

                }
                else if (externalStyleObj.children[1].type === "ObjectLiteralExpression") {
                    externalStyleObj = externalStyleObj.children[1];
                }

                ASSERT(externalStyleObj.type === "ObjectLiteralExpression");



                // debugger

                // debugger
                delete styleObj.computed;
                delete styleObj.object;
                delete styleObj.property;

                styleObj.type = "ObjectExpression";
                styleObj.properties = externalStyleObj.children.filter(v=> v.type === "PropertyAssignment").map(
                    vv => {
                        ASSERT(vv.children[0].type === 'Identifier')

                         return {
                            key: new javascript.astFactory.Literal(vv.children[0].tsNode.escapedText),
                            value: mapTsNodeToAcorn(vv.children[1], true)
                        }                        
                    }
                );
                
                return tranversStyle(styleObj, tsAstNodeChildren, externalIgnores)
                

            } else {
                ASSERT(false, "can't find external define " + nameDefine);
            }

        } else {
            ASSERT(false, 'not support yet')
        }

        // debugger
    } else if (styleObj.type === 'CallExpression')  {
        if (styleObj.callee.type === 'MemberExpression'
        && styleObj.callee.object.type === 'Identifier'
        && styleObj.callee.object.name === '@EXTERNAL_SCOPE__Object'
        && styleObj.callee.property.type === 'Identifier'
        && styleObj.callee.property.name === 'assign'

        ) {
            // debugger
            ASSERT(styleObj.arguments)
            styleObj.arguments = styleObj.arguments.map(
                v => tranversStyle(v, tsAstNodeChildren, externalIgnores)
            )
        }
    } else if (styleObj.type === 'Identifier') {
      return styleObj;
    }
    else {
        debugger
        ASSERT(false)
    }

    return styleObj;


}

function mapTsNodeToAcorn(tsNodeSimple, isSingleValue = false) {
    if (tsNodeSimple.type === 'StringLiteral') {
        // debugger
        return new javascript.astFactory.Literal(tsNodeSimple.tsNode.text);
    } else if (tsNodeSimple.type === 'FirstLiteralToken') {
        return new javascript.astFactory.Literal(JSON.parse(tsNodeSimple.tsNode.text));
    } else if (tsNodeSimple.type === 'CallExpression') {
        // debugger
        if (_isRpxNode(tsNodeSimple)) {

            let arg1AcornAst = mapTsNodeToAcorn(tsNodeSimple.children[1]);
            //bookmark-tag-1            

            if (isSingleValue && arg1AcornAst.type === 'Literal' && typeof arg1AcornAst.value === 'number') {
                arg1AcornAst.value += 'rpx';
                return arg1AcornAst;
            } else {
                return new javascript.astFactory.BinaryExpression(
                    "*",
                    mapTsNodeToAcorn(tsNodeSimple.children[1]),
                    new javascript.astFactory.BinaryExpression(
                        "/",
                        new javascript.astFactory.MemberExpression(
                            new javascript.astFactory.Identifier("@EXTERNAL_SCOPE__PCSEnvironment"),
                            new javascript.astFactory.Identifier("deviceWidth"),   
                        ),
                        new javascript.astFactory.Literal(750)
                    ),
                    
                );
            }
        } else {
            ASSERT(false, 'unknown func:' + tsNodeSimple)
        }

    } else if (tsNodeSimple.type === 'BinaryExpression') {

        let leftTsAst = tsNodeSimple.children[0];
        let rightTsAst = tsNodeSimple.children[2];
        
        // debugger

        // rpx(10 + 20) will process at bookmark-tag-1

        //rpx(10) + rpx(20);
        let appendRpx = false;
        let operator = tsNodeSimple.children[1].text.trim();

        if (leftTsAst.type === 'CallExpression' && _isRpxNode(leftTsAst) && leftTsAst.children[1].type === 'FirstLiteralToken'
        && rightTsAst.type === 'CallExpression' && _isRpxNode(rightTsAst)  && rightTsAst.children[1].type === 'FirstLiteralToken'
        ) {
            appendRpx = true;
            leftTsAst = leftTsAst.children[1];
            rightTsAst = rightTsAst.children[1];
        }

        //rpx(20) * 5 or rpx(20) /* 5 
        if (leftTsAst.type === 'CallExpression' && _isRpxNode(leftTsAst) && leftTsAst.children[1].type === 'FirstLiteralToken'
        && rightTsAst.type === 'FirstLiteralToken' && operator === "*" || operator === "/"
        ) {
            appendRpx = true;
            leftTsAst = leftTsAst.children[1];            
        }

        // 3 * rpx(30) NOT support 3 / rpx(30)
        if (rightTsAst.type === 'CallExpression' && _isRpxNode(rightTsAst) && rightTsAst.children[1].type === 'FirstLiteralToken'
        && leftTsAst.type === 'FirstLiteralToken' && operator === "*"
        ) {
            appendRpx = true;
            rightTsAst = rightTsAst.children[1];            
        }

        let leftAcornAst = mapTsNodeToAcorn(leftTsAst);
        let rightAcornAst = mapTsNodeToAcorn(rightTsAst);
        
        // debugger

        let r = new javascript.astFactory.BinaryExpression(
            operator,
            leftAcornAst,
            rightAcornAst,
        );


        if (r.left.type === 'Literal' && r.right.type === 'Literal') {

            if ((typeof r.left.value === 'string' || typeof r.left.value === 'number')
                && (typeof r.right.value === 'string' || typeof r.right.value === 'number')
            ) {
                r.type = 'Literal';
                // r.value = 'Literal';

                switch (r.operator) {

                    case "*": r.value = r.left.value * r.right.value; break;
                    case "/": r.value = r.left.value / r.right.value; break;
                    case "+": r.value = r.left.value + r.right.value; break;
                    case "-": r.value = r.left.value - r.right.value; break;
                    case "|": r.value = r.left.value | r.right.value; break;
                    case "&": r.value = r.left.value & r.right.value; break;
                    case "^": r.value = r.left.value ^ r.right.value; break;
                    case "**": r.value = r.left.value ** r.right.value; break;

                    default : 
                        ASSERT(false, 'unknwon opertator: ' + r.operator);
                        r.type = 'BinaryExpression';
                }

            }

            // debugger
            if (r.type === 'Literal') {
                delete r.left;
                delete r.right;
                delete r.operator;

            }
            
        }

        if (appendRpx) {
            if (r.type === 'Literal') {
                r.value += 'rpx';
            } else {
                ASSERT(false, 'unknown error')
            }
        }

        // console.log(r);
        return r;
    } 
    else {
        ASSERT(false)
    }

}

function _isRpxNode(tsAstNode) {
    return tsAstNode && tsAstNode.children && tsAstNode.children[0].type === "Identifier"
    && (tsAstNode.children[0].tsNode.escapedText === 'r2p' || tsAstNode.children[0].tsNode.escapedText === 'r2px')
}