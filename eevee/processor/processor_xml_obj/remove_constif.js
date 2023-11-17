

const envKeys = require("../../config/target_platfrom_list.js");
const javascript = require('../../parser/parse_ast/javascript/index.js');

module.exports = function (node, targetEnv) {

    var evalStringConst = "";
    envKeys.forEach(
        (key)=> {
            evalStringConst += "\nconst " + key + " = " + (key === "IS_" + targetEnv ? 1 : 0) + ";";
        }
    );
    
    replaceConstIf(node, targetEnv);
        
    function replaceConstIf(node, targetEnv) {
        if (!node.childNodes) return;

        for (var i = 0; i < node.childNodes.length; i++) {
            var subNode = node.childNodes[i];
            if (!subNode.logic || (!subNode.logic["if"] && !subNode.logic["elif"])) continue;

            let logicIf = subNode.logic["if"] || subNode.logic["elif"];
            let result = undefined;
            let isConstlogicIf = undefined;

             if (typeof logicIf === 'object') {
                logicIf = javascript.serialize(logicIf); //not tested yet
            } else {
                isConstlogicIf = true;
                if (logicIf === "")
                    result = false;
                else
                    result = true;
            }


            // console.log("logicIf" + logicIf)

            if (isConstlogicIf === undefined) {

               
                const evalStringFunc = `(function () {
                    ${evalStringConst}
                    return ${logicIf}
                })()`;
                try {
                    const eval2 = eval;
                    result = eval2(evalStringFunc);
                } catch (e) {
                    isConstlogicIf = false;
                    result = undefined;
                    let newlogicIf = logicIf;

                    envKeys.forEach(
                        (key)=> {
                            newlogicIf = newlogicIf.replace(key, (key === "IS_" + targetEnv) ? "true" : "false");
                        }
                    );

                    if (newlogicIf !== logicIf) {
                        console.warn(`replace logic:if from "${logicIf}" to "${newlogicIf}"`);
                        subNode.logic["if"] = javascript.parse(newlogicIf);
                    }
                }
            }

            if (isConstlogicIf) {

                if (subNode.logic["if"]) {
                    if (!node.childNodes[i+1] || !node.childNodes[i+1].logic || (!node.childNodes[i+1].logic["elif"] && node.childNodes[i+1].logic["else"]) ) {
                        if (typeof window === "undefined")
                            console.warn("remove logic:if for const: " + subNode.logic["if"]);
                        else
                            console.log("%cremove logic:if for const: " + subNode.logic["if"], "color:grey");
    
                        if (result) {
                            // 永真
                            delete subNode.logic["if"];
                        } else {
                            // 永假
                            node.childNodes[i] = null;
                        }
                    }
                } else if (subNode.logic["elif"]) {
                    if (!node.childNodes[i+1] || !node.childNodes[i+1].logic || (!node.childNodes[i+1].logic["elif"] && node.childNodes[i+1].logic["else"]) ) {
                       
                        if (result) {
                            if (typeof window === "undefined")
                                console.warn("change logic:elif to logic:else for always true: " + subNode.logic["elif"]);
                            else
                                console.log("%cchange logic:elif to logic:else for always true: " + subNode.logic["elif"], "color:grey");
    
                            // 永真
                            delete subNode.logic["elif"];
                            subNode.logic["else"] = new javascript.astFactory.Literal(true);
                        } else {
                            // 永假
                            node.childNodes[i] = null;

                            if (typeof window === "undefined")
                                console.warn("remove logic:elif for always false: " + subNode.logic["if"]);
                            else
                                console.log("%cremove logic:elif for always false: " + subNode.logic["if"], "color:grey");
        
                        }
                    }

                } else {
                    ASSERT(false)
                }
                
            }
        }

        node.childNodes = node.childNodes.filter(v => !!v);
        node.childNodes.forEach(
            subNode => {
                replaceConstIf(subNode, targetEnv);
            }
        );

    }
}
