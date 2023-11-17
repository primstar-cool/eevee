const { parseSync, transformSync } = require('@babel/core');
let options = {
    presets: [
        require("babel-preset-typescript")
    ],
    plugins: [
        require('babel-plugin-syntax-jsx'),
    ]
    // .concat([
    // ])
    ,
    retainLines: true
}

module.exports = function (
    content, filePath
) {

    let cleanCode = transformSync(content, options).code;
    return { ast: parseSync(cleanCode, options), code: cleanCode };
    // let ret2 = parseSync(content, options)

}