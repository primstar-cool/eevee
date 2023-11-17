
const path = require("path");

module.exports = processInclude;


 function processInclude (node, nodeFilePath, rootSrcPath, readFileFunc, objConvFunc, processSubInclude, treeLevelLimit = Infinity) {

    if (!node.childNodes) return;
    

    if (!rootSrcPath) rootSrcPath = path.dirname(nodeFilePath);

    let _childNodes = node.childNodes;
    // let childNodesNew = [];
    for (var i = 0; i < _childNodes.length; i++) {

        var subNode = _childNodes[i];


        if (subNode.tagName !== 'include')
        {
            // childNodesNew.push(subNode);
            if (subNode.childNodes && treeLevelLimit) {
                processInclude(subNode, nodeFilePath, rootSrcPath, readFileFunc, objConvFunc, treeLevelLimit - 1)
            }

        } else {
            // debugger
            if (!subNode.attrs.src) {
                throw new Error("error include path");
                continue;
            }

            let subChildPath;
            if (subNode.attrs.src.startsWith("/")) { 
              subChildPath = path.resolve(rootSrcPath, "." +subNode.attrs.src);
            } else {
              subChildPath = path.resolve(path.dirname(nodeFilePath), subNode.attrs.src);
            }

            var subIncludeContent = readFileFunc(subChildPath);
            var subIncludeNode = objConvFunc(subIncludeContent, subChildPath, rootSrcPath, readFileFunc, typeof processSubInclude === 'number' ? processSubInclude - 1 : processSubInclude);

            subNode.includedContent = subIncludeNode;
            subNode.sourceType = node.sourceType || subChildPath.substring(subChildPath.lastIndexOf(".") + 1);

            // var includeIf = getWxIf(subNode);

            // if (retainComment) {
            //   childNodesNew.push(
            //     {
            //       tagName: null,
            //       data: `<!--include from: ${path.relative(path.dirname(rootSrcPath), subChildPath)}-->`
            //     }
            //   )
            // }

            // if (!includeIf) {
            //   childNodesNew = childNodesNew.concat(subIncludeNode.childNodes);
            // } else {

            //   for (let j = 0; j < subIncludeNode.childNodes.length; j++) {
            //     let expandIncludeNode = subIncludeNode.childNodes[j];

            //     var subIf = getWxIf(expandIncludeNode);
            //     if (subIf) {
            //       expandIncludeNode.attrs["wx:if"] = `{{(${includeIf}) && (${subIf})}}`;
            //     } else {
            //       if (!expandIncludeNode.attrs) {
            //         expandIncludeNode.attrs = {};
            //       }
            //       expandIncludeNode.attrs["wx:if"] = "{{" + includeIf + "}}";
            //     }

            //     childNodesNew.push(expandIncludeNode);//20201117
            //   }
            // }
        }
    }

}