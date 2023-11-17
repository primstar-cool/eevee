const fs = require("fs");
const path = require("path");

const unitTestPath = path.join(__dirname, "to_standard");
const projPaths = fs.readdirSync(unitTestPath).filter(pp => fs.statSync(path.join(unitTestPath, pp)).isDirectory())
const projDetailPath = [];

const isSaveMode = !true;
const isCheckMode = !isSaveMode;

projPaths.forEach(
    pp => {
        const abs_pp = path.join(unitTestPath, pp);
        fs.readdirSync(abs_pp)
            .filter(v => (
                0// + 1
                || v === 'wxmp'
                || v === 'vue'
                || v === 'arkts'
                || v === 'react_native'
            ))
            .forEach(
                v => projDetailPath.push(pp + "/" + v)

            );
    }
)

projDetailPath.forEach(

    n => {
        const testProjPath = path.resolve(unitTestPath, n);
        // debugger
        let eeveeResultString;

        const resultPath = path.join(testProjPath, "result");
        const resultFile = path.join(resultPath, "entry.eevee.json");

        if (n.endsWith('vue')) {
            let checkVueFileName = path.join(testProjPath, 'entry.vue');
            if (fs.existsSync(checkVueFileName)) {
                const vueToStandardTool = require("../eevee/_to_standard/from_vue/vue_to_standard.js");
                const eeveeResult = vueToStandardTool(
                    _readFileFunc(checkVueFileName), checkVueFileName, testProjPath, _readFileFunc
                );


                eeveeResultString = JSON.stringify(eeveeResult, null, 2);

            }
        } else if (n.endsWith('wxmp')) {
            let checkWxmlFileName = path.join(testProjPath, 'entry.wxml');
            let checkWxssFileName = path.join(testProjPath, 'entry.wxss');
            // debugger

            if (fs.existsSync(checkWxmlFileName)) {
                const wxmlToStandardTool = require("../eevee/_to_standard/from_wxml/wxml_to_standard.js");
                const eeveeWxmlResult = wxmlToStandardTool(
                    _readFileFunc(checkWxmlFileName), checkWxmlFileName, testProjPath, _readFileFunc
                );
                // debugger

                const eeveeResult = {
                    sourceType: 'wxmp',
                    childNodes: [Object.assign({}, eeveeWxmlResult, { tagName: 'template' })],
                }

                if (fs.existsSync(checkWxssFileName)) {
                    // const eeveeWxssResult = 
                    const wxssParser = require("../eevee/parser/parse_wxss.js");
                    let result = wxssParser(_readFileFunc(checkWxssFileName), checkWxssFileName, testProjPath, _readFileFunc, true);
                    eeveeResult.childNodes = eeveeResult.childNodes.concat(result)
                }

                eeveeResultString = JSON.stringify(eeveeResult, null, 2);

            }
        } else if (n.endsWith('react_native')) {
            let checkTsxFileName = path.join(testProjPath, 'entry.tsx');
            // debugger

            if (fs.existsSync(checkTsxFileName)) {
                const rnToStandardTool = require("../eevee/_to_standard/from_react_native/rn_to_standard.js");
                const eeveeRNResult = rnToStandardTool(
                    _readFileFunc(checkTsxFileName), checkTsxFileName, testProjPath, _readFileFunc
                );
                eeveeResultString = JSON.stringify(eeveeRNResult, null, 2);

            }
        }

        if (eeveeResultString) {
            if (isSaveMode) {

                if (!fs.existsSync(resultPath)) fs.mkdirSync(resultPath);
                fs.writeFileSync(resultFile, eeveeResultString, "utf8");
                console.log("save file: " + path.relative(unitTestPath, resultFile));
            } else {
                let filenameRel = path.relative(unitTestPath, resultFile);
                let filenameInRel = path.relative(unitTestPath, testProjPath);

                if (!fs.existsSync(resultFile)) {
                    console.error("no result file exist: " + filenameRel);

                } else {
                    let resultContent = fs.readFileSync(resultFile, "utf8");

                    if (resultContent !== eeveeResultString) {
                        console.error("file check error: " + filenameInRel)
                    } else {
                        console.log("file check succ: " + filenameInRel)
                    }
                }

            }
        }

    }
)

function _readFileFunc(filename) {

    if (fs.existsSync(filename))
        return fs.readFileSync(filename, "utf8");

    //thisRes.addDependency(filename); when using webpack, u will addDependency

    throw new Error("miss file: " + filename);
}


// debugger