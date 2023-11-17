
let evalStringConstDict = {};


module.exports = function (contents, targetEnv) {

    // debugger
    if (targetEnv === 'SIMULATOR' || targetEnv === 'MVVM' ) return contents;

    if (!evalStringConstDict[targetEnv]) {
        evalStringConstDict[targetEnv] = "";
        const envKeys = require("../../config/target_platfrom_list.js");
        envKeys.forEach(
            (key)=> {
                evalStringConstDict[targetEnv] += "\nconst " + key + " = " + (key === "IS_" + targetEnv ? 1 : 0) + ";";
            }
        );
    }
    let evalStringConst = evalStringConstDict[targetEnv];

    const eval2 = eval;//prevent rollup warning

    for (let i = 0; i < 2; i++) {
        let checkText = (i === 0) ? "/*{IS_" : "/*{!IS_";
        let staratIndex = 0;
        while((staratIndex = contents.indexOf(checkText,staratIndex)) !== -1) {

            let endIndex = contents.indexOf("}*/", staratIndex)
            let platformRule = contents.substring(staratIndex + 3, endIndex);
            
            

            const evalStringFunc = `(function () {
                ${evalStringConst}

                return ${platformRule}
            })()`;

            let ifFit;
            try {
                ifFit = eval2(evalStringFunc);
            } catch (e) {
                throw new Error("unkrown platform rule: " + platformRule)
            }

            console.log(`wxss filter rule {{${platformRule}}}: ` + !!ifFit);
            if (!ifFit) {
                let endEnter = contents.indexOf('\n',endIndex);
                if (endEnter === -1) {
                    endEnter = contents.length;
                }
                let importTail = contents.substring(endIndex + 4, endEnter).trim();

                if (importTail.endsWith("*/")) {
                    importTail = importTail.substring(0, importTail.length - 2);
                    // debugger
                }

                while (importTail.includes("*/")) { // 防止该行有*/
                    importTail = importTail.replace("*/", "**")
                }

                importTail += '*/';

                contents = contents.substring(0, staratIndex+2) + "_" + contents.substring(staratIndex + 3, endIndex) + "}**_" + importTail + contents.substring(endEnter);
            } else {
                contents = contents.substring(0, staratIndex+2) + "_" + contents.substring(staratIndex + 3)
            }

        }
    }

    return contents;
}