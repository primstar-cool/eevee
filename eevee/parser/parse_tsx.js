const ts = require("typescript"); 

module.exports = function (
    content,filePath,
    ...args
) {

    // const { parseSync, transformSync } = require('@babel/core');
    // let options = {
    //     presets: [
    //         require("babel-preset-typescript")
    //         ],
    //         plugins: [
    //             require('babel-plugin-syntax-jsx'),
    //         ].concat([
    //     ]),
    //     retainLines: true
    // }

    // let cleanCode = transformSync(content, options).code;
    // let bable = parseSync(cleanCode, options)
    // let ret2 = parseSync(content, options)


    const sourceCode = ts.createSourceFile.call(ts, filePath, content, ...args); 
    
    let simpleVisitAST = {
        tsNode: sourceCode,
        type: ts.SyntaxKind[sourceCode.kind],

    };

    loopTsNode(simpleVisitAST);

    function loopTsNode(simpleNode) {
        if (simpleNode.tsNode) {
            let children = [];

            ts.forEachChild(simpleNode.tsNode, (subNode)=> {
                let ret = {
                    type: ts.SyntaxKind[subNode.kind],
                    text: content.substring(subNode.pos, subNode.end)
                };
                Object.defineProperty(ret, "tsNode", {value: subNode, enumerable: false});
                Object.defineProperty(ret, "parentNode", {value: simpleNode, enumerable: false, writable: true});

                children.push(ret);
            });

            if (children.length) {
                simpleNode.children = children;
                simpleNode.children.forEach(loopTsNode);
            }

        }
    }
    
    return simpleVisitAST;
    
}