

const envKeys = require("../../../../config/target_platfrom_list.js");
const javascript = require('../../../../parser/parse_ast/javascript/index.js');


const traverse = require('../utils/traverse.js');

module.exports = (root, targetEnv) => {
    let rules = root.stylesheet.rules;

    for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        if (rule.type === 'comment') {
            // debugger

        }
    }
};


// function (node, targetEnv) {
//     var evalStringConst = "";
//     envKeys.forEach(
//         (key)=> {
//             evalStringConst += "\nconst " + key + " = " + (key === "IS_" + targetEnv ? 1 : 0) + ";";
//         }
//     );
    
//     removeEnvIf(node, targetEnv);
//     function removeEnvIf(node, targetEnv) {
//         if (!node.childNodes) return;

//         for (var i = 0; i < node.childNodes.length; i++) {

//             var subNode = node.childNodes[i];

//             if (!subNode.logic || !subNode.logic["env-if"]) continue;
//             let envIf = subNode.logic["env-if"].trim();

//             if (typeof envIf === 'object') {
//                 envIf = javascript.serialize(envIf); //not tested yet
//             } else {
//                 envIf = envIf.trim();
//             }
            

//             if (targetEnv !== "MVVM" && targetEnv !== "SIMULATOR") {
                
//                 if (envIf) {
//                     delete subNode.logic["env-if"];
//                     let result = false;
                    
//                     const evalStringFunc = `(function () {
//                     ${evalStringConst}
    
//                     return ${envIf}
//                     })()`
//                     try {
//                         const eval2 = eval;
//                         result = eval2(evalStringFunc);//prevent rollup warning
//                     } catch (e) {
//                         console.error("error env-if")
//                     }
    
//                     if (!result)
//                         node.childNodes[i] = null;
//                 }
//             } else {
                
//                 const mustacheParser = require('../../parser/parse_mustache.js');
//                 const mustache = {
//                   parse: function (input) {
//                     return mustacheParser.parse(input, javascript);
//                   }
//                 }
//                 let envIfObj = mustache.parse(`{{${envIf}}}`)
//                 if (subNode.logic["if"]) {
//                     subNode.logic["if"] = {
//                         type: "LOGICAL_EXPRESSION",
//                         left: envIfObj,
//                         operator: '&&',
//                         right: subNode.logic["if"]
//                     }
//                 } else if (subNode.logic["elif"]) {
//                     subNode.logic["elif"] = {
//                         type: "LOGICAL_EXPRESSION",
//                         left: envIfObj,
//                         operator: '&&',
//                         right: subNode.logic["elif"]
//                     }
//                 } else if (subNode.logic["else"]) {
//                     delete subNode.logic["else"];
//                     subNode.logic["elif"] = envIfObj;
//                 } else {
//                     subNode.logic["if"] = envIfObj;
//                 }
//             } 
//         }

//         node.childNodes = node.childNodes.filter(v => !!v);

//         node.childNodes.forEach(
//             subNode => {
//                 removeEnvIf(subNode, targetEnv);
//             }
//         );

//     }
// }