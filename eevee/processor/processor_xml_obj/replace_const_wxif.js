

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
    replaceConstWXIf(node, targetEnv);

    function replaceConstWXIf(node, targetEnv) {
        if (!node.childNodes) return;

        for (var i = 0; i < node.childNodes.length; i++) {
            var subNode = node.childNodes[i];
            if (!subNode.attrs || !subNode.attrs["wx:if"]) continue;

            let wxIf = subNode.attrs["wx:if"].trim();

            // console.log("wxIf" + wxIf)
            let result = false;
            if (wxIf.startsWith("{{") && wxIf.endsWith("}}"))
                wxIf = wxIf.substring(2, wxIf.length-2);
            else {
                delete subNode.attrs["wx:if"];//常数
                if (wxIf === "") {
                    subNode.childNodes[i] = null;
                }
                if (typeof window === "undefined")
                    console.warn("remove wx:if for const: " + subNode.attrs["wx:if"]);
                else
                    console.log("%cremove wx:if for const: " + subNode.attrs["wx:if"], "color:grey");
                    
                continue;
            }

            let isConstWxIf = true;
            const evalStringFunc = `(function () {
                ${evalStringConst}
                return ${wxIf}
            })()`;
            try {
                const eval2 = eval;
                result = eval2(evalStringFunc);
            } catch (e) {
                isConstWxIf = false;
                result = undefined;
                wxIf = subNode.attrs["wx:if"];
                let newWxIf = wxIf;

                if (targetEnv !== "MVVM" && targetEnv !== "SIMULATOR") {
                    envKeys.forEach(
                        (key)=> {
                            newWxIf = newWxIf.replace(key, (key === "IS_" + targetEnv) ? "true" : "false");
                        }
                    );
                }

                if (newWxIf !== wxIf) {
                    console.warn(`replace wx:if from "${wxIf}" to "${newWxIf}"`);
                    subNode.attrs["wx:if"] = newWxIf;
                }
            }

            if (isConstWxIf) {
                if (typeof window === "undefined")
                    console.warn("remove wx:if for const: " + subNode.attrs["wx:if"]);
                else
                    console.log("%cremove wx:if for const: " + subNode.attrs["wx:if"], "color:grey");
                             if (result) {
                    // 永真
                    delete subNode.attrs["wx:if"];
                } else {
                    // 永假
                    node.childNodes[i] = null;
                }
            }
        }

        node.childNodes = node.childNodes.filter(v => !!v);
        node.childNodes.forEach(
            subNode => {
                replaceConstWXIf(subNode, targetEnv);
            }
        );

    }
}