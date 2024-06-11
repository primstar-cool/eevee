const fs = require("fs");
const path = require("path");

const unitTestPath = path.join(__dirname, "from_standard");
const projPaths = fs.readdirSync(unitTestPath).filter(pp => fs.statSync(path.join(unitTestPath, pp)).isDirectory())
const projDetailPath = [];

const isSaveMode = !true;
const isCheckMode = !isSaveMode;

projPaths.forEach(
    pp => {
        const abs_pp = path.join(unitTestPath, pp);
        fs.readdirSync(abs_pp)
            .filter(v =>
            (
                0// + 1
                || v === 'wxmp'
                || v === 'swan'
                || v === 'vue'
                || v === 'arkts'
                || v === 'react'
                || v === 'react_native'
                || v === 'mvvm'

            ))
            .forEach(
                v => projDetailPath.push(pp + "/" + v)
            );
    }
)

projDetailPath.forEach(

    n => {
        const inputPath = path.join(unitTestPath, n, "../entry.eevee.json");

        if (!fs.existsSync(inputPath)) return;

        let eeveeDataString = fs.readFileSync(inputPath, 'utf8')
        let eeveeData = JSON.parse(eeveeDataString);
        let destFileDict = {};

        const resultPath = path.join(unitTestPath, n, "result");

        // debugger

        if (n.endsWith('vue')) {

            const standardToDestTool = require("../eevee/_from_standard/to_vue/standard_to_vue.js");
            destFileDict = standardToDestTool(eeveeData, {
                env: "BROWSER",
                mainClassName: 'entry',
            });

            let destFileDictV3 = standardToDestTool(JSON.parse(eeveeDataString), {
                env: "BROWSER",
                mainClassName: 'entry',
                useVue3: true
            });


            if (destFileDictV3["entry.vue-template.xml"] !== destFileDict["entry.vue-template.xml"]) {
                destFileDict["entry.vue-template.v3.xml"] = destFileDictV3["entry.vue-template.xml"];
            }
            // debugger

            // let renderStr = `<div id="eevee-root" class='eevee-root' style="visibility: hidden">${destFileDict[`entry.vue-template.xml`]}</div>`;
            // const { render, staticRenderFns } = require('vue-template-compiler').compileToFunctions(renderStr);

        } else if (n.endsWith('react')) {

            const standardToDestTool = require("../eevee/_from_standard/to_react/standard_to_react.js");
            destFileDict = standardToDestTool(eeveeData, {
                env: "BROWSER",
                mainClassName: 'entry',
            });

            // debugger
            let destFileDictV17 = standardToDestTool(JSON.parse(eeveeDataString), {
                env: "BROWSER",
                mainClassName: 'entry',
                useJsxLib: true
            });

            Object.assign(destFileDict, destFileDictV17);

            // debugger
        } else if (n.endsWith('wxmp')) {
            const standardToDestTool = require("../eevee/_from_standard/to_wxmp/standard_to_wxmp.js");
            destFileDict = standardToDestTool(eeveeData, {
                env: "WXMP",
                mainClassName: 'entry',
            });
            // debugger
        } else if (n.endsWith('swan')) {
            const standardToDestTool = require("../eevee/_from_standard/to_swan/standard_to_swan.js");
            destFileDict = standardToDestTool(eeveeData, {
                env: "SWAN",
                mainClassName: 'entry',
            });
            // debugger
        } else if (n.endsWith('mvvm')) {
            const standardToDestTool = require("../eevee/_from_standard/to_mvvm/standard_to_mvvm.js");
            destFileDict = standardToDestTool(eeveeData, {
                env: "MVVM",
                mainClassName: 'entry',
            });
            // debugger
        } else if (n.endsWith('react_native')) {
            const standardToDestTool = require("../eevee/_from_standard/to_react_native/standard_to_react_native.js");
            destFileDict = standardToDestTool(eeveeData, {
                env: "RN",
                mainClassName: 'entry',
            });
            // debugger
        } else if (n.endsWith('arkts')) {
            const standardToDestTool = require("../eevee/_from_standard/to_arkts/standard_to_arkts.js");
            destFileDict = standardToDestTool(eeveeData, {
                env: "HARMONY",
                mainClassName: 'entry',
                // functionPath: path.join(__dirname, "../eevee/_from_standard/to_react_native/example_function")
            });
            // debugger
        }


        if (isSaveMode) {

            Object.keys(destFileDict).forEach(
                fn => {
                    let resultFile = path.join(resultPath, fn);
                    let dirToMk = [];
                    let testPath = resultFile;
                    // debugger
                    for (; ;) {
                        testPath = path.dirname(testPath);
                        if (!fs.existsSync(testPath)) {
                            dirToMk.push(testPath);
                        } else {
                            break;
                        }
                    }

                    while (dirToMk.length) {
                        fs.mkdirSync(dirToMk.pop())
                    }

                    fs.writeFileSync(resultFile, destFileDict[fn], "utf8");
                    console.log("save file: " + path.relative(unitTestPath, resultFile));
                }

            )


        } else {

            Object.keys(destFileDict).forEach(
                fn => {
                    let resultFile = path.join(resultPath, fn);

                    if (!fs.existsSync(resultFile)) {
                        console.error("no result file exist: " + resultFile);

                    } else {
                        let resultContent = fs.readFileSync(resultFile, "utf8");
                        let filenameInRel = path.relative(unitTestPath, resultFile);

                        if (resultContent.replace(/\n/g, '\n') !== destFileDict[fn].replace(/\n/g, '\n')) {
                            console.error("file check error: " + filenameInRel)
                        } else {
                            console.log("file check succ: " + filenameInRel)
                        }
                    }

                }

            )


        }



    }
);
// debugger