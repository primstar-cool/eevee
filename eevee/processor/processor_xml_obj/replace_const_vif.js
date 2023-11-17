

const envKeys = require("../../config/target_platfrom_list.js");


module.exports = function (node, targetEnv) {

    var evalStringConst = "";

    if (targetEnv !== "MVVM" && targetEnv !== "SIMULATOR") {
        envKeys.forEach(
            (key)=> {
                evalStringConst += "\nconst " + key + " = " + (key === "IS_" + targetEnv ? 1 : 0) + ";";
            }
        );
    }
    replaceConstVif(node, targetEnv);

    function replaceConstVif(node, targetEnv) {
        if (!node.childNodes) return;

        for (var i = 0; i < node.childNodes.length; i++) {
            var subNode = node.childNodes[i];
            if (!subNode.attrs || !subNode.attrs["v-if"]) continue;

            let vif = subNode.attrs["v-if"].trim();

            // console.log("vif" + vif)
            let result = false;
            

            let isConstVif = true;
            const evalStringFunc = `(function () {
                ${evalStringConst}
                return ${vif}
            })()`;
            try {
                const eval2 = eval;
                result = eval2(evalStringFunc);
            } catch (e) {
                isConstVif = false;
                result = undefined;
                vif = subNode.attrs["v-if"];
                let newvif = vif;

                if (targetEnv !== "MVVM" && targetEnv !== "SIMULATOR") {
                    envKeys.forEach(
                        (key)=> {
                            newvif = newvif.replace(key, (key === "IS_" + targetEnv) ? "true" : "false");
                        }
                    );
                }

                if (newvif !== vif) {
                    console.warn(`replace v-if from "${vif}" to "${newvif}"`);
                    subNode.attrs["v-if"] = newvif;
                }
            }

            if (isConstVif) {
                if (typeof window === "undefined")
                    console.warn("remove v-if for const: " + subNode.attrs["v-if"]);
                else
                    console.log("%cremove v-if for const: " + subNode.attrs["v-if"], "color:grey");
                             if (result) {
                    // 永真
                    delete subNode.attrs["v-if"];
                } else {
                    // 永假
                    node.childNodes[i] = null;
                }
            }
        }

        node.childNodes = node.childNodes.filter(v => !!v);
        node.childNodes.forEach(
            subNode => {
                replaceConstVif(subNode, targetEnv);
            }
        );

        if (node.includedContent) {
            replaceConstVif(node.includedContent, targetEnv);
        }

    }
}